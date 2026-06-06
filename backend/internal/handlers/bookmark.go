package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"socialsave/internal/database"
	"socialsave/internal/middleware"
	"socialsave/internal/models"
)

type BookmarkHandler struct {
	DB *sql.DB
}

func isValidBookmarkURL(rawURL string) bool {
	parsedURL, err := url.ParseRequestURI(strings.TrimSpace(rawURL))
	if err != nil {
		return false
	}

	return parsedURL.Scheme == "http" || parsedURL.Scheme == "https"
}

func (h *BookmarkHandler) CreateBookmark(w http.ResponseWriter, r *http.Request) {
	var b models.Bookmark

	err := json.NewDecoder(r.Body).Decode(&b)
	if err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	userIDValue := r.Context().Value(middleware.UserIDKey)
	userID, ok := userIDValue.(int)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	if strings.TrimSpace(b.Title) == "" || strings.TrimSpace(b.Category) == "" {
		http.Error(w, "title and category are required", http.StatusBadRequest)
		return
	}

	if !isValidBookmarkURL(b.URL) {
		http.Error(w, "invalid bookmark url", http.StatusBadRequest)
		return
	}

	b.Title = strings.TrimSpace(b.Title)
	b.Category = strings.TrimSpace(b.Category)
	b.URL = strings.TrimSpace(b.URL)
	b.UserID = userID

	created, err := database.CreateBookmark(h.DB, b)
	if err != nil {
		http.Error(w, "failed to create bookmark", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]int{"id": created})
}

func (h *BookmarkHandler) GetBookmarks(w http.ResponseWriter, r *http.Request) {
	userIDValue := r.Context().Value(middleware.UserIDKey)
	userID, ok := userIDValue.(int)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	bookmarks, err := database.GetBookmarks(h.DB, userID)
	if err != nil {
		http.Error(w, "failed to fetch bookmarks", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(bookmarks)
}

func (h *BookmarkHandler) DeleteBookmark(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("id")

	if idStr == "" {
		http.Error(w, "missing id", http.StatusBadRequest)
		return
	}

	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	userIDValue := r.Context().Value(middleware.UserIDKey)
	userID, ok := userIDValue.(int)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	err = database.DeleteBookmark(h.DB, id, userID)
	if err != nil {
		http.Error(w, "failed to delete bookmark", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *BookmarkHandler) UpdateBookmark(w http.ResponseWriter, r *http.Request) {
	var b models.Bookmark

	err := json.NewDecoder(r.Body).Decode(&b)
	if err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	userIDValue := r.Context().Value(middleware.UserIDKey)
	userID, ok := userIDValue.(int)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	if strings.TrimSpace(b.Title) == "" || strings.TrimSpace(b.Category) == "" {
		http.Error(w, "title and category are required", http.StatusBadRequest)
		return
	}

	if !isValidBookmarkURL(b.URL) {
		http.Error(w, "invalid bookmark url", http.StatusBadRequest)
		return
	}

	b.Title = strings.TrimSpace(b.Title)
	b.Category = strings.TrimSpace(b.Category)
	b.URL = strings.TrimSpace(b.URL)
	b.UserID = userID

	err = database.UpdateBookmark(h.DB, b)
	if err != nil {
		http.Error(w, "failed to update bookmark", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
