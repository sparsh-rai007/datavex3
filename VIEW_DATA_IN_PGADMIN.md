# How to View Data in pgAdmin

## Current Database Status

✅ **8 tables created** - All tables exist and are properly structured
✅ **1 user created** - Admin user exists in the `users` table

Most tables are empty because we just created the schema. This is normal!

## How to View Data in pgAdmin

### Method 1: Using Query Tool (Recommended)

1. **Right-click on `datavex_dev` database** → **Query Tool**
2. **Run this query to see all users:**
   ```sql
   SELECT id, email, first_name, last_name, role, is_active, created_at 
   FROM users;
   ```
3. **Click Execute** (or press F5)

### Method 2: Browse Tables

1. **Expand `datavex_dev`** → **Schemas** → **public** → **Tables**
2. **Right-click on `users` table** → **View/Edit Data** → **All Rows**
3. You should see the admin user:
   - Email: `admin@datavex.ai`
   - Name: `Admin User`
   - Role: `admin`

## Quick Queries to Run

### View Admin User
```sql
SELECT * FROM users;
```

### Count Rows in Each Table
```sql
SELECT 
  'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'posts', COUNT(*) FROM posts
UNION ALL
SELECT 'leads', COUNT(*) FROM leads
UNION ALL
SELECT 'jobs', COUNT(*) FROM jobs
UNION ALL
SELECT 'job_applications', COUNT(*) FROM job_applications
UNION ALL
SELECT 'refresh_tokens', COUNT(*) FROM refresh_tokens
UNION ALL
SELECT 'post_revisions', COUNT(*) FROM post_revisions
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM audit_logs;
```

### View Table Structures
```sql
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
```

## Expected Results

- **users**: 1 row (admin user)
- **posts**: 0 rows (empty - will be populated when you create content)
- **leads**: 0 rows (empty - will be populated from lead forms)
- **jobs**: 0 rows (empty - will be populated when you post jobs)
- **job_applications**: 0 rows (empty - will be populated when people apply)
- **refresh_tokens**: 0 rows (empty - will be populated when users log in)
- **post_revisions**: 0 rows (empty - will be populated when posts are edited)
- **audit_logs**: 0 rows (empty - will be populated as system is used)

## Next Steps to Add Data

1. **Login to admin panel** - This will create entries in `refresh_tokens` and `audit_logs`
2. **Create posts** - This will add rows to `posts` table
3. **Create leads** - This will add rows to `leads` table
4. **Post jobs** - This will add rows to `jobs` table

---

**Note**: Empty tables are normal! The schema is ready, and data will be added as you use the application.



