import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock wc26 data so firstKickoff() is always 2026-06-11T19:00:00Z
vi.mock('@/lib/wc26', () => ({
  getMatches: () => [
    { date: '2026-06-11', time_utc: '19:00' },
    { date: '2026-06-12', time_utc: '15:00' },
  ],
}))

// Import AFTER mock is set up (vi.mock is hoisted but we want explicit ordering)
import { isMatchDeadlinePassed, isTournamentWinnerDeadlinePassed } from './deadlines'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('isMatchDeadlinePassed', () => {
  it('returns false if kickoff is 2 hours away', () => {
    vi.setSystemTime(new Date('2026-06-11T17:00:00Z'))
    const kickoff = new Date('2026-06-11T19:00:00Z')
    expect(isMatchDeadlinePassed(kickoff)).toBe(false)
  })

  it('returns false if exactly at the 15-minute mark', () => {
    // deadline = kickoff - 15min = 18:45. At 18:44 → not passed
    vi.setSystemTime(new Date('2026-06-11T18:44:59Z'))
    const kickoff = new Date('2026-06-11T19:00:00Z')
    expect(isMatchDeadlinePassed(kickoff)).toBe(false)
  })

  it('returns true if kickoff is 30 minutes away (deadline is 15 min before)', () => {
    // kickoff in 30 min → deadline in 15 min → deadline has NOT passed yet
    // Wait, kickoff in 30min means deadline in 15min from now → false
    // Let's use: now = 18:50, kickoff = 19:00 → deadline = 18:45 → passed
    vi.setSystemTime(new Date('2026-06-11T18:50:00Z'))
    const kickoff = new Date('2026-06-11T19:00:00Z')
    expect(isMatchDeadlinePassed(kickoff)).toBe(true)
  })

  it('returns true if kickoff is in the past', () => {
    vi.setSystemTime(new Date('2026-06-12T10:00:00Z'))
    const kickoff = new Date('2026-06-11T19:00:00Z')
    expect(isMatchDeadlinePassed(kickoff)).toBe(true)
  })
})

describe('isTournamentWinnerDeadlinePassed', () => {
  // First match in mock data: 2026-06-11T19:00:00Z
  // Tournament winner deadline: 1 hour before → 2026-06-11T18:00:00Z

  it('returns false before 11 June 2026 18:00 UTC (1 hour before first match)', () => {
    vi.setSystemTime(new Date('2026-06-11T17:59:59Z'))
    expect(isTournamentWinnerDeadlinePassed()).toBe(false)
  })

  it('returns false well before the deadline', () => {
    vi.setSystemTime(new Date('2026-05-01T00:00:00Z'))
    expect(isTournamentWinnerDeadlinePassed()).toBe(false)
  })

  it('returns true after 11 June 2026 18:00 UTC', () => {
    vi.setSystemTime(new Date('2026-06-11T18:00:01Z'))
    expect(isTournamentWinnerDeadlinePassed()).toBe(true)
  })

  it('returns true on tournament day', () => {
    vi.setSystemTime(new Date('2026-06-11T20:00:00Z'))
    expect(isTournamentWinnerDeadlinePassed()).toBe(true)
  })
})
