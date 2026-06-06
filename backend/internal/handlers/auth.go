package handlers

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/mail"
	"os"
	"socialsave/config"
	"socialsave/internal/auth"
	"socialsave/internal/email"
	"socialsave/internal/models"
	"socialsave/internal/utils"
	"strings"
	"time"

	"github.com/lib/pq"
)

func isValidEmail(emailStr string) bool {
	addr, err := mail.ParseAddress(emailStr)
	if err != nil {
		return false
	}
	// Check that the address contains both @ and a domain
	parts := []rune(addr.Address)
	atIndex := -1
	for i, r := range parts {
		if r == '@' {
			atIndex = i
			break
		}
	}
	if atIndex == -1 || atIndex == len(parts)-1 {
		return false
	}
	// Check that domain has at least one dot
	domainPart := string(parts[atIndex+1:])
	hasDot := false
	for _, r := range domainPart {
		if r == '.' {
			hasDot = true
			break
		}
	}
	return hasDot
}

func normalizeEmail(email string) string {
	return strings.ToLower(strings.TrimSpace(email))
}

type AuthHandler struct {
	DB *sql.DB
}

func getFrontendURL() string {
	return config.GetFrontendURL()
}

func isUniqueViolation(err error) bool {
	var pqErr *pq.Error
	if errors.As(err, &pqErr) {
		return string(pqErr.Code) == "23505"
	}

	return false
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var user models.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if user.Email == "" || user.Password == "" {
		http.Error(w, "email and password required", http.StatusBadRequest)
		return
	}

	user.Email = normalizeEmail(user.Email)
	user.Password = strings.TrimSpace(user.Password)

	if !isValidEmail(user.Email) {
		http.Error(w, "invalid email address", http.StatusBadRequest)
		return
	}

	hashedPassword, err := auth.HashPassword(user.Password)
	if err != nil {
		http.Error(w, "error hashing password", http.StatusInternalServerError)
		return
	}

	// Generate verification token
	verificationToken, err := utils.GenerateRandomToken(32)
	if err != nil {
		http.Error(w, "error generating token", http.StatusInternalServerError)
		return
	}
	verificationExpires := time.Now().Add(24 * time.Hour)

	// return the created id and created_at timestamp
	query := `
		INSERT INTO users (email, password, verification_token, verification_token_expires) 
		VALUES ($1, $2, $3, $4) 
		RETURNING id, created_at
	`
	err = h.DB.QueryRow(query, user.Email, hashedPassword, verificationToken, verificationExpires).Scan(&user.ID, &user.CreatedAt)

	if err != nil {
		if isUniqueViolation(err) {
			http.Error(w, "user already exists", http.StatusBadRequest)
			return
		}

		fmt.Println("register failed:", err)
		http.Error(w, "failed to create account", http.StatusInternalServerError)
		return
	}

	// Send verification email
	verifyLink := getFrontendURL() + "/verify-email?token=" + verificationToken

	emailBody := `
		<h1>Verify your email</h1>
		<p>Click the link below to verify your email:</p>
		<a href="` + verifyLink + `">` + verifyLink + `</a>
	`

	// Log verification link to console for development
	if os.Getenv("RESEND_API_KEY") == "" {
		fmt.Printf("\n=== VERIFICATION LINK ===\n%s\n=========================\n", verifyLink)
	}

	go func() {
		err := email.SendEmail(user.Email, "Verify your email for SocialSave", emailBody)
		if err != nil {
			fmt.Println("Error sending email:", err)
		}
	}()

	user.Password = ""

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var input models.User

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	input.Email = normalizeEmail(input.Email)
	input.Password = strings.TrimSpace(input.Password)

	if !isValidEmail(input.Email) {
		http.Error(w, "invalid email address", http.StatusBadRequest)
		return
	}

	var storedUser models.User
	var verifiedAt sql.NullTime

	query := `SELECT id, email, password, verified_at FROM users WHERE email = $1`
	err := h.DB.QueryRow(query, input.Email).Scan(
		&storedUser.ID,
		&storedUser.Email,
		&storedUser.Password,
		&verifiedAt,
	)

	if err != nil {
		if err != sql.ErrNoRows {
			fmt.Println("login failed:", err)
		}
		http.Error(w, "user not found", http.StatusUnauthorized)
		return
	}

	// Check if email is verified
	if !verifiedAt.Valid {
		http.Error(w, "email not verified", http.StatusUnauthorized)
		return
	}

	if strings.TrimSpace(storedUser.Password) == "" {
		http.Error(w, "account uses Google login or needs a password reset", http.StatusUnauthorized)
		return
	}

	// check password
	if !auth.CheckPassword(storedUser.Password, input.Password) {
		http.Error(w, "invalid password", http.StatusUnauthorized)
		return
	}

	// generate JWT
	token, err := config.GenerateJWT(storedUser.ID, storedUser.Email, "")
	if err != nil {
		http.Error(w, "failed to generate token", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	json.NewEncoder(w).Encode(map[string]interface{}{
		"token":   token,
		"user_id": storedUser.ID,
	})
}

func (h *AuthHandler) VerifyEmail(w http.ResponseWriter, r *http.Request) {
	token := r.URL.Query().Get("token")
	if token == "" {
		http.Error(w, "missing token", http.StatusBadRequest)
		return
	}

	var userID int
	var expiresAt time.Time

	query := `SELECT id, verification_token_expires FROM users WHERE verification_token = $1`
	err := h.DB.QueryRow(query, token).Scan(&userID, &expiresAt)

	if err != nil {
		http.Error(w, "invalid or expired token", http.StatusBadRequest)
		return
	}

	if time.Now().After(expiresAt) {
		http.Error(w, "token expired", http.StatusBadRequest)
		return
	}

	// Verify the email
	_, err = h.DB.Exec(`
		UPDATE users 
		SET verified_at = $1, verification_token = NULL, verification_token_expires = NULL 
		WHERE id = $2
	`, time.Now(), userID)

	if err != nil {
		http.Error(w, "failed to verify email", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "email verified successfully"})
}

func (h *AuthHandler) ResendVerification(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	if !isValidEmail(req.Email) {
		http.Error(w, "invalid email", http.StatusBadRequest)
		return
	}

	var userID int
	var verifiedAt sql.NullTime

	query := `SELECT id, verified_at FROM users WHERE email = $1`
	err := h.DB.QueryRow(query, req.Email).Scan(&userID, &verifiedAt)
	if err != nil {
		// Don't reveal if the user exists or not
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"message": "if email exists, verification link sent"})
		return
	}

	if verifiedAt.Valid {
		// Already verified
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"message": "email already verified"})
		return
	}

	// Generate new verification token
	newToken, err := utils.GenerateRandomToken(32)
	if err != nil {
		http.Error(w, "error generating token", http.StatusInternalServerError)
		return
	}
	newExpires := time.Now().Add(24 * time.Hour)

	// Update user with new token
	_, err = h.DB.Exec(`
		UPDATE users 
		SET verification_token = $1, verification_token_expires = $2 
		WHERE id = $3
	`, newToken, newExpires, userID)

	if err != nil {
		http.Error(w, "failed to update token", http.StatusInternalServerError)
		return
	}

	// Send email
	verifyLink := getFrontendURL() + "/verify-email?token=" + newToken
	emailBody := `
		<h1>Verify your email</h1>
		<p>Click the link below to verify your email:</p>
		<a href="` + verifyLink + `">` + verifyLink + `</a>
	`

	// Log verification link to console for development
	if os.Getenv("RESEND_API_KEY") == "" {
		fmt.Printf("\n=== RESEND VERIFICATION LINK ===\n%s\n=================================\n", verifyLink)
	}

	go func() {
		err := email.SendEmail(req.Email, "Verify your email for SocialSave", emailBody)
		if err != nil {
			fmt.Println("Error sending email:", err)
		}
	}()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "if email exists, verification link sent"})
}

func (h *AuthHandler) ForgotPassword(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	if !isValidEmail(req.Email) {
		http.Error(w, "invalid email", http.StatusBadRequest)
		return
	}

	var userID int

	query := `SELECT id FROM users WHERE email = $1`
	err := h.DB.QueryRow(query, req.Email).Scan(&userID)
	if err != nil {
		// Don't reveal if user exists
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"message": "if email exists, password reset link sent"})
		return
	}

	// Generate reset token
	resetToken, err := utils.GenerateRandomToken(32)
	if err != nil {
		http.Error(w, "error generating token", http.StatusInternalServerError)
		return
	}
	resetExpires := time.Now().Add(1 * time.Hour)

	_, err = h.DB.Exec(`
		UPDATE users 
		SET reset_password_token = $1, reset_password_expires = $2 
		WHERE id = $3
	`, resetToken, resetExpires, userID)

	if err != nil {
		http.Error(w, "failed to update token", http.StatusInternalServerError)
		return
	}

	// Send email
	resetLink := getFrontendURL() + "/reset-password?token=" + resetToken
	emailBody := `
		<h1>Reset your password</h1>
		<p>Click the link below to reset your password:</p>
		<a href="` + resetLink + `">` + resetLink + `</a>
		<p>This link expires in 1 hour.</p>
	`

	// Log reset link to console for development
	if os.Getenv("RESEND_API_KEY") == "" {
		fmt.Printf("\n=== PASSWORD RESET LINK ===\n%s\n===========================\n", resetLink)
	}

	go func() {
		err := email.SendEmail(req.Email, "Reset your password for SocialSave", emailBody)
		if err != nil {
			fmt.Println("Error sending email:", err)
		}
	}()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "if email exists, password reset link sent"})
}

func (h *AuthHandler) ResetPassword(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Token    string `json:"token"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	if req.Token == "" || req.Password == "" {
		http.Error(w, "token and password required", http.StatusBadRequest)
		return
	}

	var userID int
	var expiresAt time.Time

	query := `SELECT id, reset_password_expires FROM users WHERE reset_password_token = $1`
	err := h.DB.QueryRow(query, req.Token).Scan(&userID, &expiresAt)
	if err != nil {
		http.Error(w, "invalid or expired token", http.StatusBadRequest)
		return
	}

	if time.Now().After(expiresAt) {
		http.Error(w, "token expired", http.StatusBadRequest)
		return
	}

	// Hash new password
	hashedPassword, err := auth.HashPassword(req.Password)
	if err != nil {
		http.Error(w, "error hashing password", http.StatusInternalServerError)
		return
	}

	// Update password and clear reset token
	_, err = h.DB.Exec(`
		UPDATE users 
		SET password = $1, reset_password_token = NULL, reset_password_expires = NULL 
		WHERE id = $2
	`, hashedPassword, userID)

	if err != nil {
		http.Error(w, "failed to reset password", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "password reset successfully"})
}
