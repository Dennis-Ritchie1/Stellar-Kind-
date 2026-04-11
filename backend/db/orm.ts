import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/stellar-kind',
})

export async function query(text: string, params?: unknown[]) {
  const result = await pool.query(text, params)
  return result.rows
}

export async function migrate() {
  // Implement schema and migration logic here
}

export async function seed() {
  // Add seed data for campaigns, users, and permissions here
}
