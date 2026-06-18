import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import bcrypt from 'bcryptjs';
import { pool } from './connection';
import dotenv from 'dotenv';
import { migrateEmployees } from './migrate-employees';
import { migrateProducts } from './migrate-products';

dotenv.config();


async function migrate() {
  const client = await pool.connect();

  try {
    console.log('🔄 Running database migrations...');

    // Read schema file
    let schemaPath = join(__dirname, 'schema.sql');
    if (!existsSync(schemaPath)) {
      schemaPath = join(process.cwd(), 'src', 'db', 'schema.sql');
    }
    const schema = readFileSync(schemaPath, 'utf-8');

    // Execute schema
    await pool.query(schema);



    console.log('✅ Database migrations completed successfully');

    // Add AI blog generation columns (idempotent)
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'blogs' AND column_name = 'generation_method'
        ) THEN
          ALTER TABLE blogs ADD COLUMN generation_method VARCHAR(20) DEFAULT 'manual';
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'blogs' AND column_name = 'source_reference'
        ) THEN
          ALTER TABLE blogs ADD COLUMN source_reference TEXT;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'blogs' AND column_name = 'type'
        ) THEN
          ALTER TABLE blogs ADD COLUMN type VARCHAR(30) DEFAULT 'blog';
        END IF;
      END $$;
    `);
    console.log('✅ Blog generation columns ensured');

    // Add blog engagement tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS blog_views (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        blog_id UUID NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
        visitor_hash VARCHAR(64) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(blog_id, visitor_hash)
      );

      CREATE TABLE IF NOT EXISTS blog_likes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        blog_id UUID NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
        visitor_hash VARCHAR(64) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(blog_id, visitor_hash)
      );
    `);
    console.log('✅ Blog engagement tables ensured');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS newsletters (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'sent')),
        sent_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Newsletters table ensured");

    await pool.query(`
  CREATE TABLE IF NOT EXISTS social_credentials (
    id SERIAL PRIMARY KEY,
    platform VARCHAR(30) NOT NULL,     -- linkedin, reddit, instagram
    client_id TEXT,
    client_secret TEXT,
    access_token TEXT,
    refresh_token TEXT,
    page_id TEXT,                      -- Instagram Business
    ig_user_id TEXT,                   -- Instagram Business Account ID
    user_id UUID REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT NOW()
  );
`);
    console.log("✅ Social credentials table added");
    // Create default admin user if it doesn't exist
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@datavex.ai';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const checkAdmin = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [adminEmail]
    );

    if (checkAdmin.rows.length === 0) {
      await client.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [adminEmail, hashedPassword, 'Admin', 'User', 'admin', true]
      );
      console.log(`✅ Default admin user created: ${adminEmail} / ${adminPassword}`);
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Run employee specific migrations
    await migrateEmployees();

    // Run product specific migrations
    await migrateProducts();

    // Clean up duplicate job applications and create unique index on (job_id, LOWER(email))
    console.log('🔄 Cleaning up duplicate job applications and establishing unique constraint...');
    await client.query(`
      DELETE FROM job_applications
      WHERE id IN (
        SELECT id
        FROM (
          SELECT id, ROW_NUMBER() OVER (PARTITION BY job_id, LOWER(email) ORDER BY created_at ASC) as row_num
          FROM job_applications
        ) t
        WHERE t.row_num > 1
      );
    `);
    await client.query(`
      DROP INDEX IF EXISTS idx_job_applications_job_id_email;
      CREATE UNIQUE INDEX IF NOT EXISTS idx_job_applications_job_id_lower_email ON job_applications(job_id, LOWER(email));
    `);
    console.log('✅ Unique constraint on job_applications(job_id, LOWER(email)) verified/created');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run migrations if called directly
if (require.main === module) {
  migrate()
    .then(() => {
      console.log('Migration process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration process failed:', error);
      process.exit(1);
    });
}

export { migrate };
