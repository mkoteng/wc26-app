'use client'

import Link from 'next/link'
import type { MatchFixture } from '@/types/index'

interface MatchCardProps {
  fixture: MatchFixture
}

function StatusBadge({ fixture }: { fixture: MatchFixture }) {
  if (fixture.status === 'live') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
        LIVE
      </span>
    )
  }

  if (fixture.status === 'completed') {
    return (
      <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
        FT
      </span>
    )
  }

  if (fixture.status === 'postponed') {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
        PPD
      </span>
    )
  }

  // scheduled — show local kickoff time
  const localTime = new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(fixture.utcDateTime))

  return (
    <span suppressHydrationWarning className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
      {localTime}
    </span>
  )
}

function TeamSide({
  team,
  placeholder,
  align,
  isWinner,
}: {
  team: MatchFixture['home']
  placeholder?: string
  align: 'left' | 'right'
  isWinner: boolean
}) {
  const name = team?.name ?? placeholder ?? 'TBD'
  const flag = team?.flagEmoji ?? '🏳'

  const inner = (
    <div
      className={`flex min-w-0 items-center gap-2 ${
        align === 'right' ? 'flex-row-reverse' : ''
      }`}
    >
      <span className="shrink-0 text-2xl leading-none">{flag}</span>
      <span
        className={`truncate text-sm font-semibold leading-tight ${
          isWinner
            ? 'text-zinc-900 dark:text-white'
            : 'text-zinc-700 dark:text-zinc-300'
        }`}
      >
        {name}
      </span>
    </div>
  )

  if (team?.id) {
    return (
      <Link
        href={`/teams/${team.id}`}
        className="min-w-0 transition-opacity hover:opacity-75"
        onClick={(e) => e.stopPropagation()}
      >
        {inner}
      </Link>
    )
  }

  return inner
}

export function MatchCard({ fixture }: MatchCardProps) {
  const isCompleted = fixture.status === 'completed'
  const isLive = fixture.status === 'live'
  const hasScore = isCompleted || isLive

  const homeScore = fixture.homeScore ?? 0
  const awayScore = fixture.awayScore ?? 0
  const homeWon = isCompleted && homeScore > awayScore
  const awayWon = isCompleted && awayScore > homeScore

  const groupOrRound = fixture.group ? `Group ${fixture.group}` : fixture.round

  return (
    <article
      className={`group relative overflow-hidden rounded-xl border bg-white transition-all duration-200 dark:bg-zinc-900 ${
        isLive
          ? 'border-emerald-500/40 shadow-[0_0_0_1px_rgba(16,185,129,0.15)] dark:border-emerald-500/30'
          : 'border-zinc-200 hover:scale-[1.01] hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:hover:border-zinc-700'
      }`}
    >
      {/* Live accent bar */}
      {isLive && (
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-emerald-500 to-emerald-400" />
      )}

      <div className="p-4">
        {/* Header row */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            #{fixture.matchNumber} · {groupOrRound}
          </span>
          <StatusBadge fixture={fixture} />
        </div>

        {/* Teams + score */}
        <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-3">
          {/* Home */}
          <TeamSide
            team={fixture.home}
            placeholder={fixture.homePlaceholder}
            align="left"
            isWinner={homeWon}
          />

          {/* Score / separator */}
          <div className="flex flex-col items-center justify-center">
            {hasScore ? (
              <span className="tabular-nums text-xl font-extrabold leading-none tracking-tight text-zinc-900 dark:text-white">
                {homeScore}&thinsp;–&thinsp;{awayScore}
              </span>
            ) : (
              <span className="text-sm font-bold text-zinc-300 dark:text-zinc-600">
                vs
              </span>
            )}
          </div>

          {/* Away */}
          <div className="flex justify-end">
            <TeamSide
              team={fixture.away}
              placeholder={fixture.awayPlaceholder}
              align="right"
              isWinner={awayWon}
            />
          </div>
        </div>

        {/* Footer row — venue */}
        <div className="mt-3 flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
          <svg
            className="h-3 w-3 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
            />
          </svg>
          <span className="truncate">
            {fixture.venue.name}, {fixture.venue.city}
          </span>
        </div>
      </div>
    </article>
  )
}
