package models

import "time"

type User struct {
	ID                       int        `json:"id"`
	Email                    string     `json:"email"`
	Password                 string     `json:"password,omitempty"`
	Name                     *string    `json:"name,omitempty"`
	VerifiedAt               *time.Time `json:"verified_at,omitempty"`
	VerificationToken        *string    `json:"verification_token,omitempty"`
	VerificationTokenExpires *time.Time `json:"verification_token_expires,omitempty"`
	ResetPasswordToken       *string    `json:"reset_password_token,omitempty"`
	ResetPasswordExpires     *time.Time `json:"reset_password_expires,omitempty"`
	CreatedAt                time.Time  `json:"created_at"`
}

