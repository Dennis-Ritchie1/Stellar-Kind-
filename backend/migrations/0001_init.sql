-- Initial database schema for Stellar-Kind backend

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  wallet_address TEXT,
  role TEXT NOT NULL,
  reputation INTEGER DEFAULT 0,
  kyc_verified BOOLEAN DEFAULT FALSE,
  badges TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  creator_id TEXT NOT NULL REFERENCES users(id),
  goal_amount NUMERIC(20, 7) NOT NULL,
  current_amount NUMERIC(20, 7) DEFAULT 0,
  currency TEXT DEFAULT 'USDC' NOT NULL,
  status TEXT DEFAULT 'draft' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS milestones (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id),
  title TEXT NOT NULL,
  amount NUMERIC(20, 7) NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
