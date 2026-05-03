package models

// Valid values for FuelType: "petrol", "diesel", "cng", "electric", "hybrid"
// Valid values for BodyType: "hatchback", "sedan", "suv", "mpv"
// Valid values for Usage: "city", "highway", "mixed", "offroad"
// Valid values for Priority: "mileage", "safety", "performance", "comfort", "features"

type Budget struct {
	Min int `json:"min" binding:"min=0"`
	Max int `json:"max" binding:"required,min=0"`
}

type UserPreferences struct {
	Budget           Budget   `json:"budget" binding:"required"`
	FuelTypes        []string `json:"fuel_types"`
	BodyTypes        []string `json:"body_types"`
	Usage            string   `json:"usage" binding:"oneof=city highway mixed offroad"`
	Priorities       []string `json:"priorities"`
	SeatingCapacity  int      `json:"seating_capacity" binding:"min=0,max=9"`
}
