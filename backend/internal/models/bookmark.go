package models

import "time"

type Bookmark struct {
	ID          int       `json:"id"`
	UserID      int       `json:"user_id"`
	URL         string    `json:"url"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Category    string    `json:"category"`
	CreatedAt   time.Time `json:"created_at"`
}
