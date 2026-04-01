import { Redis } from '@upstash/redis'

let _redis: Redis | null = null

function getRedis(): Redis | null {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) return null
  if (!_redis) {
    try {
      _redis = new Redis({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
      })
    } catch {
      return null
    }
  }
  return _redis
}

export async function getCached<T>(key: string): Promise<T | null> {
  const redis = getRedis()
  if (!redis) return null
  try {
    const cached = await redis.get<T>(key)
    return cached ?? null
  } catch {
    return null
  }
}

export async function setCached<T>(key: string, value: T, ttlSeconds = 60): Promise<void> {
  const redis = getRedis()
  if (!redis) return
  try {
    await redis.set(key, value, { ex: ttlSeconds })
  } catch {
    // Non-fatal — proceed without caching
  }
}

export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds = 60
): Promise<T> {
  const cached = await getCached<T>(key)
  if (cached !== null) return cached
  const fresh = await fetcher()
  await setCached(key, fresh, ttlSeconds)
  return fresh
}

export async function deleteCached(key: string): Promise<void> {
  const redis = getRedis()
  if (!redis) return
  try {
    await redis.del(key)
  } catch {
    // Non-fatal
  }
}

export async function clearKeysByPattern(pattern: string): Promise<number> {
  const redis = getRedis()
  if (!redis) return 0
  try {
    const keys = await redis.keys(pattern)
    if (keys.length === 0) return 0
    await redis.del(...keys)
    return keys.length
  } catch {
    return 0
  }
}
