package models


type Recommendation struct {
	Cars         []Car         `json:"cars"`
	Explanations []string `json:"explanations"`
	Summary      string        `json:"summary"`
}
