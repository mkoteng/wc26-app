'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useT } from '@/components/shared/LocaleProvider'
import { FavouriteButton } from '@/components/shared/FavouriteButton'
import type { MatchFixture, HistoricalMatchup } from '@/types/index'

// ── Responsive side hook ──────────────────────────────────────────────────────

function useSheetSide(): 'right' | 'bottom' {
  const [side, setSide] = useState<'right' | 'bottom'>('bottom')
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)')
    setSide(mq.matches ? 'right' : 'bottom')
    const handler = (e: MediaQueryListEvent) => setSide(e.matches ? 'right' : 'bottom')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return side
}

// ── Countdown ─────────────────────────────────────────────────────────────────

function useCountdown(utcDateTime: string) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    function compute() {
      const diff = new Date(utcDateTime).getTime() - Date.now()
      if (diff <= 0) return setTimeLeft('')
      const d = Math.floor(diff / 86_400_000)
      const h = Math.floor((diff % 86_400_000) / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      if (d > 0) setTimeLeft(`${d}d ${h}h`)
      else if (h > 0) setTimeLeft(`${h}h ${m}m`)
      else setTimeLeft(`${m}m`)
    }
    compute()
    const id = setInterval(compute, 30_000)
    return () => clearInterval(id)
  }, [utcDateTime])

  return timeLeft
}

// ── H2H section ───────────────────────────────────────────────────────────────

function H2HSection({
  matchup,
  homeId,
  awayId,
  t,
}: {
  matchup: HistoricalMatchup
  homeId: string
  awayId: string
  t: ReturnType<typeof useT>
}) {
  // Orient stats so "home" is on the left
  const flipped = matchup.team_a !== homeId && matchup.team_b === homeId
  const homeWins = flipped ? matchup.team_b_wins : matchup.team_a_wins
  const awayWins = flipped ? matchup.team_a_wins : matchup.team_b_wins
  const homeGoals = flipped ? matchup.total_goals_team_b : matchup.total_goals_team_a
  const awayGoals = flipped ? matchup.total_goals_team_a : matchup.total_goals_team_b
  // only show latest 3
  const meetings = [...matchup.meetings].reverse().slice(0, 3)

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        {t.matchDetail.h2hTitle(matchup.total_matches)}
      </p>

      {/* Win record bar */}
      <div className="mb-3 flex items-center justify-between gap-3 text-sm font-bold">
        <span className="tabular-nums text-zinc-900 dark:text-white">{homeWins}W</span>
        <div className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
          {matchup.total_matches > 0 && (
            <>
              <div
                className="h-full bg-pitch"
                style={{ width: `${(homeWins / matchup.total_matches) * 100}%` }}
              />
              <div
                className="h-full bg-zinc-400 dark:bg-zinc-500"
                style={{ width: `${(matchup.draws / matchup.total_matches) * 100}%` }}
              />
            </>
          )}
        </div>
        <span className="tabular-nums text-zinc-900 dark:text-white">{awayWins}W</span>
      </div>

      <p className="mb-1 text-center text-xs text-zinc-400 dark:text-zinc-500">
        {t.matchDetail.draws(matchup.draws)} · {homeGoals}–{awayGoals} {t.matchDetail.goals}
      </p>

      {/* Recent meetings */}
      {meetings.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {meetings.map((m, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-2 text-xs text-zinc-600 dark:text-zinc-400"
            >
              <span className="tabular-nums text-zinc-400 dark:text-zinc-500">{m.year}</span>
              <span className="truncate">{m.round}</span>
              <span className="shrink-0 font-semibold tabular-nums text-zinc-800 dark:text-zinc-200">
                {m.score}
              </span>
            </div>
          ))}
        </div>
      )}

      <p className="mt-3 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
        {matchup.summary}
      </p>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface MatchDetailSheetProps {
  fixture: MatchFixture
  matchup?: HistoricalMatchup
  trigger?: React.ReactNode
}

export function MatchDetailSheet({ fixture, matchup, trigger }: MatchDetailSheetProps) {
  const side = useSheetSide()
  const countdown = useCountdown(fixture.utcDateTime)
  const t = useT()

  const isCompleted = fixture.status === 'completed'
  const isLive = fixture.status === 'live'
  const hasScore = isCompleted || isLive

  const homeScore = fixture.homeScore ?? 0
  const awayScore = fixture.awayScore ?? 0

  const localDate = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(fixture.utcDateTime))

  const localTime = new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(fixture.utcDateTime))

  const groupOrRound = fixture.group
    ? t.fixtures.group(fixture.group)
    : (t.rounds[fixture.round] ?? fixture.round)

  const homeTeam = fixture.home
  const awayTeam = fixture.away

  return (
    <Sheet>
      <SheetTrigger
        nativeButton={false}
        render={
          <div
            role="button"
            tabIndex={0}
            className="cursor-pointer outline-none"
          />
        }
      >
        {trigger ?? <MatchCardInner fixture={fixture} />}
      </SheetTrigger>

      <SheetContent
        side={side}
        className="flex flex-col overflow-y-auto p-0 sm:max-w-md"
      >
        {/* Handle for bottom sheet on mobile */}
        <div className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-700 sm:hidden" />

        {/* Match header */}
        <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <div className="flex items-center justify-between gap-2">
            <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              Match #{fixture.matchNumber} · {groupOrRound}
            </span>
            {isLive && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-pitch/15 px-2.5 py-0.5 text-xs font-semibold text-pitch dark:bg-pitch/20">
                <span className="animate-pitch-pulse h-1.5 w-1.5 rounded-full bg-pitch" />
                LIVE
              </span>
            )}
          </div>
          <p suppressHydrationWarning className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
            {localDate}
          </p>
        </div>

        {/* Teams + score */}
        <div className="px-5 py-6">
          <div className="flex items-center justify-between gap-4">
            {/* Home */}
            <div className="flex flex-1 flex-col items-center gap-2 text-center">
              <span className="text-5xl leading-none">
                {homeTeam?.flagEmoji ?? '🏳'}
              </span>
              <span className="text-sm font-bold leading-tight text-zinc-900 dark:text-white">
                {(homeTeam?.name ? (t.teamNames[homeTeam.name] ?? homeTeam.name) : null) ?? fixture.homePlaceholder ?? 'TBD'}
              </span>
              {homeTeam?.id && (
                <div className="flex items-center gap-2">
                  <Link
                    href={`/teams/${homeTeam.id}`}
                    className="rounded-lg border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                  >
                    {t.matchDetail.viewTeam}
                  </Link>
                  <FavouriteButton
                    teamId={homeTeam.id}
                    teamName={t.teamNames[homeTeam.name] ?? homeTeam.name}
                    size="sm"
                  />
                </div>
              )}
            </div>

            {/* Score / time */}
            <div className="flex flex-col items-center gap-1">
              {hasScore ? (
                <span className="tabular-nums text-3xl font-extrabold leading-none tracking-tight text-zinc-900 dark:text-white">
                  {homeScore}&thinsp;–&thinsp;{awayScore}
                </span>
              ) : (
                <>
                  <span className="text-xl font-bold text-zinc-300 dark:text-zinc-600">vs</span>
                  <span suppressHydrationWarning className="text-sm font-semibold tabular-nums text-zinc-700 dark:text-zinc-300">
                    {localTime}
                  </span>
                  {countdown && (
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                      {t.matchDetail.inTime(countdown)}
                    </span>
                  )}
                </>
              )}
              {isCompleted && (
                <span className="mt-0.5 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  FT
                </span>
              )}
            </div>

            {/* Away */}
            <div className="flex flex-1 flex-col items-center gap-2 text-center">
              <span className="text-5xl leading-none">
                {awayTeam?.flagEmoji ?? '🏳'}
              </span>
              <span className="text-sm font-bold leading-tight text-zinc-900 dark:text-white">
                {(awayTeam?.name ? (t.teamNames[awayTeam.name] ?? awayTeam.name) : null) ?? fixture.awayPlaceholder ?? 'TBD'}
              </span>
              {awayTeam?.id && (
                <div className="flex items-center gap-2">
                  <FavouriteButton
                    teamId={awayTeam.id}
                    teamName={t.teamNames[awayTeam.name] ?? awayTeam.name}
                    size="sm"
                  />
                  <Link
                    href={`/teams/${awayTeam.id}`}
                    className="rounded-lg border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                  >
                    {t.matchDetail.viewTeam}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Venue */}
        <div className="px-5 pb-4">
          <Link
            href={`/venues/${fixture.venue.id}`}
            className="flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-3 text-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
          >
            <svg
              className="h-4 w-4 shrink-0 text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            <div className="min-w-0">
              <p className="truncate font-semibold text-zinc-800 dark:text-zinc-200">
                {fixture.venue.name}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {fixture.venue.city}, {fixture.venue.country}
              </p>
            </div>
            <svg
              className="ml-auto h-4 w-4 shrink-0 text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* H2H */}
        {matchup && homeTeam && awayTeam && (
          <div className="px-5 pb-6">
            <H2HSection matchup={matchup} homeId={homeTeam.id} awayId={awayTeam.id} t={t} />
          </div>
        )}

        {/* No H2H message */}
        {!matchup && homeTeam && awayTeam && (
          <div className="px-5 pb-6">
            <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
              {t.matchDetail.noH2H}
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

// ── Inline MatchCard (server-safe clone used inside trigger) ──────────────────
// We re-implement the card here so SheetTrigger can wrap it without prop drilling.

function MatchCardInner({ fixture }: { fixture: MatchFixture }) {
  const t = useT()
  const isCompleted = fixture.status === 'completed'
  const isLive = fixture.status === 'live'
  const hasScore = isCompleted || isLive

  const homeScore = fixture.homeScore ?? 0
  const awayScore = fixture.awayScore ?? 0
  const homeWon = isCompleted && homeScore > awayScore
  const awayWon = isCompleted && awayScore > homeScore

  const groupOrRound = fixture.group
    ? t.fixtures.group(fixture.group)
    : (t.rounds[fixture.round] ?? fixture.round)

  const localTime = new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(fixture.utcDateTime))

  return (
    <article
      className={`group relative overflow-hidden rounded-xl border bg-white transition-all duration-200 dark:bg-zinc-900 ${
        isLive
          ? 'border-pitch/40 glow-pitch dark:border-pitch/30'
          : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-md dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/50'
      }`}
    >
      {isLive && (
        <div className="absolute inset-x-0 top-0 h-0.5 animate-pitch-shimmer" />
      )}
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            #{fixture.matchNumber} · {groupOrRound}
          </span>
          <div className="flex items-center gap-2">
            {isLive ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-pitch/15 px-2.5 py-0.5 text-xs font-semibold text-pitch dark:bg-pitch/20">
                <span className="animate-pitch-pulse h-1.5 w-1.5 rounded-full bg-pitch" />
                LIVE
              </span>
            ) : isCompleted ? (
              <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                FT
              </span>
            ) : (
              <span suppressHydrationWarning className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{localTime}</span>
            )}
            <svg
              className="h-3.5 w-3.5 text-zinc-300 group-hover:text-zinc-400 dark:text-zinc-600 dark:group-hover:text-zinc-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 text-2xl leading-none">
              {fixture.home?.flagEmoji ?? '🏳'}
            </span>
            <span
              className={`truncate text-sm font-semibold leading-tight ${
                homeWon ? 'text-zinc-900 dark:text-white' : 'text-zinc-700 dark:text-zinc-300'
              }`}
            >
              {(fixture.home?.name ? (t.teamNames[fixture.home.name] ?? fixture.home.name) : null) ?? fixture.homePlaceholder ?? 'TBD'}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center">
            {hasScore ? (
              <span className="tabular-nums text-xl font-extrabold leading-none tracking-tight text-zinc-900 dark:text-white">
                {homeScore}&thinsp;–&thinsp;{awayScore}
              </span>
            ) : (
              <span className="text-sm font-bold text-zinc-300 dark:text-zinc-600">vs</span>
            )}
          </div>

          <div className="flex min-w-0 flex-row-reverse items-center gap-2">
            <span className="shrink-0 text-2xl leading-none">
              {fixture.away?.flagEmoji ?? '🏳'}
            </span>
            <span
              className={`truncate text-right text-sm font-semibold leading-tight ${
                awayWon ? 'text-zinc-900 dark:text-white' : 'text-zinc-700 dark:text-zinc-300'
              }`}
            >
              {(fixture.away?.name ? (t.teamNames[fixture.away.name] ?? fixture.away.name) : null) ?? fixture.awayPlaceholder ?? 'TBD'}
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
          <svg
            className="h-3 w-3 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
          <span className="truncate">
            {fixture.venue.name}, {fixture.venue.city}
          </span>
        </div>
      </div>
    </article>
  )
}
