import type { LiveScore, TodayScoresResponse } from '@/types/index'

const BASE_URL = 'https://api.football-data.org/v4'
const COMPETITION_CODE = 'WC'

function getApiKey(): string {
  const key = process.env.FOOTBALL_DATA_API_KEY
  if (!key) throw new Error('Missing env: FOOTBALL_DATA_API_KEY')
  return key
}

// Raw shape returned by football-data.org v4 — we only map what we use
interface FdoMatch {
  id: number
  utcDate: string
  status: LiveScore['status']
  minute: number | null
  injuryTime: number | null
  stage: string
  group: string | null
  homeTeam: { id: number; name: string; shortName: string; tla: string; crest: string }
  awayTeam: { id: number; name: string; shortName: string; tla: string; crest: string }
  score: {
    winner: LiveScore['score']['winner']
    fullTime: { home: number | null; away: number | null }
    halfTime: { home: number | null; away: number | null }
  }
}

interface FdoMatchesResponse {
  count: number
  matches: FdoMatch[]
}

async function apiFetch<T>(path: string): Promise<T> {
  // cache: 'no-store' so KV controls caching, not the Next.js fetch cache
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'X-Auth-Token': getApiKey() },
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`football-data.org ${res.status}: ${res.statusText}`)
  }

  return res.json() as Promise<T>
}

/** Fetch today's matches for the WC competition (dateFrom = dateTo = today UTC). */
export async function fetchTodayMatches(): Promise<TodayScoresResponse> {
  const today = new Date().toISOString().split('T')[0]

  const data = await apiFetch<FdoMatchesResponse>(
    `/competitions/${COMPETITION_CODE}/matches?dateFrom=${today}&dateTo=${today}`
  )

  const matches: LiveScore[] = data.matches.map((m) => ({
    id: m.id,
    utcDate: m.utcDate,
    status: m.status,
    minute: m.minute ?? null,
    injuryTime: m.injuryTime ?? null,
    stage: m.stage,
    group: m.group ?? null,
    homeTeam: {
      id: m.homeTeam.id,
      name: m.homeTeam.name,
      shortName: m.homeTeam.shortName,
      tla: m.homeTeam.tla,
      crest: m.homeTeam.crest,
    },
    awayTeam: {
      id: m.awayTeam.id,
      name: m.awayTeam.name,
      shortName: m.awayTeam.shortName,
      tla: m.awayTeam.tla,
      crest: m.awayTeam.crest,
    },
    score: m.score,
  }))

  return { matches, count: matches.length, cachedAt: new Date().toISOString() }
}
