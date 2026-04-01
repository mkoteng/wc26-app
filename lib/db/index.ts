import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

function getDbUrl(): string {
  const url = process.env.POSTGRES_URL
  if (!url) throw new Error('Missing env: POSTGRES_URL')
  return url
}

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null

export function getDb() {
  if (!_db) {
    const sql = neon(getDbUrl())
    _db = drizzle(sql, { schema })
  }
  return _db
}
