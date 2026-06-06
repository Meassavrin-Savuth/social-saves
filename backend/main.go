package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"socialsave/config"
	"socialsave/handlers"
	internalHandlers "socialsave/internal/handlers"
	internalMiddleware "socialsave/internal/middleware"
	middleware "socialsave/middle"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

var db *sql.DB

func main() {

	// Load .env file if it exists (for local development only)
	_ = godotenv.Load()

	// Get port from environment (Render sets this automatically)
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// DB connection
	connStr := os.Getenv("DB_URL")

	db, err := sql.Open("postgres", connStr)
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
	frontendURL := config.GetFrontendURL()
	allowedOrigins := map[string]struct{}{
		frontendURL: {},
	}

	if err := r.SetTrustedProxies(nil); err != nil {
		log.Fatal(err)
	}
	r.Use(func(c *gin.Context) {
		origin := c.GetHeader("Origin")

		// Check if the origin is allowed
		_, allowed := allowedOrigins[origin]

		if allowed {
			c.Header("Access-Control-Allow-Origin", origin)
			c.Header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
			c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		}

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

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

	// bookmarks route (uses internal net/http-style handler)
	bookmarkHandler := &internalHandlers.BookmarkHandler{DB: db}
	authHandler := &internalHandlers.AuthHandler{DB: db}
	r.POST("/bookmarks", func(c *gin.Context) {
		internalMiddleware.AuthMiddleware(bookmarkHandler.CreateBookmark).ServeHTTP(c.Writer, c.Request)
	})
	r.GET("/bookmarks", func(c *gin.Context) {
		internalMiddleware.AuthMiddleware(bookmarkHandler.GetBookmarks).ServeHTTP(c.Writer, c.Request)
	})
	r.DELETE("/bookmarks", func(c *gin.Context) {
		internalMiddleware.AuthMiddleware(bookmarkHandler.DeleteBookmark).ServeHTTP(c.Writer, c.Request)
	})
	r.PUT("/bookmarks", func(c *gin.Context) {
		internalMiddleware.AuthMiddleware(bookmarkHandler.UpdateBookmark).ServeHTTP(c.Writer, c.Request)
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
	r.POST("/register", func(c *gin.Context) {
		authHandler.Register(c.Writer, c.Request)
	})
	r.POST("/login", func(c *gin.Context) {
		authHandler.Login(c.Writer, c.Request)
	})
	r.GET("/verify-email", func(c *gin.Context) {
		authHandler.VerifyEmail(c.Writer, c.Request)
	})
	r.POST("/resend-verification", func(c *gin.Context) {
		authHandler.ResendVerification(c.Writer, c.Request)
	})
	r.POST("/forgot-password", func(c *gin.Context) {
		authHandler.ForgotPassword(c.Writer, c.Request)
	})
	r.POST("/reset-password", func(c *gin.Context) {
		authHandler.ResetPassword(c.Writer, c.Request)
	})
	r.GET("/auth/google/login", handlers.GoogleLoginHandler)
	r.GET("/auth/google/callback", handlers.GoogleCallback)

	fmt.Printf("Server running on port %s\n", port)

	if err := r.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}
