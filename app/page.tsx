import Link from 'next/link'
import { Suspense } from 'react'
import { CalendarDays, LayoutGrid, Users, Trophy } from 'lucide-react'
import { withCache } from '@/lib/cache'
import { fetchTodayMatches } from '@/lib/football-data'
import { getFixtures, getTeams, getHistoricalMatchup } from '@/lib/wc26'
import { getLocale, dateLocale } from '@/lib/locale'
import { dict } from '@/lib/i18n'
import { TodayScores, TodayScoresSkeleton } from '@/components/features/scores/TodayScores'
import { MatchDetailSheet } from '@/components/features/fixtures/MatchDetailSheet'
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
      <svg className="h-8 w-8 text-zinc-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <circle cx="12" cy="12" r="10" />
        <path strokeLinecap="round" d="M12 8v4l2.5 2.5" />
      </svg>
      <p className="mt-3 font-medium text-zinc-700 dark:text-zinc-300">{t.home.noMatchesToday}</p>
      {nextDateStr && (
        <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
          {t.home.nextMatch}{' '}
          <Link href="/fixtures" className="font-medium text-gold hover:underline">
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
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.home.noUpcoming}</p>
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
            <MatchDetailSheet
              fixture={f}
              matchup={f.home && f.away ? getHistoricalMatchup(f.home.id, f.away.id) : undefined}
            />
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
    <div className="relative mb-12 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
      {/* Gold top accent bar — static gradient */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />

      {/* Dot grid pattern */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.12) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Atmospheric pitch-green glow — stadium floodlights hitting the grass */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-3/4"
        style={{
          background: 'radial-gradient(ellipse 90% 55% at 50% 110%, color-mix(in oklch, var(--pitch) 22%, transparent) 0%, transparent 65%)',
        }}
      />

      {/* Faint "2026" watermark */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-4 bottom-0 select-none text-[10rem] font-black leading-none tracking-tighter text-zinc-900/[0.03] dark:text-white/[0.03] sm:text-[14rem]"
      >
        2026
      </div>

      <div className="relative px-6 py-10 sm:py-14">
        <div className="flex flex-col items-center text-center">
          {/* Eyebrow */}
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-gold">
            FIFA World Cup 2026
          </p>

          {/* Headline */}
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
            USA &middot; Canada &middot; Mexico
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {t.home.subtitle}
          </p>

          {/* Divider */}
          <div className="my-8 h-px w-24 bg-gradient-to-r from-transparent via-zinc-300 to-transparent dark:via-zinc-700" />

          {/* Countdown or live badge */}
          {!tournamentLive && daysUntil > 0 ? (
            <div className="flex flex-col items-center">
              <span className="text-8xl font-black tabular-nums leading-none text-gold sm:text-9xl">
                {daysUntil}
              </span>
              <span className="mt-3 text-xs font-bold uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500">
                {t.home.daysToGo(daysUntil)}
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-full border border-pitch/30 bg-pitch/10 px-5 py-2">
              <span className="animate-pitch-pulse h-2 w-2 rounded-full bg-pitch" />
              <span className="text-sm font-bold text-pitch">
                {t.home.tournamentLive}
              </span>
            </div>
          )}

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/fixtures"
              className="rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {t.home.fullSchedule}
            </Link>
            <Link
              href="/groups"
              className="rounded-lg border border-zinc-200 bg-white px-6 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              {t.home.groupStage}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Quick nav cards ───────────────────────────────────────────────────────────

function QuickLinks({ t }: { t: Dict }) {
  const items = [
    {
      href: '/fixtures',
      label: t.home.quickLinks.schedule,
      desc: t.home.quickLinks.scheduleDesc,
      icon: CalendarDays,
    },
    {
      href: '/groups',
      label: t.home.quickLinks.groups,
      desc: t.home.quickLinks.groupsDesc,
      icon: LayoutGrid,
    },
    {
      href: '/teams',
      label: t.home.quickLinks.teams,
      desc: t.home.quickLinks.teamsDesc,
      icon: Users,
    },
    {
      href: '/fixtures?round=Final',
      label: t.home.quickLinks.final,
      desc: t.home.quickLinks.finalDesc,
      icon: Trophy,
    },
  ]

  return (
    <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map(({ href, label, desc, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="group flex cursor-pointer flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-4 transition-all duration-200 hover:border-gold/40 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-gold/30 dark:hover:shadow-black/30"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 transition-colors group-hover:bg-gold/10 group-hover:text-gold dark:bg-zinc-800 dark:text-zinc-400">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className="font-semibold leading-tight text-zinc-900 dark:text-white">{label}</p>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{desc}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ title, aside }: { title: string; aside?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-2">
      <h2 className="border-l-2 border-gold pl-3 text-base font-bold text-zinc-900 dark:text-white">
        {title}
      </h2>
      {aside}
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
          <SectionHeader
            title={t.home.todaysMatches}
            aside={
              hasMatchesToday ? (
                <span className="rounded-full bg-pitch/15 px-2.5 py-0.5 text-xs font-semibold text-pitch">
                  {t.home.match(todayScores.count)}
                </span>
              ) : undefined
            }
          />
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
          <SectionHeader
            title={t.home.upcoming}
            aside={
              <Link href="/fixtures" className="text-xs font-semibold text-gold transition-opacity hover:opacity-70">
                {t.home.allFixtures}
              </Link>
            }
          />
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
