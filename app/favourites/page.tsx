'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Heart, Users, LayoutGrid } from 'lucide-react'
import { getTeamById, getFixtures, getHistoricalMatchup } from '@/lib/wc26'
import { useFavourites } from '@/hooks/useFavourites'
import { FavouriteButton } from '@/components/shared/FavouriteButton'
import { MatchDetailSheet } from '@/components/features/fixtures/MatchDetailSheet'
import { useT } from '@/components/shared/LocaleProvider'
import type { Team, MatchFixture } from '@/types/index'

// ── Skeleton ──────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="h-28 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-xl bg-zinc-100 dark:bg-zinc-800/60" />
        ))}
      </div>
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ t }: { t: ReturnType<typeof useT> }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 py-16 text-center dark:border-zinc-800">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
        <Heart className="h-8 w-8 text-zinc-300 dark:text-zinc-600" strokeWidth={1.5} />
      </div>
      <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
        {t.favourites.emptyTitle}
      </h2>
      <p className="mt-2 max-w-xs text-sm text-zinc-500 dark:text-zinc-400">
        {t.favourites.emptyDesc}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/groups"
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          <LayoutGrid className="h-4 w-4" />
          {t.nav.groups}
        </Link>
        <Link
          href="/teams"
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <Users className="h-4 w-4" />
          {t.nav.teams}
        </Link>
      </div>
    </div>
  )
}

// ── Team card ─────────────────────────────────────────────────────────────────

function FavouriteTeamCard({ team, t }: { team: Team; t: ReturnType<typeof useT> }) {
  const teamName = t.teamNames[team.name] ?? team.name
  return (
    <div className="hover-lift group relative overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {/* Gold top accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

      <Link href={`/teams/${team.id}`} className="block p-4">
        {/* FIFA ranking + favourite button */}
        <div className="mb-3 flex items-start justify-between">
          {team.fifa_ranking != null ? (
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold tabular-nums text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
              #{team.fifa_ranking}
            </span>
          ) : (
            <span />
          )}
          <FavouriteButton teamId={team.id} teamName={teamName} size="sm" />
        </div>

        {/* Flag */}
        <div className="mb-2.5 text-5xl leading-none">{team.flag_emoji}</div>

        {/* Name */}
        <p className="text-sm font-bold leading-tight text-zinc-900 group-hover:text-gold dark:text-white dark:group-hover:text-gold">
          {teamName}
        </p>

        {/* Group */}
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
          {t.teams.group(team.group)}
        </p>
      </Link>
    </div>
  )
}

// ── Upcoming matches for favourites ──────────────────────────────────────────

function FavouriteMatches({
  teamIds,
  t,
}: {
  teamIds: string[]
  t: ReturnType<typeof useT>
}) {
  // Collect fixtures for all favourite teams, deduplicate by match id
  const seen = new Set<string>()
  const fixtures: MatchFixture[] = []

  for (const teamId of teamIds) {
    for (const f of getFixtures({ team: teamId, status: 'scheduled' })) {
      if (!seen.has(f.id)) {
        seen.add(f.id)
        fixtures.push(f)
      }
    }
  }

  // Sort by date + time, take next 8
  fixtures.sort((a, b) => a.utcDateTime.localeCompare(b.utcDateTime))
  const upcoming = fixtures.slice(0, 8)

  if (upcoming.length === 0) {
    return (
      <p className="text-sm text-zinc-400 dark:text-zinc-500">
        {t.favourites.noMatches}
      </p>
    )
  }

  let lastDate = ''

  return (
    <div className="stagger-children space-y-2.5">
      {upcoming.map((f) => {
        const showDate = f.date !== lastDate
        lastDate = f.date
        const dateLabel = new Date(f.date + 'T12:00:00Z').toLocaleDateString(
          undefined,
          { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' }
        )
        return (
          <div key={f.id}>
            {showDate && (
              <p className="mb-1.5 mt-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 first:mt-0 dark:text-zinc-500">
                {dateLabel}
              </p>
            )}
            <MatchDetailSheet
              fixture={f}
              matchup={
                f.home && f.away
                  ? getHistoricalMatchup(f.home.id, f.away.id)
                  : undefined
              }
            />
          </div>
        )
      })}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function FavouritesPage() {
  const { favourites } = useFavourites()
  const [mounted, setMounted] = useState(false)
  const t = useT()

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) {
    return (
      <div className="animate-fade-up mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <PageSkeleton />
      </div>
    )
  }

  const teams = favourites
    .map((id) => getTeamById(id))
    .filter((t): t is Team => t !== undefined)

  const hasTeams = teams.length > 0

  return (
    <div className="animate-fade-up mx-auto max-w-5xl px-4 py-8 sm:px-6">

      {/* ── Page header ── */}
      <div className="relative mb-8 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 px-6 py-8 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
        {/* Subtle glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 110%, color-mix(in oklch, var(--pitch) 14%, transparent) 0%, transparent 70%)',
          }}
        />
        <div className="relative flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pitch/10 dark:bg-pitch/15">
            <Heart className="h-6 w-6 text-pitch" fill="currentColor" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
              {t.favourites.title}
            </h1>
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
              {hasTeams
                ? t.favourites.subtitle(teams.length)
                : t.favourites.subtitleEmpty}
            </p>
          </div>
        </div>
      </div>

      {!hasTeams ? (
        <EmptyState t={t} />
      ) : (
        <div className="space-y-10">

          {/* ── Favourite teams grid ── */}
          <section>
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="border-l-2 border-gold pl-3 text-base font-bold text-zinc-900 dark:text-white">
                {t.favourites.yourTeams}
              </h2>
              <span className="rounded-full bg-pitch/15 px-2.5 py-0.5 text-xs font-semibold text-pitch">
                {teams.length}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {teams.map((team) => (
                <FavouriteTeamCard key={team.id} team={team} t={t} />
              ))}
            </div>
          </section>

          {/* ── Upcoming matches ── */}
          <section>
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="border-l-2 border-gold pl-3 text-base font-bold text-zinc-900 dark:text-white">
                {t.favourites.upcomingMatches}
              </h2>
              <Link
                href="/fixtures"
                className="text-xs font-semibold text-gold transition-opacity hover:opacity-70"
              >
                {t.home.allFixtures}
              </Link>
            </div>
            <FavouriteMatches teamIds={favourites} t={t} />
          </section>
        </div>
      )}
    </div>
  )
}
