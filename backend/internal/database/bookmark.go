package database

import (
	"database/sql"
	"socialsave/internal/models"
	"time"
)

func CreateBookmark(db *sql.DB, bookmark models.Bookmark) (int, error) {
	query :=
		`INSERT INTO bookmarks (user_id, url, title, description, category, created_at)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at
	`
	var id int
	var createdAt time.Time

	err := db.QueryRow(
		query,
		bookmark.UserID,
		bookmark.URL,
		bookmark.Title,
		bookmark.Description,
		bookmark.Category,
		time.Now(),
	).Scan(&id, &createdAt)

	return id, err
}

func GetBookmarks(db *sql.DB, userID int) ([]models.Bookmark, error) {
	query := `
		SELECT id, user_id, title, url, description, category, created_at
		FROM bookmarks
		WHERE user_id = $1
		ORDER BY created_at DESC
	`

	rows, err := db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var bookmarks []models.Bookmark

	for rows.Next() {
		var b models.Bookmark

		err := rows.Scan(
			&b.ID,
			&b.UserID,
			&b.Title,
			&b.URL,
			&b.Description,
			&b.Category,
			&b.CreatedAt,
		)

		if err != nil {
			return nil, err
		}

		bookmarks = append(bookmarks, b)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return bookmarks, nil
}

func DeleteBookmark(db *sql.DB, bookmarkID int, userID int) error {
	query := `DELETE FROM bookmarks WHERE id = $1 AND user_id = $2`

	_, err := db.Exec(query, bookmarkID, userID)
	return err
}

func UpdateBookmark(db *sql.DB, bookmark models.Bookmark) error {
	query := `
		UPDATE bookmarks
		SET title = $1, url = $2, description = $3, category = $4
		WHERE id = $5 AND user_id = $6
	`

	_, err := db.Exec(
		query,
		bookmark.Title,
		bookmark.URL,
		bookmark.Description,
		bookmark.Category,
		bookmark.ID,
		bookmark.UserID,
	)

	return err
}
