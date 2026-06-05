package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"socialsave/handlers"
	middleware "socialsave/middle"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

var db *sql.DB

func main() {

	// load env
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	// DB connection
	connStr := os.Getenv("DB_URL")

	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}

	err = db.Ping()
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("✅ DB connected")

	handlers.InitDB(db)

	// Gin setup
	r := gin.Default()

	// test route (DB)
	r.GET("/", func(c *gin.Context) {
		var now string
		err := db.QueryRow("SELECT NOW()").Scan(&now)
		if err != nil {
			c.JSON(500, gin.H{"error": "DB error"})
			return
		}

		c.JSON(200, gin.H{
			"message": "API working",
			"time":    now,
		})
	})

		r.GET("/profile", middleware.AuthMiddleware(), func(c *gin.Context) {
			userID := c.GetInt("user_id")
			email := c.GetString("email")
			name := c.GetString("name")

			c.JSON(200, gin.H{
				"user_id": userID,
				"email":   email,
				"name":    name,
			})
		})
	// auth routes
	r.GET("/auth/google/login", handlers.GoogleLoginHandler)
	r.GET("/auth/google/callback", handlers.GoogleCallback)

	fmt.Println("Server running on http://localhost:8080")

	r.Run(":8080")
}
