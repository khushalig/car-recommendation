package data

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"

	"car-recommendation/models"
)

type carsFile struct {
	Cars []models.Car `json:"cars"`
}

func LoadCars(filePath string) ([]models.Car, error) {
	f, err := os.Open(filePath)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return nil, fmt.Errorf("cars dataset not found: %s", filePath)
		}
		return nil, fmt.Errorf("failed to open cars dataset: %w", err)
	}
	defer f.Close()

	var parsed carsFile
	if err := json.NewDecoder(f).Decode(&parsed); err != nil {
		return nil, fmt.Errorf("failed to parse cars dataset: %w", err)
	}

	if len(parsed.Cars) == 0 {
		return nil, errors.New("cars dataset is empty")
	}

	return parsed.Cars, nil
}
