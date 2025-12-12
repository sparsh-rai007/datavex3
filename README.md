# DATAVEX.ai Platform

AI-powered lead generation and marketing platform with full CMS, admin portal, and AI automation capabilities.

## Project Structure

```
.
├── frontend/          # Next.js frontend application
├── backend/           # Node.js/Express API server
├── docker-compose.yml # Docker orchestration
└── README.md
```

## Tech Stack

### Frontend
- Next.js 14+ (React, TypeScript)
- Tailwind CSS
- React Hook Form
- Axios

### Backend
- Node.js/Express
- PostgreSQL
- JWT Authentication
- TypeScript

### Infrastructure
- Docker & Docker Compose
- Nginx (for production)
- GitHub Actions (CI/CD)

## Getting Started

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (or use Docker)

### Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start Docker services (PostgreSQL):**
   ```bash
   npm run docker:up
   ```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env` in both `frontend/` and `backend/` directories
   - Fill in the required values

4. **Run database migrations:**
   ```bash
   cd backend
   npm run migrate
   ```

5. **Start development servers:**
   ```bash
   npm run dev
   ```

### Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both frontend and backend for production
- `npm run docker:up` - Start Docker containers
- `npm run docker:down` - Stop Docker containers
- `npm run docker:logs` - View Docker container logs

## Project Phases

- ✅ Phase 1: Foundation (Current)
- ⏳ Phase 2: Core Features
- ⏳ Phase 3: AI/Automation
- ⏳ Phase 4: Integrations
- ⏳ Phase 5: Testing & Compliance
- ⏳ Phase 6: Deployment & QA

## License

Proprietary - All rights reserved



