'use client'

import Link from 'next/link'
import type { LiveScore } from '@/types/index'

// ── Helpers ───────────────────────────────────────────────────────────────────

function isLive(status: LiveScore['status']) {
  return status === 'IN_PLAY' || status === 'PAUSED' || status === 'HALFTIME'
}

function isFinished(status: LiveScore['status']) {
  return status === 'FINISHED' || status === 'AWARDED'
}

function groupLabel(match: LiveScore): string {
  if (match.group) {
    // football-data returns "GROUP_A" — prettify to "Group A"
    return match.group.replace('GROUP_', 'Group ')
  }
  // prettify stage: "GROUP_STAGE" → "Group Stage"
  return match.stage
    .split('_')
    .map((w) => w[0] + w.slice(1).toLowerCase())
    .join(' ')
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function MinuteBadge({ match }: { match: LiveScore }) {
  if (match.status === 'HALFTIME') {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
        HT
      </span>
    )
  }

  if (match.status === 'IN_PLAY') {
    const min = match.minute ?? '?'
    const injury = match.injuryTime ? `+${match.injuryTime}` : ''
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 dark:bg-emerald-400" />
        {min}{injury}&prime;
      </span>
    )
  }

  if (match.status === 'PAUSED') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 dark:bg-emerald-400" />
        LIVE
      </span>
    )
  }

  if (isFinished(match.status)) {
    return (
      <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
        FT
      </span>
    )
  }

  if (match.status === 'POSTPONED') {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
        PPD
      </span>
    )
  }

  // SCHEDULED / TIMED — show local kickoff time
  const localTime = new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(match.utcDate))

  return (
    <span className="text-xs font-medium tabular-nums text-zinc-500 dark:text-zinc-400">
      {localTime}
    </span>
  )
}

function TeamRow({
  team,
  align,
  isWinner,
}: {
  team: LiveScore['homeTeam']
  align: 'left' | 'right'
  isWinner: boolean
}) {
  const flag = team.flagEmoji ?? '🏳'

  const inner = (
    <div
      className={`flex min-w-0 items-center gap-2.5 ${
        align === 'right' ? 'flex-row-reverse' : ''
      }`}
    >
      <span className="shrink-0 text-2xl leading-none">{flag}</span>
      <div className={`flex min-w-0 flex-col ${align === 'right' ? 'items-end' : 'items-start'}`}>
        <span
          className={`truncate text-sm font-bold leading-tight ${
            isWinner
              ? 'text-zinc-900 dark:text-white'
              : 'text-zinc-600 dark:text-zinc-400'
          }`}
        >
          {team.shortName || team.name}
        </span>
      </div>
    </div>
  )

  if (team.wc26Id) {
    return (
      <Link
        href={`/teams/${team.wc26Id}`}
        className="min-w-0 transition-opacity hover:opacity-75"
      >
        {inner}
      </Link>
    )
  }

  return inner
}

// ── Main component ─────────────────────────────────────────────────────────────

export interface LiveScoreCardProps {
  match: LiveScore
}

export function LiveScoreCard({ match }: LiveScoreCardProps) {
  const live = isLive(match.status)
  const finished = isFinished(match.status)
  const hasScore = live || finished

  const homeScore = match.score.fullTime.home
  const awayScore = match.score.fullTime.away
  const homeWon = finished && match.score.winner === 'HOME_TEAM'
  const awayWon = finished && match.score.winner === 'AWAY_TEAM'

  return (
    <article
      className={`relative overflow-hidden rounded-xl border transition-colors ${
        live
          ? 'border-emerald-500/40 bg-white shadow-[0_0_0_1px_rgba(16,185,129,0.1)] dark:border-emerald-500/30 dark:bg-zinc-900'
          : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
      }`}
    >
      {/* Live accent bar */}
      {live && (
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500" />
      )}

      <div className="p-4">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            {groupLabel(match)}
          </span>
          <MinuteBadge match={match} />
        </div>

        {/* Teams + score */}
        <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-3">
          <TeamRow
            team={match.homeTeam}
            align="left"
            isWinner={homeWon}
          />

          {/* Score */}
          <div className="flex flex-col items-center">
            {hasScore ? (
              <span className="tabular-nums text-2xl font-extrabold leading-none tracking-tight text-zinc-900 dark:text-white">
                {homeScore ?? 0}&thinsp;–&thinsp;{awayScore ?? 0}
              </span>
            ) : (
              <span className="text-base font-bold text-zinc-300 dark:text-zinc-600">
                vs
              </span>
            )}
          </div>

          <div className="flex justify-end">
            <TeamRow
              team={match.awayTeam}
              align="right"
              isWinner={awayWon}
            />
          </div>
        </div>
      </div>
    </article>
  )
}
