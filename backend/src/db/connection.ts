// import { Pool, PoolConfig } from 'pg';
// import dotenv from 'dotenv';

// dotenv.config();

// const poolConfig: PoolConfig = {
//   user: process.env.POSTGRES_USER || 'postgres',
//   password: process.env.POSTGRES_PASSWORD || 'sparsh@123',
//   host: process.env.POSTGRES_HOST || 'localhost',
//   port: parseInt(process.env.POSTGRES_PORT || '5433', 10),
//   database: process.env.POSTGRES_DB || 'datavex_dev',
//   max: 20,
//   idleTimeoutMillis: 30000,
//   connectionTimeoutMillis: 2000,
// };

// // Use DATABASE_URL if provided (for production)
// if (process.env.DATABASE_URL) {
//   poolConfig.connectionString = process.env.DATABASE_URL;
// }

// export const pool = new Pool(poolConfig);

// pool.on('error', (err) => {
//   console.error('Unexpected error on idle client', err);
//   process.exit(-1);
// });

// export const connectDB = async (): Promise<void> => {
//   try {
//     const client = await pool.connect();
//     console.log('✅ PostgreSQL connected');
//     client.release();
//   } catch (error) {
//     console.error('❌ Database connection error:', error);
//     throw error;
//   }
// };

// // Test query
// export const testConnection = async (): Promise<boolean> => {
//   try {
//     const result = await pool.query('SELECT NOW()');
//     return !!result.rows[0];
//   } catch (error) {
//     console.error('Database test failed:', error);
//     return false;
//   }
// };



import { Pool, PoolConfig } from "pg";
import dotenv from "dotenv";

dotenv.config();

// Detect production mode
const isProduction = process.env.NODE_ENV === "production";

// Base config (local development defaults)
const poolConfig: PoolConfig = {
  user: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASSWORD || "sparsh@123",
  host: process.env.POSTGRES_HOST || "localhost",
  port: parseInt(process.env.POSTGRES_PORT || "5433", 10),
  database: process.env.POSTGRES_DB || "datavex_dev",
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

// If DATABASE_URL exists → use it (production on Render)
if (process.env.DATABASE_URL) {
  poolConfig.connectionString = process.env.DATABASE_URL;

  // Render PostgreSQL **requires** SSL
  poolConfig.ssl = { rejectUnauthorized: false };
} else {
  // Local development → no SSL
  poolConfig.ssl = false;
}

// Create PostgreSQL pool
export const pool = new Pool(poolConfig);

pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client", err);
  process.exit(-1);
});

// Connect & verify
export const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log("✅ PostgreSQL connected");
    client.release();
  } catch (error) {
    console.error("❌ Database connection error:", error);
    throw error;
  }
};


