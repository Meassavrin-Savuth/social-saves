package handlers

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"

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

	var gUser GoogleUser
	json.NewDecoder(resp.Body).Decode(&gUser)

	// 3. check if user exists
	var userID int

	err = db.QueryRow(
		"SELECT id FROM users WHERE email=$1",
		gUser.Email,
	).Scan(&userID)

	// 4. if not exist → insert
	if err != nil {

		err = db.QueryRow(
			"INSERT INTO users (name, email, avatar, provider) VALUES ($1, $2, $3, $4) RETURNING id",
			gUser.Name,
			gUser.Email,
			gUser.Picture,
			"google",
		).Scan(&userID)

		if err != nil {
			fmt.Println("DB ERROR:", err)
			c.JSON(500, gin.H{"error": "failed to create user"})
			return
		}
	}

	// 5. generate JWT
	tokenString, err := config.GenerateJWT(userID, gUser.Email, gUser.Name)
	if err != nil {
		c.JSON(500, gin.H{"error": "failed to generate token"})
		return
	}

	// 6. return response
	c.JSON(200, gin.H{
		"message": "login success",
		"token":   tokenString,
		"user": gin.H{
			"id":    userID,
			"name":  gUser.Name,
			"email": gUser.Email,
		},
	})
}
