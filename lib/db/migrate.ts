import { neon } from '@neondatabase/serverless'

async function migrate() {
  const url = process.env.POSTGRES_URL
  if (!url) {
    console.error('Missing POSTGRES_URL env var')
    process.exit(1)
  }

  const sql = neon(url)

  console.log('Creating tables...')

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      image TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS leagues (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      invite_code TEXT NOT NULL UNIQUE,
      created_by TEXT REFERENCES users(id),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS league_members (
      league_id TEXT NOT NULL REFERENCES leagues(id),
      user_id TEXT NOT NULL REFERENCES users(id),
      joined_at TIMESTAMP DEFAULT NOW(),
      PRIMARY KEY (league_id, user_id)
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS predictions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      league_id TEXT NOT NULL REFERENCES leagues(id),
      match_id TEXT NOT NULL,
      home_goals INTEGER NOT NULL,
      away_goals INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE (user_id, league_id, match_id)
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS tournament_winner_predictions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      league_id TEXT NOT NULL REFERENCES leagues(id),
      team_id TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE (user_id, league_id)
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS admin_overrides (
      id TEXT PRIMARY KEY,
      admin_email TEXT NOT NULL,
      action TEXT NOT NULL,
      target_id TEXT NOT NULL,
      details JSONB,
      reason TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `

  console.log('All tables created successfully.')
}

migrate().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
