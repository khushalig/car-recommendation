package main

import (
	"net/http"
	"os"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"car-recommendation/handlers"
)

func main() {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     allowedOrigins(),
		AllowMethods:     []string{"POST", "GET", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: false,
	}))

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	r.POST("/recommend", handlers.Recommend)

	r.Run(":8080")
}

// allowedOrigins reads CORS_ORIGINS env var (comma-separated).
// Falls back to localhost:5173 (Vite dev server) if not set.
func allowedOrigins() []string {
	if raw := os.Getenv("CORS_ORIGINS"); raw != "" {
		return strings.Split(raw, ",")
	}
	return []string{"http://localhost:5173"}
}
