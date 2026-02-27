import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
})

export async function query(text: string, params?: any[]) {
  const client = await pool.connect()
  try { return await client.query(text, params) }
  finally { client.release() }
}

export async function initDB() {
  await query(`CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'User' CHECK (role IN ('Owner','Admin','User')),
    status VARCHAR(20) DEFAULT 'Aktif' CHECK (status IN ('Aktif','Tidak Aktif')),
    email_verified BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
  )`)
  await query(`CREATE TABLE IF NOT EXISTS login_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    email VARCHAR(255), ip_address VARCHAR(50),
    status VARCHAR(20), keterangan TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  )`)
  await query(`CREATE TABLE IF NOT EXISTS pdfs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'fx-basic',
    thumbnail VARCHAR(10) DEFAULT '📄',
    views INTEGER DEFAULT 0,
    downloads INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`)
  await query(`CREATE TABLE IF NOT EXISTS otp_resets (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    expired_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT false,
    attempt INTEGER DEFAULT 0,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
  )`)
  await query(`CREATE TABLE IF NOT EXISTS user_favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    pdf_id INTEGER REFERENCES pdfs(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, pdf_id)
  )`)
  await query(`CREATE TABLE IF NOT EXISTS user_downloads (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    pdf_id INTEGER REFERENCES pdfs(id) ON DELETE CASCADE,
    downloaded_at TIMESTAMP DEFAULT NOW()
  )`)
}
