import { NextResponse } from 'next/server'
import { withCache } from '@/lib/cache'
import { fetchTodayMatches } from '@/lib/football-data'
import { getTeams } from '@/lib/wc26'
import type { TodayScoresResponse, LiveScore } from '@/types/index'

const CACHE_KEY = 'scores:today'
const CACHE_TTL = 60 // seconds

/** Match football-data.org TLA codes → wc26-mcp flag emoji + team id. */
function enrichMatches(matches: LiveScore[]): LiveScore[] {
  const teams = getTeams()
  const byCode = new Map(teams.map((t) => [t.code.toUpperCase(), t]))

  return matches.map((m) => {
    const homeWc26 = byCode.get(m.homeTeam.tla.toUpperCase())
    const awayWc26 = byCode.get(m.awayTeam.tla.toUpperCase())
    return {
      ...m,
      homeTeam: {
        ...m.homeTeam,
        flagEmoji: homeWc26?.flag_emoji ?? '🏳',
        wc26Id: homeWc26?.id,
      },
      awayTeam: {
        ...m.awayTeam,
        flagEmoji: awayWc26?.flag_emoji ?? '🏳',
        wc26Id: awayWc26?.id,
      },
    }
  })
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
        return { ...result, matches: enrichMatches(result.matches) }
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
    return NextResponse.json(fallback, { status: 500 })
  }
}
