package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"car-recommendation/data"
	"car-recommendation/models"
	"car-recommendation/service"
)

// POST /recommend
func Recommend(c *gin.Context) {
	var prefs models.UserPreferences
	if err := c.ShouldBindJSON(&prefs); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	dataPath := "data/cars_dataset.json"

	cars, err := data.LoadCars(dataPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load car data: " + err.Error()})
		return
	}

	recommendation, err := service.Recommend(cars, prefs)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "recommendation failed: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, recommendation)
}
