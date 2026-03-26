import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { getFixtures, getTeamById, getHistoricalMatchup } from '@/lib/wc26'
import { getLocale, dateLocale } from '@/lib/locale'
import { dict } from '@/lib/i18n'
import { MatchDetailSheet } from '@/components/features/fixtures/MatchDetailSheet'
import { FixturesFilterBar } from '@/components/features/fixtures/FixturesFilterBar'
import { MatchListSkeleton } from '@/components/features/fixtures/MatchCardSkeleton'
import type { MatchFixture, MatchRound } from '@/types/index'
import type { Dict } from '@/lib/i18n'

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

function DateHeader({ dateStr, dl }: { dateStr: string; dl: string }) {
  const date = new Date(dateStr + 'T12:00:00Z')
  const weekday = date.toLocaleDateString(dl, { weekday: 'long', timeZone: 'UTC' })
  const formatted = date.toLocaleDateString(dl, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
  return (
    <div className="flex items-baseline gap-2 border-l-2 border-gold pl-3">
      <h2 className="text-sm font-bold text-zinc-900 dark:text-white">{weekday}</h2>
      <span className="text-xs text-zinc-400 dark:text-zinc-500">{formatted}</span>
    </div>
  )
}

// ── Match list (server) ───────────────────────────────────────────────────────

function FixturesList({
  fixtures,
  t,
  dl,
}: {
  fixtures: MatchFixture[]
  t: Dict
  dl: string
}) {
  if (fixtures.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-16 text-center dark:border-zinc-800">
        <svg className="h-8 w-8 text-zinc-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <circle cx="11" cy="11" r="8" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
        </svg>
        <p className="mt-3 font-medium text-zinc-700 dark:text-zinc-300">{t.fixtures.noMatchesFound}</p>
        <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
          {t.fixtures.noMatchesHint}
        </p>
      </div>
    )
  }

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
            <DateHeader dateStr={date} dl={dl} />
            <span className="ml-auto rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              {t.fixtures.matchCount(byDate[date].length)}
            </span>
          </div>
          <div className="stagger-children space-y-2.5">
            {byDate[date].map((fixture) => (
              <MatchDetailSheet
                key={fixture.id}
                fixture={fixture}
                matchup={
                  fixture.home && fixture.away
                    ? getHistoricalMatchup(fixture.home.id, fixture.away.id)
                    : undefined
                }
              />
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

  const locale = await getLocale()
  const t = dict[locale]
  const dl = dateLocale(locale)

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
          {t.fixtures.title}
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {fixtures.length === totalCount
            ? t.fixtures.allMatches(totalCount)
            : t.fixtures.filteredMatches(fixtures.length, totalCount)}
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
            {t.fixtures.clear} ×
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
        <FixturesList fixtures={fixtures} t={t} dl={dl} />
      </Suspense>
    </div>
  )
}
