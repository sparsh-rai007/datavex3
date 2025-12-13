# Quick Start Guide - Database Connection

## ✅ Answer: No manual database creation needed!

Docker will **automatically create** the `datavex_dev` database when you start the container.

## Step-by-Step Setup

### 1. Start Docker (Auto-creates database)

```bash
npm run docker:up
```

Wait for the container to be healthy. The `datavex_dev` database is created automatically.

### 2. Create Backend Environment File

```bash
cd backend
cp env.example .env
```

The `.env` file already has the correct credentials:
- Database: `datavex_dev`
- User: `postgres`
- Password: `sparsh@123`

### 3. Test Database Connection

```bash
# From backend directory
npm run test:connection
```

You should see:
```
✅ Connection successful
✅ Database Information:
   Database: datavex_dev
   User: postgres
   ...
```

### 4. Run Migrations (Creates tables)

```bash
npm run migrate
```

### 5. Start Backend Server

```bash
npm run dev
```

Check console for: `✅ PostgreSQL connected`

### 6. Test via API

Open browser or use curl:
```
http://localhost:5000/api/health/db
```

## pgAdmin Connection Setup

### Connect to PostgreSQL

1. **Open pgAdmin**
2. **Right-click "Servers" → Create → Server**

**General Tab:**
- Name: `DATAVEX Local`

**Connection Tab:**
- Host: `localhost`
- Port: `5432`
- Database: `postgres` (for initial connection)
- Username: `postgres`
- Password: `sparsh@123`
- ☑ Save password

3. **Click Save**

### Verify Database

1. Expand your server → Databases
2. You should see `datavex_dev` database
3. After migrations, expand `datavex_dev` → Schemas → public → Tables
4. You should see: users, posts, leads, jobs, etc.

## Connection Details

```
Host: localhost
Port: 5432
Username: postgres
Password: sparsh@123
Database: datavex_dev
```

## Troubleshooting

### Can't connect?
```bash
# Check if Docker is running
docker ps

# Check container logs
docker logs datavex-postgres

# Restart container
docker-compose restart postgres
```

### Database not found?
The database is auto-created. If you don't see it:
```bash
# Restart Docker
docker-compose down
docker-compose up -d
```

### Test connection manually
```bash
# Using Docker
docker exec -it datavex-postgres psql -U postgres -d datavex_dev -c "SELECT version();"
```

## Next Steps

After connection is verified:
1. ✅ Run migrations: `npm run migrate`
2. ✅ Start backend: `npm run dev`
3. ✅ Start frontend: `cd ../frontend && npm run dev`
4. ✅ Access admin: http://localhost:3000/admin/login

---

**That's it!** The database is automatically created - no manual steps needed.




