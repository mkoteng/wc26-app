import { NextResponse } from 'next/server'
import { withCache } from '@/lib/cache'
import { fetchTodayMatches } from '@/lib/football-data'
import { getTeams } from '@/lib/wc26'
import type { TodayScoresResponse, LiveScore } from '@/types/index'

const CACHE_KEY = 'scores:today'
const CACHE_TTL = 60 // seconds

/** Match football-data.org TLA codes → wc26-mcp flag emojis. */
function enrichWithFlags(matches: LiveScore[]): LiveScore[] {
  const teams = getTeams()
  const flagByCode = new Map(teams.map((t) => [t.code.toUpperCase(), t.flag_emoji]))

  return matches.map((m) => ({
    ...m,
    homeTeam: {
      ...m.homeTeam,
      flagEmoji: flagByCode.get(m.homeTeam.tla.toUpperCase()) ?? '🏳',
    },
    awayTeam: {
      ...m.awayTeam,
      flagEmoji: flagByCode.get(m.awayTeam.tla.toUpperCase()) ?? '🏳',
    },
  }))
}

export async function GET() {
  // Check for API key up front — return empty payload with a clear error, not a 500
  if (!process.env.FOOTBALL_DATA_API_KEY) {
    const empty: TodayScoresResponse = {
      matches: [],
      count: 0,
      cachedAt: new Date().toISOString(),
      error: 'FOOTBALL_DATA_API_KEY is not configured',
    }
    return NextResponse.json(empty)
  }

  try {
    const data = await withCache<TodayScoresResponse>(
      CACHE_KEY,
      async () => {
        const result = await fetchTodayMatches()
        return { ...result, matches: enrichWithFlags(result.matches) }
      },
      CACHE_TTL
    )

    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    const fallback: TodayScoresResponse = {
      matches: [],
      count: 0,
      cachedAt: new Date().toISOString(),
      error: message,
    }
    // Return 200 with error payload so the UI can degrade gracefully
    return NextResponse.json(fallback)
  }
}
