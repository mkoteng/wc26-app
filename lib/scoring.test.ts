import { describe, it, expect } from 'vitest'
import { calculatePoints, calculateTournamentWinnerPoints, calculateStandings } from './scoring'
import type { LeagueMember, Prediction, TournamentWinnerPrediction } from '@/types/predictions'

describe('calculatePoints', () => {
  it('gives 3 points for exact score', () => {
    expect(calculatePoints({ homeGoals: 2, awayGoals: 1 }, { homeGoals: 2, awayGoals: 1 })).toBe(3)
  })

  it('gives 1 point for correct outcome — home win', () => {
    expect(calculatePoints({ homeGoals: 1, awayGoals: 0 }, { homeGoals: 3, awayGoals: 1 })).toBe(1)
  })

  it('gives 1 point for correct outcome — away win', () => {
    expect(calculatePoints({ homeGoals: 0, awayGoals: 2 }, { homeGoals: 1, awayGoals: 4 })).toBe(1)
  })

  it('gives 1 point for correct draw', () => {
    expect(calculatePoints({ homeGoals: 1, awayGoals: 1 }, { homeGoals: 0, awayGoals: 0 })).toBe(1)
  })

  it('gives 0 points for wrong outcome', () => {
    expect(calculatePoints({ homeGoals: 2, awayGoals: 0 }, { homeGoals: 0, awayGoals: 1 })).toBe(0)
  })

  it('gives 0 points when predicted home win but result is draw', () => {
    expect(calculatePoints({ homeGoals: 2, awayGoals: 1 }, { homeGoals: 1, awayGoals: 1 })).toBe(0)
  })
})

describe('calculateTournamentWinnerPoints', () => {
  it('gives 5 points for correct winner', () => {
    expect(calculateTournamentWinnerPoints('brazil', 'brazil')).toBe(5)
  })

  it('gives 0 points for wrong winner', () => {
    expect(calculateTournamentWinnerPoints('argentina', 'brazil')).toBe(0)
  })

  it('gives 0 points if no prediction made', () => {
    expect(calculateTournamentWinnerPoints(null, 'brazil')).toBe(0)
  })

  it('gives 0 points if actual winner not yet known (null)', () => {
    expect(calculateTournamentWinnerPoints('brazil', null)).toBe(0)
  })
})

describe('calculateStandings', () => {
  const members: LeagueMember[] = [
    { userId: 'u1', name: 'Alice', image: null, joinedAt: null },
    { userId: 'u2', name: 'Bob', image: null, joinedAt: null },
    { userId: 'u3', name: 'Carol', image: null, joinedAt: null },
  ]

  const makePrediction = (
    userId: string,
    matchId: string,
    homeGoals: number,
    awayGoals: number
  ): Prediction => ({
    id: `${userId}-${matchId}`,
    userId,
    leagueId: 'league1',
    matchId,
    homeGoals,
    awayGoals,
    createdAt: null,
    updatedAt: null,
  })

  const makeWinnerPrediction = (userId: string, teamId: string): TournamentWinnerPrediction => ({
    id: `winner-${userId}`,
    userId,
    leagueId: 'league1',
    teamId,
    createdAt: null,
    updatedAt: null,
  })

  it('sorts by points descending', () => {
    const predictions = [
      makePrediction('u1', 'm1', 2, 1), // exact = 3pts
      makePrediction('u2', 'm1', 1, 0), // correct outcome = 1pt
      makePrediction('u3', 'm1', 0, 3), // wrong = 0pts
    ]
    const results = new Map([['m1', { homeGoals: 2, awayGoals: 1 }]])
    const standings = calculateStandings(members, predictions, results, [], null)
    expect(standings[0].userId).toBe('u1')
    expect(standings[1].userId).toBe('u2')
    expect(standings[2].userId).toBe('u3')
    expect(standings[0].points).toBe(3)
    expect(standings[1].points).toBe(1)
    expect(standings[2].points).toBe(0)
  })

  it('breaks ties by exact scores', () => {
    const predictions = [
      makePrediction('u1', 'm1', 1, 0), // correct outcome = 1pt
      makePrediction('u2', 'm1', 2, 1), // exact = 3pts
      makePrediction('u3', 'm1', 1, 0), // correct outcome = 1pt (but no exact)
      makePrediction('u1', 'm2', 1, 1), // exact = 3pts  → u1 total: 4pts, 1 exact
      makePrediction('u3', 'm2', 1, 0), // wrong = 0pts  → u3 total: 1pt, 0 exact
    ]
    const results = new Map([
      ['m1', { homeGoals: 2, awayGoals: 1 }],
      ['m2', { homeGoals: 1, awayGoals: 1 }],
    ])
    const standings = calculateStandings(members, predictions, results, [], null)
    // u2: 3pts (1 exact), u1: 4pts (1 exact), u3: 1pt (0 exact)
    expect(standings[0].userId).toBe('u1') // 4pts
    expect(standings[1].userId).toBe('u2') // 3pts
    expect(standings[2].userId).toBe('u3') // 1pt
  })

  it('includes tournament winner bonus in total', () => {
    const winnerPredictions = [makeWinnerPrediction('u1', 'brazil')]
    const standings = calculateStandings(members, [], new Map(), winnerPredictions, 'brazil')
    const u1 = standings.find((s) => s.userId === 'u1')!
    expect(u1.winnerPoints).toBe(5)
    expect(u1.points).toBe(5)
  })

  it('handles member with no predictions', () => {
    const predictions = [makePrediction('u1', 'm1', 2, 1)]
    const results = new Map([['m1', { homeGoals: 2, awayGoals: 1 }]])
    const standings = calculateStandings(members, predictions, results, [], null)
    const u3 = standings.find((s) => s.userId === 'u3')!
    expect(u3.points).toBe(0)
    expect(u3.exactScores).toBe(0)
  })
})
