package llm

import (
	"encoding/json"
	"strings"
)

const carRecomPrompt = `You are a car recommendation assistant.
User preferences: {{preferences}}
Shortlisted cars: {{cars_json}}
For each car: Give a 2-3 line explaination
Then provide a final recommendation summary.
Be concise and polite
Return json:
{
"explanations" : ["...", "..."],
"summary": "..."
}`

// BuildPrompt fills the {{preferences}} and {{cars_json}} placeholders.
// preferences and cars are marshalled to JSON so the model sees structured data.
func BuildPrompt(preferences any, cars any) (string, error) {
	prefsJSON, err := json.Marshal(preferences)
	if err != nil {
		return "", err
	}

	carsJSON, err := json.Marshal(cars)
	if err != nil {
		return "", err
	}

	p := strings.ReplaceAll(carRecomPrompt, "{{preferences}}", string(prefsJSON))
	p = strings.ReplaceAll(p, "{{cars_json}}", string(carsJSON))
	return p, nil
}