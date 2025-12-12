import { pool, testConnection, connectDB } from '../src/db/connection';
import dotenv from 'dotenv';

dotenv.config();

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...\n');

  try {
    // Test basic connection
    console.log('1. Testing basic connection...');
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.error('❌ Connection test failed');
      process.exit(1);
    }
    console.log('✅ Connection successful\n');

    // Get database info
    console.log('2. Fetching database information...');
    const dbInfo = await pool.query(`
      SELECT 
        current_database() as database,
        version() as version,
        current_user as user,
        inet_server_addr() as server_address,
        inet_server_port() as server_port
    `);

    const info = dbInfo.rows[0];
    console.log('✅ Database Information:');
    console.log(`   Database: ${info.database}`);
    console.log(`   User: ${info.user}`);
    console.log(`   Server: ${info.server_address || 'localhost'}:${info.server_port || '5432'}`);
    console.log(`   Version: ${info.version.split(' ')[0]} ${info.version.split(' ')[1]}\n`);

    // Check tables
    console.log('3. Checking tables...');
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    if (tables.rows.length > 0) {
      console.log(`✅ Found ${tables.rows.length} table(s):`);
      tables.rows.forEach((row) => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.log('ℹ️  No tables found (run migrations first)');
    }

    console.log('\n✅ All connection tests passed!');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Connection test failed:');
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code || 'N/A'}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Tip: Make sure PostgreSQL is running:');
      console.error('   - Docker: npm run docker:up');
      console.error('   - Or start your local PostgreSQL service');
    } else if (error.code === '28P01') {
      console.error('\n💡 Tip: Check your credentials in backend/.env');
    } else if (error.code === '3D000') {
      console.error('\n💡 Tip: Database does not exist. Create it or use Docker to auto-create.');
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run test
testDatabaseConnection();



