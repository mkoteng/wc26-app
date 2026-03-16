// Direct file imports — wc26-mcp doesn't expose deep paths in its package exports
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { teams } from '../node_modules/wc26-mcp/dist/data/teams.js'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { matches } from '../node_modules/wc26-mcp/dist/data/matches.js'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { groups } from '../node_modules/wc26-mcp/dist/data/groups.js'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { teamProfiles } from '../node_modules/wc26-mcp/dist/data/team-profiles.js'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { venues } from '../node_modules/wc26-mcp/dist/data/venues.js'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { historicalMatchups } from '../node_modules/wc26-mcp/dist/data/historical-matchups.js'

import type {
  Team,
  Match,
  Group,
  Venue,
  TeamProfile,
  MatchFilter,
  TeamFilter,
  MatchFixture,
  GroupStanding,
  GroupStandingTable,
  HistoricalMatchup,
} from '@/types/index'

export function getTeams(filter?: TeamFilter): Team[] {
  let result = teams
  if (filter?.group) result = result.filter((t) => t.group === filter.group)
  if (filter?.confederation) result = result.filter((t) => t.confederation === filter.confederation)
  if (filter?.is_host !== undefined) result = result.filter((t) => t.is_host === filter.is_host)
  return result
}

export function getTeamById(id: string): Team | undefined {
  return teams.find((t) => t.id === id)
}

export function getTeamProfile(teamId: string): TeamProfile | undefined {
  return teamProfiles.find((p) => p.team_id === teamId)
}

export function getGroups(): Group[] {
  return groups
}

export function getMatches(filter?: MatchFilter): Match[] {
  let result = matches
  if (filter?.date) result = result.filter((m) => m.date === filter.date)
  if (filter?.date_from) result = result.filter((m) => m.date >= filter.date_from!)
  if (filter?.date_to) result = result.filter((m) => m.date <= filter.date_to!)
  if (filter?.team) {
    result = result.filter(
      (m) => m.home_team_id === filter.team || m.away_team_id === filter.team
    )
  }
  if (filter?.venue) result = result.filter((m) => m.venue_id === filter.venue)
  if (filter?.group) result = result.filter((m) => m.group === filter.group)
  if (filter?.round) result = result.filter((m) => m.round === filter.round)
  if (filter?.status) result = result.filter((m) => m.status === filter.status)
  return result
}

export function getMatchById(id: string): Match | undefined {
  return matches.find((m) => m.id === id)
}

export function getTodayMatches(): Match[] {
  const today = new Date().toISOString().split('T')[0]
  return getMatches({ date: today })
}

export function getUpcomingMatches(limit = 10): Match[] {
  const today = new Date().toISOString().split('T')[0]
  return matches
    .filter((m) => m.date >= today && m.status === 'scheduled')
    .slice(0, limit)
}

export function getVenues(): Venue[] {
  return venues as Venue[]
}

export function getVenueById(id: string): Venue | undefined {
  return (venues as Venue[]).find((v: Venue) => v.id === id)
}

function enrichMatch(m: Match): MatchFixture {
  const home = m.home_team_id ? getTeamById(m.home_team_id) : null
  const away = m.away_team_id ? getTeamById(m.away_team_id) : null
  const venue = getVenueById(m.venue_id)

  return {
    id: m.id,
    matchNumber: m.match_number,
    date: m.date,
    timeUtc: m.time_utc,
    utcDateTime: `${m.date}T${m.time_utc}:00Z`,
    round: m.round,
    status: m.status,
    group: m.group,
    venue: venue
      ? { id: venue.id, name: venue.name, city: venue.city, country: venue.country }
      : { id: m.venue_id, name: m.venue_id, city: '', country: '' },
    home: home ? { id: home.id, name: home.name, code: home.code, flagEmoji: home.flag_emoji } : null,
    away: away ? { id: away.id, name: away.name, code: away.code, flagEmoji: away.flag_emoji } : null,
    homePlaceholder: m.home_placeholder,
    awayPlaceholder: m.away_placeholder,
    homeScore: m.home_score,
    awayScore: m.away_score,
  }
}

export function getFixtures(filter?: MatchFilter): MatchFixture[] {
  return getMatches(filter).map(enrichMatch)
}

export function getHistoricalMatchup(teamAId: string, teamBId: string): HistoricalMatchup | undefined {
  return (historicalMatchups as HistoricalMatchup[]).find(
    (m) =>
      (m.team_a === teamAId && m.team_b === teamBId) ||
      (m.team_a === teamBId && m.team_b === teamAId)
  )
}

export function getGroupStandings(): GroupStandingTable[] {
  return (groups as Group[]).map((group) => {
    const groupTeams = group.teams
      .map((id: string) => getTeamById(id))
      .filter((t): t is Team => t !== undefined)

    const groupMatches = getMatches({ group: group.id, round: 'Group Stage' })

    // Seed zeroed standings for every team
    const map = new Map<string, GroupStanding>()
    for (const team of groupTeams) {
      map.set(team.id, {
        team,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      })
    }

    // Accumulate results from completed matches
    for (const m of groupMatches) {
      if (m.status !== 'completed') continue
      if (!m.home_team_id || !m.away_team_id) continue

      const hg = m.home_score ?? 0
      const ag = m.away_score ?? 0
      const home = map.get(m.home_team_id)
      const away = map.get(m.away_team_id)

      if (home) {
        home.played++
        home.goalsFor += hg
        home.goalsAgainst += ag
        if (hg > ag) { home.won++; home.points += 3 }
        else if (hg === ag) { home.drawn++; home.points += 1 }
        else { home.lost++ }
        home.goalDifference = home.goalsFor - home.goalsAgainst
      }
      if (away) {
        away.played++
        away.goalsFor += ag
        away.goalsAgainst += hg
        if (ag > hg) { away.won++; away.points += 3 }
        else if (ag === hg) { away.drawn++; away.points += 1 }
        else { away.lost++ }
        away.goalDifference = away.goalsFor - away.goalsAgainst
      }
    }

    // Sort: Pts → GD → GF → team name (alpha)
    const standings = Array.from(map.values()).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor
      return a.team.name.localeCompare(b.team.name)
    })

    return { groupId: group.id, standings }
  })
}
