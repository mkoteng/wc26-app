import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getTeamById, getTeamProfile, getFixtures, getTeams, getHistoricalMatchup } from '@/lib/wc26'
import { getLocale } from '@/lib/locale'
import { dict } from '@/lib/i18n'
import { TeamHero } from '@/components/features/teams/TeamHero'
import { PlayerList } from '@/components/features/teams/PlayerList'
import { MatchDetailSheet } from '@/components/features/fixtures/MatchDetailSheet'
import type { Locale } from '@/lib/locale'
import type { Dict } from '@/lib/i18n'

export function generateStaticParams() {
  return getTeams().map((t) => ({ id: t.id }))
}

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const team = getTeamById(id)
  if (!team) return { title: 'Team not found' }
  return {
    title: team.name,
    description: `${team.name} at FIFA World Cup 2026 — squad, fixtures, history, and group standings.`,
  }
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-100 px-5 py-3.5 dark:border-zinc-800">
        <h2 className="text-sm font-bold tracking-wide text-zinc-900 dark:text-white">
          {title}
        </h2>
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}

function SquadSection({ teamId, t }: { teamId: string; t: Dict }) {
  const profile = getTeamProfile(teamId)
  if (!profile) {
    return (
      <Section title={t.teams.squadStyle}>
        <p className="text-sm text-zinc-400 dark:text-zinc-500">
          {t.teams.noProfile}
        </p>
      </Section>
    )
  }

  return (
    <Section title={t.teams.squadStyle}>
      <div className="space-y-5">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            {t.teams.headCoach}
          </p>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm dark:bg-zinc-800">
              🧑‍💼
            </span>
            <span className="text-sm font-semibold text-zinc-900 dark:text-white">
              {profile.coach}
            </span>
          </div>
        </div>

        {profile.key_players.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              {t.teams.keyPlayers}
            </p>
            <PlayerList players={profile.key_players} noDataLabel={t.teams.noPlayerData} />
          </div>
        )}

        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            {t.teams.playingStyle}
          </p>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {profile.playing_style}
          </p>
        </div>

        {profile.qualifying_summary && (
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              {t.teams.qualification}
            </p>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {profile.qualifying_summary}
            </p>
          </div>
        )}
      </div>
    </Section>
  )
}

function HistorySection({ teamId, t }: { teamId: string; t: Dict }) {
  const profile = getTeamProfile(teamId)
  if (!profile?.world_cup_history) return null

  const { appearances, titles, best_result } = profile.world_cup_history
  const hasTitles = titles > 0

  const stats = [
    { value: String(appearances), label: t.teams.appearances, accent: false },
    {
      value: String(titles),
      label: titles === 1 ? t.teams.title_one : t.teams.title_many,
      accent: hasTitles,
      icon: hasTitles ? '🏆' : undefined,
    },
    { value: best_result, label: t.teams.bestResult, accent: false, small: true },
  ]

  return (
    <Section title={t.teams.wcHistory}>
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-center justify-center rounded-lg bg-zinc-50 px-2 py-4 text-center dark:bg-zinc-800/50"
          >
            {s.icon && <span className="mb-1 text-xl">{s.icon}</span>}
            <span
              className={[
                'font-extrabold leading-tight tabular-nums',
                s.small ? 'text-base' : 'text-2xl',
                s.accent
                  ? 'text-amber-500 dark:text-amber-400'
                  : 'text-zinc-900 dark:text-white',
              ].join(' ')}
            >
              {s.value || '—'}
            </span>
            <span className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {appearances === 0 && (
        <p className="mt-3 text-center text-xs text-zinc-400 dark:text-zinc-500">
          {t.teams.firstAppearance}
        </p>
      )}
    </Section>
  )
}

function UpcomingMatchesSection({ teamId, t }: { teamId: string; t: Dict }) {
  const fixtures = getFixtures({ team: teamId }).slice(0, 3)

  return (
    <Section title={t.teams.fixtures}>
      {fixtures.length === 0 ? (
        <p className="text-sm text-zinc-400 dark:text-zinc-500">
          {t.teams.noFixtures}
        </p>
      ) : (
        <div className="space-y-2.5">
          {fixtures.map((f) => (
            <MatchDetailSheet
              key={f.id}
              fixture={f}
              matchup={
                f.home && f.away
                  ? getHistoricalMatchup(f.home.id, f.away.id)
                  : undefined
              }
            />
          ))}
        </div>
      )}
      <div className="mt-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
        <Link
          href={`/fixtures?team=${teamId}`}
          className="text-sm font-medium text-emerald-600 transition-colors hover:underline dark:text-emerald-500"
        >
          {t.teams.viewAllFixtures}
        </Link>
      </div>
    </Section>
  )
}

function HeadToHeadSection({ teamId, t }: { teamId: string; t: Dict }) {
  const team = getTeamById(teamId)

  return (
    <Section title={t.teams.h2h}>
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <span className="text-3xl">⚔️</span>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {t.teams.h2hComingSoon}
        </p>
        <span
          aria-disabled
          className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500"
        >
          {t.teams.viewHistory(team?.name ?? '')}
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Section>
  )
}

export default async function TeamPage({ params }: PageProps) {
  const { id } = await params
  const team = getTeamById(id)

  if (!team) notFound()

  const locale = await getLocale()
  const t = dict[locale]

  return (
    <div className="animate-fade-up mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-5">
        <Link
          href="/groups"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {t.teams.backTo(team.group)}
        </Link>
      </div>

      <div className="mb-6">
        <TeamHero team={team} locale={locale} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr,360px]">
        <div className="space-y-5">
          <SquadSection teamId={id} t={t} />
          <HistorySection teamId={id} t={t} />
        </div>
        <div className="space-y-5">
          <UpcomingMatchesSection teamId={id} t={t} />
          <HeadToHeadSection teamId={id} t={t} />
        </div>
      </div>
    </div>
  )
}
