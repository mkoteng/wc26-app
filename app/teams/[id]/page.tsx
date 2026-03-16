import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getTeamById, getTeamProfile, getFixtures, getTeams } from '@/lib/wc26'
import { TeamHero } from '@/components/features/teams/TeamHero'
import { PlayerList } from '@/components/features/teams/PlayerList'
import { MatchCard } from '@/components/features/fixtures/MatchCard'

// ── Static params — pre-render all 48 team pages at build time ───────────────

export function generateStaticParams() {
  return getTeams().map((t) => ({ id: t.id }))
}

// ── Section wrapper ───────────────────────────────────────────────────────────

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

// ── Squad & Style ─────────────────────────────────────────────────────────────

function SquadSection({ teamId }: { teamId: string }) {
  const profile = getTeamProfile(teamId)
  if (!profile) {
    return (
      <Section title="Squad & Style">
        <p className="text-sm text-zinc-400 dark:text-zinc-500">
          Profile data not yet available.
        </p>
      </Section>
    )
  }

  return (
    <Section title="Squad & Style">
      <div className="space-y-5">
        {/* Coach */}
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Head Coach
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

        {/* Key players */}
        {profile.key_players.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Key Players
            </p>
            <PlayerList players={profile.key_players} />
          </div>
        )}

        {/* Playing style */}
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Playing Style
          </p>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {profile.playing_style}
          </p>
        </div>

        {/* Qualifying */}
        {profile.qualifying_summary && (
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Qualification
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

// ── World Cup History ─────────────────────────────────────────────────────────

function HistorySection({ teamId }: { teamId: string }) {
  const profile = getTeamProfile(teamId)
  if (!profile?.world_cup_history) return null

  const { appearances, titles, best_result } = profile.world_cup_history
  const hasTitles = titles > 0

  const stats = [
    {
      value: String(appearances),
      label: 'Appearances',
      accent: false,
    },
    {
      value: String(titles),
      label: titles === 1 ? 'Title' : 'Titles',
      accent: hasTitles,
      icon: hasTitles ? '🏆' : undefined,
    },
    {
      value: best_result,
      label: 'Best Result',
      accent: false,
      small: true,
    },
  ]

  return (
    <Section title="World Cup History">
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
          First World Cup appearance
        </p>
      )}
    </Section>
  )
}

// ── Upcoming matches ──────────────────────────────────────────────────────────

function UpcomingMatchesSection({ teamId }: { teamId: string }) {
  const fixtures = getFixtures({ team: teamId }).slice(0, 3)

  return (
    <Section title="Fixtures">
      {fixtures.length === 0 ? (
        <p className="text-sm text-zinc-400 dark:text-zinc-500">
          No fixtures found.
        </p>
      ) : (
        <div className="space-y-2.5">
          {fixtures.map((f) => (
            <MatchCard key={f.id} fixture={f} />
          ))}
        </div>
      )}
    </Section>
  )
}

// ── Head-to-Head stub ─────────────────────────────────────────────────────────

function HeadToHeadSection({ teamId }: { teamId: string }) {
  const team = getTeamById(teamId)

  return (
    <Section title="Head-to-Head">
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <span className="text-3xl">⚔️</span>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Historical match records coming soon.
        </p>
        {/* Stub — will link to /teams/[id]/h2h once implemented */}
        <span
          aria-disabled
          className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500"
        >
          View {team?.name} history
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

// ── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TeamPage({ params }: PageProps) {
  const { id } = await params
  const team = getTeamById(id)

  if (!team) notFound()

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Back link */}
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
          Group {team.group}
        </Link>
      </div>

      {/* Hero */}
      <div className="mb-6">
        <TeamHero team={team} />
      </div>

      {/* Content grid */}
      <div className="grid gap-5 lg:grid-cols-[1fr,360px]">
        {/* Left column */}
        <div className="space-y-5">
          <SquadSection teamId={id} />
          <HistorySection teamId={id} />
        </div>

        {/* Right column */}
        <div className="space-y-5">
          <UpcomingMatchesSection teamId={id} />
          <HeadToHeadSection teamId={id} />
        </div>
      </div>
    </div>
  )
}
