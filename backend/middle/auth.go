package middleware

import (
	"net/http"
	"os"
	"strings"
	"socialsave/config"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {

		// 1. Get token from header
		authHeader := c.GetHeader("Authorization")

		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "no token provided"})
			c.Abort()
			return
		}

		// 2. Remove "Bearer "
		tokenString := strings.Replace(authHeader, "Bearer ", "", 1)

		// 3. Parse token
		token, err := jwt.ParseWithClaims(tokenString, &config.Claims{}, func(token *jwt.Token) (interface{}, error) {
			return []byte(os.Getenv("JWT_SECRET")), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			c.Abort()
			return
		}

		// 4. Extract claims
		claims := token.Claims.(*config.Claims)

		// 5. Store user in context
		c.Set("user_id", claims.UserID)
		c.Set("email", claims.Email)
		c.Set("name", claims.Name)

		c.Next()
	}
}
