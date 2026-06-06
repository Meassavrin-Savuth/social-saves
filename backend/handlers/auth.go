package handlers

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"

	"socialsave/config"

	"github.com/gin-gonic/gin"
	"golang.org/x/oauth2"
)

var db *sql.DB

func InitDB(database *sql.DB) {
	db = database
}

type GoogleUser struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Picture string `json:"picture"`
}

// 🔹 LOGIN (redirect to Google)
func GoogleLoginHandler(c *gin.Context) {
	oauth := config.GetGoogleOAuthConfig()

	url := oauth.AuthCodeURL("random-state", oauth2.AccessTypeOffline)

	c.Redirect(http.StatusTemporaryRedirect, url)
}

// 🔹 CALLBACK (STEP 6)
func GoogleCallback(c *gin.Context) {
	code := c.Query("code")

	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "no code"})
		return
	}

	oauth := config.GetGoogleOAuthConfig()

	// 1. exchange code for token
	token, err := oauth.Exchange(context.Background(), code)
	if err != nil {
		c.JSON(500, gin.H{"error": "token exchange failed"})
		return
	}

	// 2. get google user info
	client := oauth.Client(context.Background(), token)

	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		c.JSON(500, gin.H{"error": "failed to get user"})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		c.JSON(http.StatusBadGateway, gin.H{"error": "failed to fetch user info"})
		return
	}

	var gUser GoogleUser
	if err := json.NewDecoder(resp.Body).Decode(&gUser); err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "invalid user info response"})
		return
	}

	if gUser.Email == "" {
		c.JSON(http.StatusBadGateway, gin.H{"error": "missing google email"})
		return
	}

	// 3. check if user exists
	var userID int

	err = db.QueryRow(
		"SELECT id FROM users WHERE email=$1",
		gUser.Email,
	).Scan(&userID)

	// 4. if not exist → insert
	if errors.Is(err, sql.ErrNoRows) {

		err = db.QueryRow(
			"INSERT INTO users (email, password, created_at, verified_at) VALUES ($1, $2, NOW(), NOW()) RETURNING id",
			gUser.Email,
			"",
		).Scan(&userID)

		if err != nil {
			fmt.Println("DB ERROR:", err)
			c.JSON(500, gin.H{"error": "failed to create user"})
			return
		}
	} else if err == nil {
		// If user exists but not verified, mark as verified
		_, err = db.Exec("UPDATE users SET verified_at = NOW() WHERE id = $1 AND verified_at IS NULL", userID)
		if err != nil {
			fmt.Println("DB ERROR:", err)
		}
	} else {
		fmt.Println("DB ERROR:", err)
		c.JSON(500, gin.H{"error": "failed to load user"})
		return
	}

	// 5. generate JWT
	tokenString, err := config.GenerateJWT(userID, gUser.Email, gUser.Name)
	if err != nil {
		c.JSON(500, gin.H{"error": "failed to generate token"})
		return
	}

	// 6. redirect back to frontend with token
	frontendURL := config.GetFrontendURL() + "/login?token=" + url.QueryEscape(tokenString)
	c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(fmt.Sprintf(`
<!doctype html>
<html>
	<head>
		<meta charset="utf-8" />
		<meta http-equiv="refresh" content="0;url=%[1]s" />
		<script>
			window.location.replace(%[2]q);
		</script>
	</head>
	<body>
		Redirecting...
	</body>
</html>
`, frontendURL, frontendURL)))
}
