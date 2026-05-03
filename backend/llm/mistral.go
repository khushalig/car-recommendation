package llm

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"
)

const (
	mistralAPIURL = "https://api.mistral.ai/v1/chat/completions"
	mistralModel  = "mistral-small"
	requestTimeout = 30 * time.Second
)

// request / response shapes

type chatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type chatRequest struct {
	Model    string        `json:"model"`
	Messages []chatMessage `json:"messages"`
}

type chatChoice struct {
	Message chatMessage `json:"message"`
}

type chatResponse struct {
	Choices []chatChoice `json:"choices"`
	Error   *mistralError `json:"error,omitempty"`
}

type mistralError struct {
	Message string `json:"message"`
	Type    string `json:"type"`
}

// Chat sends prompt to the Mistral API and returns the assistant's reply text.
func Chat(prompt string) (string, error) {
	apiKey := os.Getenv("MISTRAL_API_KEY")
	if apiKey == "" {
		return "", fmt.Errorf("MISTRAL_API_KEY environment variable is not set")
	}

	body, err := json.Marshal(chatRequest{
		Model: mistralModel,
		Messages: []chatMessage{
			{Role: "user", Content: prompt},
		},
	})
	if err != nil {
		return "", fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequest(http.MethodPost, mistralAPIURL, bytes.NewReader(body))
	if err != nil {
		return "", fmt.Errorf("failed to build request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	client := &http.Client{Timeout: requestTimeout}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("request to Mistral API failed: %w", err)
	}
	defer resp.Body.Close()

	var result chatResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", fmt.Errorf("failed to decode Mistral response (status %d): %w", resp.StatusCode, err)
	}

	if resp.StatusCode != http.StatusOK {
		if result.Error != nil {
			return "", fmt.Errorf("mistral API error [%s] (status %d): %s", result.Error.Type, resp.StatusCode, result.Error.Message)
		}
		return "", fmt.Errorf("mistral API returned unexpected status %d", resp.StatusCode)
	}

	if len(result.Choices) == 0 {
		return "", fmt.Errorf("mistral returned an empty choices list")
	}
	return result.Choices[0].Message.Content, nil
}
