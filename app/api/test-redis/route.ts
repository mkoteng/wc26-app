import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

export async function GET() {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })

  try {
    await redis.set('ping', 'pong')
    const value = await redis.get('ping')
    return NextResponse.json({ ok: true, key: 'ping', value })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
