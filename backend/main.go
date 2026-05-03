package main

import (
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"

	"car-recommendation/handlers"
)

func main() {
	r := gin.Default()

	r.Use(corsMiddleware())

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	r.OPTIONS("/recommend", func(c *gin.Context) { c.Status(http.StatusNoContent) })
	r.POST("/recommend", handlers.Recommend)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	r.Run(":" + port)
}

func corsMiddleware() gin.HandlerFunc {
	allowed := allowedOrigins()

	return func(c *gin.Context) {
		origin := strings.TrimRight(c.Request.Header.Get("Origin"), "/")

		for _, o := range allowed {
			if origin == strings.TrimRight(o, "/") {
				c.Header("Access-Control-Allow-Origin", origin)
				c.Header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
				c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept")
				c.Header("Access-Control-Max-Age", "86400")
				break
			}
		}

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

// allowedOrigins reads CORS_ORIGINS env var (comma-separated).
// Falls back to localhost:5173 (Vite dev server) if not set.
func allowedOrigins() []string {
	if raw := os.Getenv("CORS_ORIGINS"); raw != "" {
		origins := strings.Split(raw, ",")
		for i, o := range origins {
			origins[i] = strings.TrimSpace(o)
		}
		return origins
	}
	return []string{"http://localhost:5173"}
}
