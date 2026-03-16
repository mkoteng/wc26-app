import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { getFixtures, getTeamById } from '@/lib/wc26'
import { MatchCard } from '@/components/features/fixtures/MatchCard'
import { FixturesFilterBar } from '@/components/features/fixtures/FixturesFilterBar'
import { MatchListSkeleton } from '@/components/features/fixtures/MatchCardSkeleton'
import type { MatchFixture, MatchRound } from '@/types/index'

export const metadata: Metadata = {
  title: 'Fixtures',
  description: 'Full match schedule for FIFA World Cup 2026 — all 104 matches.',
}

interface PageProps {
  searchParams: Promise<{
    group?: string
    date?: string
    round?: string
    team?: string
  }>
}

// ── Date header ──────────────────────────────────────────────────────────────

function DateHeader({ dateStr }: { dateStr: string }) {
  const date = new Date(dateStr + 'T12:00:00Z')
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' })
  const formatted = date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
  return (
    <div className="flex items-baseline gap-2">
      <h2 className="text-sm font-bold text-zinc-900 dark:text-white">{weekday}</h2>
      <span className="text-xs text-zinc-400 dark:text-zinc-500">{formatted}</span>
    </div>
  )
}

// ── Match list (server) ───────────────────────────────────────────────────────

function FixturesList({
  fixtures,
}: {
  fixtures: MatchFixture[]
}) {
  if (fixtures.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-16 text-center dark:border-zinc-800">
        <span className="text-3xl">🔍</span>
        <p className="mt-3 font-medium text-zinc-700 dark:text-zinc-300">No matches found</p>
        <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
          Try clearing the filters or picking a different date
        </p>
      </div>
    )
  }

  // Group by date
  const byDate = fixtures.reduce<Record<string, MatchFixture[]>>((acc, m) => {
    if (!acc[m.date]) acc[m.date] = []
    acc[m.date].push(m)
    return acc
  }, {})

  const sortedDates = Object.keys(byDate).sort()

  return (
    <div className="space-y-8">
      {sortedDates.map((date) => (
        <section key={date}>
          <div className="mb-3 flex items-center gap-3">
            <DateHeader dateStr={date} />
            <span className="ml-auto rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              {byDate[date].length} match{byDate[date].length !== 1 ? 'es' : ''}
            </span>
          </div>
          <div className="stagger-children space-y-2.5">
            {byDate[date].map((fixture) => (
              <MatchCard key={fixture.id} fixture={fixture} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function FixturesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const group = params.group
  const date = params.date
  const round = params.round as MatchRound | undefined
  const teamId = params.team

  const fixtures = getFixtures({
    group: group ?? undefined,
    date: date ?? undefined,
    round: round ?? undefined,
    team: teamId ?? undefined,
  })

  const totalCount = getFixtures().length
  const teamFilter = teamId ? getTeamById(teamId) : undefined

  return (
    <div className="animate-fade-up mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Fixtures
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {fixtures.length === totalCount
            ? `All ${totalCount} matches · 11 Jun – 19 Jul 2026`
            : `${fixtures.length} of ${totalCount} matches`}
        </p>
      </div>

      {/* Team filter banner */}
      {teamFilter && (
        <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-lg leading-none">{teamFilter.flag_emoji}</span>
          <span className="text-sm font-semibold text-zinc-900 dark:text-white">
            {teamFilter.name}
          </span>
          <Link
            href="/fixtures"
            className="ml-auto text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            Clear ×
          </Link>
        </div>
      )}

      {/* Filters */}
      <div className="mb-8">
        <Suspense fallback={null}>
          <FixturesFilterBar activeGroup={group} activeDate={date} />
        </Suspense>
      </div>

      {/* Match list */}
      <Suspense
        fallback={<MatchListSkeleton count={6} />}
        key={`${group ?? ''}-${date ?? ''}-${round ?? ''}-${teamId ?? ''}`}
      >
        <FixturesList fixtures={fixtures} />
      </Suspense>
    </div>
  )
}
