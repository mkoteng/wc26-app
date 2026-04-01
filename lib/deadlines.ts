import { getMatches } from '@/lib/wc26'

const TZ = 'Europe/Oslo' // CEST (UTC+2 summer) / CET (UTC+1 winter)

/** Kickoff time of the first match in the tournament, derived from wc26-mcp data */
function getFirstMatchKickoff(): Date {
  const all = getMatches()
  const first = [...all].sort((a, b) =>
    (a.date + a.time_utc).localeCompare(b.date + b.time_utc)
  )[0]
  return new Date(`${first.date}T${first.time_utc}:00Z`)
}

let _firstKickoff: Date | null = null
function firstKickoff(): Date {
  if (!_firstKickoff) _firstKickoff = getFirstMatchKickoff()
  return _firstKickoff
}

/** Format a Date as "11. juni kl. 20:00 CEST" in Norwegian */
function formatInCest(date: Date): string {
  const fmt = new Intl.DateTimeFormat('nb-NO', {
    timeZone: TZ,
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })
  return fmt.format(date).replace(',', ' kl.')
}

/** Deadline for tournament winner prediction: 1 hour before the first match */
export function isTournamentWinnerDeadlinePassed(): boolean {
  const deadline = new Date(firstKickoff().getTime() - 60 * 60 * 1000)
  return new Date() >= deadline
}

/** Deadline for match predictions: 15 minutes before kick-off */
export function isMatchDeadlinePassed(kickoffUtc: Date): boolean {
  const deadline = new Date(kickoffUtc.getTime() - 15 * 60 * 1000)
  return new Date() >= deadline
}

/** Returns minutes until match deadline, or 0 if passed */
export function minutesUntilMatchDeadline(kickoffUtc: Date): number {
  const deadline = new Date(kickoffUtc.getTime() - 15 * 60 * 1000)
  return Math.max(0, Math.floor((deadline.getTime() - Date.now()) / 60000))
}

/** Human-readable match deadline in CEST, e.g. "Frist: 11. juni kl. 20:45 CEST" */
export function formatMatchDeadline(kickoffUtc: Date): string {
  const deadline = new Date(kickoffUtc.getTime() - 15 * 60 * 1000)
  if (new Date() >= deadline) return 'Fristen er passert'
  return `Frist: ${formatInCest(deadline)}`
}

/** Human-readable tournament winner deadline in CEST */
export function formatTournamentDeadline(): string {
  const deadline = new Date(firstKickoff().getTime() - 60 * 60 * 1000)
  if (new Date() >= deadline) return 'Fristen er passert'
  return `Frist: ${formatInCest(deadline)}`
}
