import { readFileSync } from 'fs';
import { join } from 'path';
import bcrypt from 'bcryptjs';
import { pool } from './connection';
import dotenv from 'dotenv';

dotenv.config();

async function migrate() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Running database migrations...');
    
    // Read schema file
    const schemaPath = join(__dirname, 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    
    // Execute schema
    await client.query(schema);
    
    console.log('✅ Database migrations completed successfully');
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

