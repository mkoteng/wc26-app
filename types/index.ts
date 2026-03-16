// Re-export wc26-mcp types for use across the app
export type {
  Team,
  Match,
  Group,
  Venue,
  MatchRound,
  MatchStatus,
  MatchFilter,
  TeamFilter,
  KeyPlayer,
  TeamProfile,
  WorldCupHistory,
  InjuryReport,
  InjuryStatus,
  OddsEntry,
  TournamentOdds,
  GroupPrediction,
  NewsItem,
  NewsCategory,
  HistoricalMatchup,
} from 'wc26-mcp/types'

// Live scores from football-data.org v4
// Status values: SCHEDULED | TIMED | IN_PLAY | PAUSED | HALFTIME | FINISHED | CANCELLED | POSTPONED | SUSPENDED | AWARDED
export type LiveScoreStatus =
  | 'SCHEDULED'
  | 'TIMED'
  | 'IN_PLAY'
  | 'PAUSED'
  | 'HALFTIME'
  | 'FINISHED'
  | 'CANCELLED'
  | 'POSTPONED'
  | 'SUSPENDED'
  | 'AWARDED'

export interface LiveScoreTeam {
  id: number
  name: string
  shortName: string
  /** FIFA 3-letter code, e.g. "MEX" */
  tla: string
  crest: string
  /** Injected server-side from wc26-mcp by matching tla */
  flagEmoji?: string
  /** wc26-mcp team id — injected server-side for deep-linking to /teams/[id] */
  wc26Id?: string
}

export interface LiveScore {
  id: number
  utcDate: string
  status: LiveScoreStatus
  /** Current match minute — non-null only when IN_PLAY or HALFTIME */
  minute: number | null
  injuryTime: number | null
  stage: string
  group: string | null
  homeTeam: LiveScoreTeam
  awayTeam: LiveScoreTeam
  score: {
    winner: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null
    fullTime: { home: number | null; away: number | null }
    halfTime: { home: number | null; away: number | null }
  }
}

export interface TodayScoresResponse {
  matches: LiveScore[]
  count: number
  cachedAt: string
  /** Set when FOOTBALL_DATA_API_KEY is missing or API call failed */
  error?: string
}

import type { Team as _Team, MatchRound as _MatchRound, MatchStatus as _MatchStatus } from 'wc26-mcp/types'

// Group standings (derived)
export interface GroupStanding {
  team: _Team
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
}

export interface GroupStandingTable {
  groupId: string
  standings: GroupStanding[]
}

// Enriched match with embedded team + venue info — used by fixtures UI and API
export interface MatchFixtureTeam {
  id: string
  name: string
  code: string
  flagEmoji: string
}

export interface MatchFixture {
  id: string
  matchNumber: number
  /** YYYY-MM-DD */
  date: string
  /** HH:MM UTC */
  timeUtc: string
  /** Full ISO-8601 UTC datetime for client-side TZ conversion */
  utcDateTime: string
  round: _MatchRound
  status: _MatchStatus
  group?: string
  venue: {
    id: string
    name: string
    city: string
    country: string
  }
  home: MatchFixtureTeam | null
  away: MatchFixtureTeam | null
  homePlaceholder?: string
  awayPlaceholder?: string
  homeScore?: number
  awayScore?: number
}
