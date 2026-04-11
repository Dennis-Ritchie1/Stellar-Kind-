import { query } from './orm'

export async function seedDatabase() {
  await query(`INSERT INTO users (id, email, role) VALUES ('user-1', 'admin@stellar-kind.org', 'admin') ON CONFLICT DO NOTHING`)
  await query(`INSERT INTO campaigns (id, title, description, status) VALUES ('campaign-1', 'Stellar Launch', 'Launch campaign on Soroban', 'active') ON CONFLICT DO NOTHING`)
}
