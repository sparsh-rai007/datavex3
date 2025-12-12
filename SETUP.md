# Phase 1 Setup Guide

This guide will help you set up the DATAVEX platform foundation.

## Prerequisites

- Node.js 18+ installed
- Docker and Docker Compose installed
- Git installed

## Step-by-Step Setup

### 1. Install Dependencies

From the project root:

```bash
npm install
```

This will install dependencies for both frontend and backend workspaces.

### 2. Configure Environment Variables

#### Backend Environment

Create `backend/.env` file:

```bash
cd backend
cp env.example .env
```

Edit `backend/.env` and update the following values:
- `JWT_SECRET`: Generate a strong random string (min 32 characters)
- `JWT_REFRESH_SECRET`: Generate another strong random string (min 32 characters)
- Database credentials are pre-configured (postgres / sparsh@123)

#### Frontend Environment

Create `frontend/.env.local` file:

```bash
cd ../frontend
cp .env.example .env.local
```

Edit `frontend/.env.local`:
- `NEXT_PUBLIC_API_URL`: Should point to your backend (default: http://localhost:5000)

### 3. Start Docker Services

From the project root:

```bash
npm run docker:up
```

This will start PostgreSQL in a Docker container. Wait for it to be healthy.

### 4. Run Database Migrations

```bash
cd backend
npm run migrate
```

This will:
- Create all database tables
- Set up indexes and triggers
- Create a default admin user (admin@datavex.ai / Admin@123)

### 5. Start Development Servers

From the project root:

```bash
npm run dev
```

This starts both:
- Backend API on http://localhost:5000
- Frontend Next.js app on http://localhost:3000

### 6. Access the Application

- **Homepage**: http://localhost:3000
- **Admin Login**: http://localhost:3000/admin/login
- **Admin Dashboard**: http://localhost:3000/admin/dashboard

**Default Admin Credentials:**
- Email: `admin@datavex.ai`
- Password: `Admin@123`

⚠️ **Important**: Change the default admin password after first login in production!

## Project Structure

```
.
├── backend/              # Node.js/Express API
│   ├── src/
│   │   ├── db/          # Database connection & migrations
│   │   ├── middleware/  # Auth, error handling, rate limiting
│   │   ├── routes/      # API routes
│   │   └── utils/       # JWT utilities
│   └── package.json
├── frontend/             # Next.js frontend
│   ├── app/             # Next.js app directory
│   │   ├── admin/       # Admin pages
│   │   └── ...
│   ├── lib/             # API client & auth context
│   └── package.json
├── docker-compose.yml    # Docker orchestration
└── package.json         # Root workspace config
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Admin (Protected)
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/posts` - List posts

## Database Schema

The schema includes:
- **users**: User accounts with roles (admin, editor, recruiter, viewer)
- **refresh_tokens**: JWT refresh token storage
- **posts**: CMS content posts
- **post_revisions**: Post revision history
- **leads**: Lead generation data
- **jobs**: Job postings
- **job_applications**: Job applications with resume parsing
- **audit_logs**: System audit trail

## Troubleshooting

### Database Connection Issues

1. Ensure Docker is running: `docker ps`
2. Check PostgreSQL container: `docker logs datavex-postgres`
3. Verify environment variables in `backend/.env`

### Port Already in Use

- Backend (5000): Change `PORT` in `backend/.env`
- Frontend (3000): Change port in `frontend/package.json` dev script
- PostgreSQL (5432): Change port mapping in `docker-compose.yml`

### Migration Errors

If migrations fail:
1. Check database connection
2. Ensure PostgreSQL is healthy: `docker ps`
3. Try dropping and recreating: `docker-compose down -v` then `docker-compose up -d`

## Next Steps

Phase 1 is complete! You now have:
- ✅ Monorepo structure
- ✅ Docker setup with PostgreSQL
- ✅ Backend API with JWT authentication
- ✅ Database schema
- ✅ Next.js frontend with admin login
- ✅ Basic CMS scaffold

Ready for **Phase 2**: Core Features (public site, full CMS, lead management, etc.)

