import Link from 'next/link'
import { Suspense } from 'react'
import { withCache } from '@/lib/cache'
import { fetchTodayMatches } from '@/lib/football-data'
import { getFixtures, getTeams } from '@/lib/wc26'
import { getLocale, dateLocale } from '@/lib/locale'
import { dict } from '@/lib/i18n'
import { TodayScores, TodayScoresSkeleton } from '@/components/features/scores/TodayScores'
import { MatchCard } from '@/components/features/fixtures/MatchCard'
import { MatchCardSkeleton } from '@/components/features/fixtures/MatchCardSkeleton'
import type { TodayScoresResponse, LiveScore } from '@/types/index'
import type { Dict } from '@/lib/i18n'

// ── Live scores server fetch ─────────────────────────────────────────────────

async function getTodayScores(): Promise<TodayScoresResponse> {
  if (!process.env.FOOTBALL_DATA_API_KEY) {
    return { matches: [], count: 0, cachedAt: new Date().toISOString() }
  }

  try {
    const teams = getTeams()
    const byCode = new Map(teams.map((t) => [t.code.toUpperCase(), t]))

    const result = await withCache<TodayScoresResponse>(
      'scores:today',
      async () => {
        const data = await fetchTodayMatches()
        const enriched = data.matches.map((m: LiveScore) => {
          const homeWc26 = byCode.get(m.homeTeam.tla.toUpperCase())
          const awayWc26 = byCode.get(m.awayTeam.tla.toUpperCase())
          return {
            ...m,
            homeTeam: { ...m.homeTeam, flagEmoji: homeWc26?.flag_emoji ?? '🏳', wc26Id: homeWc26?.id },
            awayTeam: { ...m.awayTeam, flagEmoji: awayWc26?.flag_emoji ?? '🏳', wc26Id: awayWc26?.id },
          }
        })
        return { ...data, matches: enriched }
      },
      60
    )
    return result
  } catch {
    return { matches: [], count: 0, cachedAt: new Date().toISOString() }
  }
}

// ── "No matches today" empty state ───────────────────────────────────────────

function NoMatchesToday({ t, dl }: { t: Dict; dl: string }) {
  const upcoming = getFixtures({ status: 'scheduled' })
  const next = upcoming[0]

  const nextDateStr = next
    ? new Date(next.date + 'T12:00:00Z').toLocaleDateString(dl, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
      })
    : null

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-10 text-center dark:border-zinc-800">
      <span className="text-3xl">⚽</span>
      <p className="mt-3 font-medium text-zinc-700 dark:text-zinc-300">{t.home.noMatchesToday}</p>
      {nextDateStr && (
        <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
          {t.home.nextMatch}{' '}
          <Link
            href="/fixtures"
            className="font-medium text-emerald-600 hover:underline dark:text-emerald-500"
          >
            {nextDateStr}
          </Link>
        </p>
      )}
    </div>
  )
}

// ── Upcoming section ─────────────────────────────────────────────────────────

function UpcomingMatches({ t, dl }: { t: Dict; dl: string }) {
  const fixtures = getFixtures({ status: 'scheduled' }).slice(0, 5)

  if (fixtures.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.home.noUpcoming}</p>
    )
  }

  let lastDate = ''

  return (
    <div className="stagger-children space-y-2.5">
      {fixtures.map((f) => {
        const showDate = f.date !== lastDate
        lastDate = f.date
        const dateLabel = new Date(f.date + 'T12:00:00Z').toLocaleDateString(dl, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          timeZone: 'UTC',
        })
        return (
          <div key={f.id}>
            {showDate && (
              <p className="mb-1.5 mt-3 first:mt-0 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {dateLabel}
              </p>
            )}
            <MatchCard fixture={f} />
          </div>
        )
      })}
    </div>
  )
}

// ── Hero ─────────────────────────────────────────────────────────────────────

function Hero({ t }: { t: Dict }) {
  const start = new Date('2026-06-11T00:00:00Z')
  const now = new Date()
  const daysUntil = Math.max(0, Math.ceil((start.getTime() - now.getTime()) / 86_400_000))
  const tournamentLive = daysUntil === 0

  return (
    <div className="relative mb-12 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 px-6 py-10 text-center dark:border-zinc-800 dark:bg-zinc-900 sm:py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.08),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.12),transparent)]"
      />

      <div className="relative">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-500">
          FIFA World Cup 2026
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
          USA &middot; Canada &middot; Mexico
        </h1>
        <p className="mt-3 text-base text-zinc-500 dark:text-zinc-400">
          {t.home.subtitle}
        </p>

        {!tournamentLive && daysUntil > 0 && (
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-1.5 dark:border-zinc-700 dark:bg-zinc-800">
            <span className="text-xl font-extrabold tabular-nums text-zinc-900 dark:text-white">
              {daysUntil}
            </span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {t.home.daysToGo(daysUntil)}
            </span>
          </div>
        )}
        {tournamentLive && (
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              {t.home.tournamentLive}
            </span>
          </div>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/fixtures"
            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400"
          >
            {t.home.fullSchedule}
          </Link>
          <Link
            href="/groups"
            className="rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            {t.home.groupStage}
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── Quick nav cards ───────────────────────────────────────────────────────────

function QuickLinks({ t }: { t: Dict }) {
  const items = [
    { href: '/fixtures', label: t.home.quickLinks.schedule, desc: t.home.quickLinks.scheduleDesc, icon: '📅' },
    { href: '/groups', label: t.home.quickLinks.groups, desc: t.home.quickLinks.groupsDesc, icon: '🏆' },
    { href: '/teams', label: t.home.quickLinks.teams, desc: t.home.quickLinks.teamsDesc, icon: '🌍' },
    { href: '/fixtures?round=Final', label: t.home.quickLinks.final, desc: t.home.quickLinks.finalDesc, icon: '🥇' },
  ]

  return (
    <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map(({ href, label, desc, icon }) => (
        <Link
          key={href}
          href={href}
          className="group flex flex-col gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-4 transition-colors hover:border-emerald-500/40 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-500/30 dark:hover:bg-zinc-800"
        >
          <span className="text-xl">{icon}</span>
          <span className="mt-1 font-semibold text-zinc-900 dark:text-white">{label}</span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">{desc}</span>
        </Link>
      ))}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const locale = await getLocale()
  const t = dict[locale]
  const dl = dateLocale(locale)

  const todayScores = await getTodayScores()
  const hasMatchesToday = todayScores.matches.length > 0

  return (
    <div className="animate-fade-up mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Hero t={t} />

      <div className="grid gap-8 lg:grid-cols-[1fr,1fr]">
        {/* Today's matches */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              {t.home.todaysMatches}
            </h2>
            {hasMatchesToday && (
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {t.home.match(todayScores.count)}
              </span>
            )}
          </div>

          <Suspense fallback={<TodayScoresSkeleton />}>
            {hasMatchesToday ? (
              <TodayScores initialMatches={todayScores.matches} />
            ) : (
              <NoMatchesToday t={t} dl={dl} />
            )}
          </Suspense>
        </section>

        {/* Upcoming */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">{t.home.upcoming}</h2>
            <Link
              href="/fixtures"
              className="text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-500"
            >
              {t.home.allFixtures}
            </Link>
          </div>

          <Suspense
            fallback={
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <MatchCardSkeleton key={i} />)}
              </div>
            }
          >
            <UpcomingMatches t={t} dl={dl} />
          </Suspense>
        </section>
      </div>

      <QuickLinks t={t} />
    </div>
  )
}
