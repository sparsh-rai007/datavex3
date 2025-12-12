# Database Connection Fix

## Issue Found

You have a **local PostgreSQL service** running on your Windows machine (`postgresql-x64-18`) that's also using port 5432. This causes the connection test to connect to your local PostgreSQL instead of the Docker container.

## Solution Applied

I've changed the Docker container to use **port 5433** instead of 5432 to avoid the conflict.

## What Changed

1. **docker-compose.yml**: Changed port mapping from `5432:5432` to `5433:5432`
2. **backend/env.example**: Updated default port to 5433
3. **backend/src/db/connection.ts**: Updated default port to 5433

## Next Steps

### 1. Update your `.env` file

If you have a `backend/.env` file, update it:

```env
POSTGRES_PORT=5433
DATABASE_URL=postgresql://postgres:sparsh@123@localhost:5433/datavex_dev
```

### 2. Restart Docker containers

```bash
npm run docker:down
npm run docker:up
```

### 3. Test the connection

```bash
cd backend
npm run test:connection
```

## Alternative Solutions

If you prefer to use port 5432:

### Option A: Stop Local PostgreSQL Service

```powershell
Stop-Service postgresql-x64-18
```

Then change the port back to 5432 in docker-compose.yml.

### Option B: Create Database in Local PostgreSQL

If you want to use your local PostgreSQL instead of Docker:

1. Connect to local PostgreSQL
2. Create database: `CREATE DATABASE datavex_dev;`
3. Update `.env` to use local PostgreSQL credentials

## pgAdmin Connection

For pgAdmin, use:
- **Host**: `localhost`
- **Port**: `5433` (for Docker) or `5432` (for local)
- **Database**: `datavex_dev`
- **Username**: `postgres`
- **Password**: `sparsh@123`

---

**Note**: The database in Docker container is accessible on port 5433 now, while your local PostgreSQL remains on 5432.



