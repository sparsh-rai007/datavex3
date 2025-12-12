# Database Connection Guide

## Quick Answer: Do you need to manually create the database?

**No!** Docker will automatically create the `datavex_dev` database when you start the PostgreSQL container. However, if you're connecting to an existing PostgreSQL instance (not Docker), you may need to create it manually.

## Option 1: Using Docker (Recommended - Auto-creates database)

### Step 1: Start Docker Container

```bash
npm run docker:up
```

This will automatically:
- Create a PostgreSQL container
- Create the `datavex_dev` database
- Set up user `postgres` with password `sparsh@123`

### Step 2: Verify Database Creation

The database is created automatically. You can verify by connecting:

```bash
# Connect to PostgreSQL container
docker exec -it datavex-postgres psql -U postgres -d datavex_dev

# Or check databases
docker exec -it datavex-postgres psql -U postgres -c "\l"
```

### Step 3: Test Connection from Backend

```bash
# Start the backend server
cd backend
npm run dev
```

The server will automatically connect to the database. Check the console for:
```
✅ PostgreSQL connected
```

### Step 4: Test via API Endpoint

Once the backend is running, test the database connection:

```bash
curl http://localhost:5000/api/health/db
```

Or open in browser: http://localhost:5000/api/health/db

You should see:
```json
{
  "status": "connected",
  "database": "datavex_dev",
  "version": "PostgreSQL 15.x",
  "user": "postgres",
  "server": "localhost:5432",
  "tables": 0,
  "timestamp": "2024-..."
}
```

## Option 2: Using pgAdmin (For GUI Management)

### Step 1: Connect to PostgreSQL Server

1. Open pgAdmin
2. Right-click on "Servers" → "Create" → "Server"

### Step 2: Configure Connection

**General Tab:**
- Name: `DATAVEX Local` (or any name you prefer)

**Connection Tab:**
- Host name/address: `localhost`
- Port: `5432`
- Maintenance database: `postgres`
- Username: `postgres`
- Password: `sparsh@123`
- ☑ Save password

Click **Save**

### Step 3: Create Database (if not using Docker)

If you're connecting to a PostgreSQL instance that doesn't auto-create databases:

1. In pgAdmin, expand your server
2. Right-click on "Databases" → "Create" → "Database"
3. Database name: `datavex_dev`
4. Owner: `postgres`
5. Click **Save**

### Step 4: Verify Connection

1. Expand `datavex_dev` database
2. Expand "Schemas" → "public"
3. After running migrations, you should see tables:
   - users
   - refresh_tokens
   - posts
   - leads
   - jobs
   - etc.

## Option 3: Manual Database Creation (If needed)

If you need to create the database manually via command line:

### Using psql (Local PostgreSQL)

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE datavex_dev;

# Grant privileges (if needed)
GRANT ALL PRIVILEGES ON DATABASE datavex_dev TO postgres;

# Exit
\q
```

### Using Docker Exec

```bash
# Connect to PostgreSQL container
docker exec -it datavex-postgres psql -U postgres

# Create database (if it doesn't exist)
CREATE DATABASE datavex_dev;

# Exit
\q
```

## Connection Details Summary

### Docker Container
- **Host**: `localhost` (from your machine) or `postgres` (from Docker network)
- **Port**: `5432`
- **Username**: `postgres`
- **Password**: `sparsh@123`
- **Database**: `datavex_dev`

### Connection String Format

```
postgresql://postgres:sparsh@123@localhost:5432/datavex_dev
```

### For Backend (.env file)

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=sparsh@123
POSTGRES_DB=datavex_dev
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
DATABASE_URL=postgresql://postgres:sparsh@123@localhost:5432/datavex_dev
```

## Testing the Connection

### Method 1: Backend Health Check API

```bash
# Start backend
cd backend
npm run dev

# In another terminal
curl http://localhost:5000/api/health/db
```

### Method 2: Direct Database Query

```bash
# Using Docker
docker exec -it datavex-postgres psql -U postgres -d datavex_dev -c "SELECT version();"

# Using local psql
psql -U postgres -d datavex_dev -c "SELECT version();"
```

### Method 3: pgAdmin Query Tool

1. Connect to server in pgAdmin
2. Right-click on `datavex_dev` → "Query Tool"
3. Run: `SELECT version();`
4. Click Execute (F5)

## Troubleshooting

### Connection Refused

**Problem**: Can't connect to PostgreSQL

**Solutions**:
1. Check if Docker container is running: `docker ps`
2. Check container logs: `docker logs datavex-postgres`
3. Verify port 5432 is not in use: `netstat -an | grep 5432`

### Authentication Failed

**Problem**: Wrong password

**Solutions**:
1. Verify password in `backend/.env` matches `sparsh@123`
2. Check docker-compose.yml environment variables
3. Reset container: `docker-compose down -v && docker-compose up -d`

### Database Does Not Exist

**Problem**: Database `datavex_dev` not found

**Solutions**:
1. If using Docker, restart container: `docker-compose restart postgres`
2. Create manually (see Option 3 above)
3. Check environment variable `POSTGRES_DB` in docker-compose.yml

### Connection from Backend Fails

**Problem**: Backend can't connect to database

**Solutions**:
1. Verify `backend/.env` file exists and has correct values
2. Check if database is running: `docker ps`
3. Test connection manually first
4. Check backend logs for specific error messages

## Next Steps

After verifying the connection:

1. **Run migrations**:
   ```bash
   cd backend
   npm run migrate
   ```

2. **Verify tables created**:
   ```bash
   docker exec -it datavex-postgres psql -U postgres -d datavex_dev -c "\dt"
   ```

3. **Start development**:
   ```bash
   npm run dev
   ```

---

**Note**: The database `datavex_dev` will be automatically created when you start the Docker container. No manual creation needed unless you're using a non-Docker PostgreSQL instance.



