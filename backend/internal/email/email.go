package email

import (
	"fmt"
	"os"

	"github.com/resend/resend-go/v2"
)

func SendEmail(to, subject, body string) error {
	apiKey := os.Getenv("RESEND_API_KEY")
	from := os.Getenv("SMTP_FROM")
	if from == "" {
		from = "onboarding@resend.dev" // Resend's default sender
	}

	// If no API key, just log to console for development
	if apiKey == "" {
		fmt.Println("\n=== DEVELOPMENT MODE: Email not sent (Resend API key not configured) ===")
		fmt.Printf("Subject: %s\n", subject)
		fmt.Printf("Body:\n%s\n", body)
		fmt.Println("=== END OF EMAIL ===\n")
		return nil
	}

	client := resend.NewClient(apiKey)
	params := &resend.SendEmailRequest{
		From:    from,
		To:      []string{to},
		Subject: subject,
		Html:    body,
	}

	resp, err := client.Emails.Send(params)
	if err != nil {
		fmt.Printf("Error sending email via Resend: %v\n", err)
		return err
	}

	fmt.Printf("Email sent successfully. Resend ID: %s\n", resp.Id)
	return nil
}
