import { pool } from './connection';

async function migrateEmployees() {
  const client = await pool.connect();
  try {
    console.log('🔄 Running employee and leave migrations...');

    // 1. Update user_role enum to include 'employee'
    // PostgreSQL doesn't allow adding to enum in a transaction easily in older versions, 
    // but check if it's there first.
    await client.query(`
      ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'employee';
    `);
    console.log('✅ Role "employee" added to user_role enum');

    // 2. Add employee-specific columns to users table
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS department VARCHAR(100);
    `);
    console.log('✅ Employee columns added to users table');

    // 3. Create leaves table
    await client.query(`
      CREATE TABLE IF NOT EXISTS leaves (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        reason TEXT,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Leaves table created');

    // 4. Create index for performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_leaves_user_id ON leaves(user_id);
      CREATE INDEX IF NOT EXISTS idx_leaves_status ON leaves(status);
    `);
    console.log('✅ Indexes created for leaves table');

    console.log('✅ Employee and leave migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  migrateEmployees()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { migrateEmployees };
