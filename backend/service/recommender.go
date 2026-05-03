package service

import (
	"encoding/json"
	"fmt"
	"sort"
	"strings"

	"car-recommendation/llm"
	"car-recommendation/models"
)

const topN = 3

type scoredCar struct {
	car   models.Car
	score float64
}

func Recommend(cars []models.Car, prefs models.UserPreferences) (models.Recommendation, error) {
	filtered := filterCars(cars, prefs)
	if len(filtered) == 0 {
		return models.Recommendation{
			Summary: "No cars found matching your preferences. Try adjusting your filters.",
		}, nil
	}

	scored := scoreCars(filtered, prefs)
	sort.Slice(scored, func(i, j int) bool {
		return scored[i].score > scored[j].score
	})

	top := scored
	if len(top) > topN {
		top = top[:topN]
	}

	return buildRecommendation(top, prefs)
}

// filterCars applies each preference as a filter; all non-empty criteria must match.
func filterCars(cars []models.Car, prefs models.UserPreferences) []models.Car {
	var result []models.Car
	for _, car := range cars {
		if !withinBudget(car, prefs.Budget) {
			continue
		}
		if prefs.SeatingCapacity > 0 && car.Specs.SeatingCapacity < prefs.SeatingCapacity {
			continue
		}
		if len(prefs.FuelTypes) > 0 && !containsIgnoreCase(prefs.FuelTypes, car.FuelType) {
			continue
		}
		if len(prefs.BodyTypes) > 0 && !containsIgnoreCase(prefs.BodyTypes, car.BodyType) {
			continue
		}
		result = append(result, car)
	}
	return result
}

func withinBudget(car models.Car, budget models.Budget) bool {
	if budget.Min > 0 && car.PriceINR < budget.Min {
		return false
	}
	if budget.Max > 0 && car.PriceINR > budget.Max {
		return false
	}
	return true
}

func containsIgnoreCase(slice []string, val string) bool {
	for _, s := range slice {
		if strings.EqualFold(s, val) {
			return true
		}
	}
	return false
}

// effectiveMileage returns mileage for ICE/CNG cars, or range/10 for EVs as a comparable proxy.
func effectiveMileage(car models.Car) float64 {
	if car.MileageKmpl != nil {
		return *car.MileageKmpl
	}
	if car.RangeKm != nil {
		return float64(*car.RangeKm) / 10.0
	}
	return 0
}

// scoreCars assigns a weighted score [0, 1] to each car based on priority.
//
// Weights by priority:
//
//	mileage  → mileage 0.60 | safety 0.20 | price efficiency 0.20
//	safety   → mileage 0.20 | safety 0.60 | price efficiency 0.20
//	balanced → mileage 0.33 | safety 0.34 | price efficiency 0.33
func scoreCars(cars []models.Car, prefs models.UserPreferences) []scoredCar {
	wMileage, wSafety, wPrice := weightsFor(prefs)

	minMileage, maxMileage, minPrice, maxPrice := rangeStats(cars)

	result := make([]scoredCar, len(cars))
	for i, car := range cars {
		mileageScore := normalise(effectiveMileage(car), minMileage, maxMileage)
		safetyScore := float64(car.SafetyRating-1) / 4.0 // rating 1–5 → 0.0–1.0
		priceScore := normaliseInverse(float64(car.PriceINR), float64(minPrice), float64(maxPrice))

		result[i] = scoredCar{
			car:   car,
			score: wMileage*mileageScore + wSafety*safetyScore + wPrice*priceScore,
		}
	}
	return result
}

func weightsFor(prefs models.UserPreferences) (wMileage, wSafety, wPrice float64) {
	primary := ""
	if len(prefs.Priorities) > 0 {
		primary = strings.ToLower(prefs.Priorities[0])
	}
	switch primary {
	case "mileage":
		return 0.60, 0.20, 0.20
	case "safety":
		return 0.20, 0.60, 0.20
	default:
		return 0.33, 0.34, 0.33
	}
}

func rangeStats(cars []models.Car) (minMileage, maxMileage float64, minPrice, maxPrice int) {
	minMileage = effectiveMileage(cars[0])
	maxMileage = minMileage
	minPrice = cars[0].PriceINR
	maxPrice = minPrice

	for _, car := range cars[1:] {
		if m := effectiveMileage(car); m < minMileage {
			minMileage = m
		} else if m > maxMileage {
			maxMileage = m
		}
		if car.PriceINR < minPrice {
			minPrice = car.PriceINR
		} else if car.PriceINR > maxPrice {
			maxPrice = car.PriceINR
		}
	}
	return
}

// normalise maps val into [0, 1] where higher is better.
func normalise(val, min, max float64) float64 {
	if max == min {
		return 1.0
	}
	return (val - min) / (max - min)
}

// normaliseInverse maps val into [0, 1] where lower original value scores higher (cheaper = better).
func normaliseInverse(val, min, max float64) float64 {
	if max == min {
		return 1.0
	}
	return (max - val) / (max - min)
}

type llmResponse struct {
	Explanations []string `json:"explanations"`
	Summary      string   `json:"summary"`
}

func buildRecommendation(top []scoredCar, prefs models.UserPreferences) (models.Recommendation, error) {
	cars := make([]models.Car, len(top))
	for i, sc := range top {
		cars[i] = sc.car
	}

	prompt, err := llm.BuildPrompt(prefs, cars)
	if err != nil {
		return models.Recommendation{}, fmt.Errorf("failed to build prompt: %w", err)
	}

	raw, err := llm.Chat(prompt)
	if err != nil {
		return models.Recommendation{}, fmt.Errorf("LLM call failed: %w", err)
	}

	// strip markdown code fences if Mistral wraps the JSON
	raw = strings.TrimSpace(raw)
	if strings.HasPrefix(raw, "```") {
		raw = raw[strings.Index(raw, "\n")+1:]
		raw = strings.TrimSuffix(strings.TrimSpace(raw), "```")
		raw = strings.TrimSpace(raw)
	}

	var parsed llmResponse
	if err := json.Unmarshal([]byte(raw), &parsed); err != nil {
		return models.Recommendation{}, fmt.Errorf("failed to parse LLM response as JSON: %w", err)
	}

	if len(parsed.Explanations) != len(cars) {
		return models.Recommendation{}, fmt.Errorf(
			"LLM returned %d explanations for %d cars", len(parsed.Explanations), len(cars),
		)
	}
	if parsed.Summary == "" {
		return models.Recommendation{}, fmt.Errorf("LLM returned an empty summary")
	}

	return models.Recommendation{
		Cars:         cars,
		Explanations: parsed.Explanations,
		Summary:      parsed.Summary,
	}, nil
}
