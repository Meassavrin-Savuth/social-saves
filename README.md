# SocialSave

A modern bookmark manager with a clean, focused workspace.

## 🚀 Quick Start

### Prerequisites
- Node.js 22+ (for frontend)
- Go 1.25+ (for backend)
- PostgreSQL 16+
- Docker (optional, for containerized deployment)

### Local Development

#### Backend
```bash
cd backend

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your configuration

# Start the backend
go run main.go
```

#### Frontend
```bash
cd frontend

# Copy and configure environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Install dependencies and start dev server
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Docker Compose (Recommended)
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down
```

## 📦 Deployment

### Frontend Deployment (Vercel)
1. Push your code to GitHub/GitLab
2. Import project into Vercel
3. Add environment variable: `NEXT_PUBLIC_API_URL`
4. Deploy!

### Backend Deployment (Railway/Render)
1. Push your code to GitHub/GitLab
2. Import backend project
3. Add environment variables:
   - `DB_URL`
   - `FRONTEND_URL`
   - `JWT_SECRET`
   - (Optional) `RESEND_API_KEY`, `SMTP_FROM`
   - (Optional) `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URL`
4. Deploy!

### Database Setup
Run the SQL migration file to set up your database:
```sql
-- Run backend/migrations/001_add_email_verification_and_reset.sql
```

## 🛠️ Environment Variables

### Backend
- `DB_URL` - PostgreSQL connection string
- `FRONTEND_URL` - URL of your frontend (for CORS and email links)
- `JWT_SECRET` - Secret key for JWT tokens
- (Optional) `RESEND_API_KEY` - For email verification
- (Optional) `SMTP_FROM` - Sender email address
- (Optional) `GOOGLE_CLIENT_ID` - Google OAuth client ID
- (Optional) `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- (Optional) `GOOGLE_REDIRECT_URL` - Google OAuth callback URL

### Frontend
- `NEXT_PUBLIC_API_URL` - URL of your backend API

## 📚 Features

- 🔐 Secure authentication with JWT
- 📧 Email verification
- 🔑 Password reset
- 🔗 Google OAuth login
- 📝 Bookmark management (CRUD)
- 🏷️ Category organization
- 🔍 Search functionality
- 🎨 Clean, dark theme UI

## 🧑‍💻 Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4
- **Backend**: Go, Gin Web Framework
- **Database**: PostgreSQL
- **Auth**: JWT, OAuth2
