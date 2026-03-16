import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const cached = await redis.get<T>(key)
    return cached ?? null
  } catch {
    return null
  }
}

export async function setCached<T>(key: string, value: T, ttlSeconds = 60): Promise<void> {
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
