package models

type CarSpecs struct {
	EngineCC          *int     `json:"engine_cc,omitempty"`
	PowerBHP          float64  `json:"power_bhp"`
	TorqueNm          float64  `json:"torque_nm"`
	SeatingCapacity   int      `json:"seating_capacity"`
	BootSpaceLitres   int      `json:"boot_space_litres"`
	LengthMm          int      `json:"length_mm"`
	WidthMm           int      `json:"width_mm"`
	HeightMm          int      `json:"height_mm"`
	GroundClearanceMm int      `json:"ground_clearance_mm"`
	BatteryKwh        *float64 `json:"battery_kwh,omitempty"`
	FastChargingMin   *int     `json:"fast_charging_min,omitempty"`
}

type Car struct {
	ID           int      `json:"id"`
	Make         string   `json:"make"`
	Model        string   `json:"model"`
	Variant      string   `json:"variant"`
	PriceINR     int      `json:"price_inr"`
	BodyType     string   `json:"body_type"`
	FuelType     string   `json:"fuel_type"`
	Transmission string   `json:"transmission"`
	MileageKmpl  *float64 `json:"mileage_kmpl"`
	RangeKm      *int     `json:"range_km,omitempty"`
	SafetyRating int      `json:"safety_rating"`
	Specs        CarSpecs `json:"specs"`
	UserReviews  []string `json:"user_reviews"`
}
