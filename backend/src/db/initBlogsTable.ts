import { pool } from "./connection";

export async function initBlogsTable() {
  const sql = `
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    CREATE TABLE IF NOT EXISTS blogs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      excerpt TEXT,
      content TEXT,
      featured_image TEXT,
      meta_title VARCHAR(255),
      meta_description TEXT,
      meta_keywords TEXT,
      status VARCHAR(20) DEFAULT 'draft',
      author_id UUID REFERENCES users(id) ON DELETE SET NULL,
      external_url TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `;

  try {
    await pool.query(sql);
    console.log("✅ Blogs table initialized");
  } catch (err) {
    console.error("❌ Failed to initialize blogs table:", err);
  }
}
