'use client'

import { MatchDetailSheet } from '@/components/features/fixtures/MatchDetailSheet'
import type { MatchFixture, HistoricalMatchup } from '@/types/index'

export interface BracketTeam {
  name: string
  flag: string
}

interface BracketMatchCardProps {
  fixture: MatchFixture
  matchup?: HistoricalMatchup
  home: BracketTeam | null
  away: BracketTeam | null
}

function TeamRow({ team, placeholder }: { team: BracketTeam | null; placeholder?: string }) {
  const tbd = !team
  return (
    <div className="flex items-center gap-1.5 px-2 py-1.5">
      <span className={`shrink-0 text-sm leading-none ${tbd ? 'opacity-30' : ''}`}>
        {team?.flag ?? '⬜'}
      </span>
      <span
        className={`truncate text-[11px] font-semibold leading-tight ${
          tbd
            ? 'text-zinc-400 dark:text-zinc-600'
            : 'text-zinc-800 dark:text-zinc-200'
        }`}
      >
        {team?.name ?? placeholder ?? 'TBD'}
      </span>
    </div>
  )
}

function CompactCard({
  fixture,
  home,
  away,
}: {
  fixture: MatchFixture
  home: BracketTeam | null
  away: BracketTeam | null
}) {
  const isLive = fixture.status === 'live'
  const isCompleted = fixture.status === 'completed'

  return (
    <div
      className={[
        'group relative w-full cursor-pointer rounded-lg border bg-white transition-all duration-150 dark:bg-zinc-900',
        isLive
          ? 'border-pitch/50 glow-pitch'
          : 'border-zinc-200 hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:hover:border-zinc-600',
      ].join(' ')}
    >
      {isLive && <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-lg animate-pitch-shimmer" />}
      <TeamRow team={home} placeholder={fixture.homePlaceholder} />
      <div className="mx-2 border-t border-zinc-100 dark:border-zinc-800" />
      <TeamRow team={away} placeholder={fixture.awayPlaceholder} />
      {(isCompleted || isLive) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="rounded-md bg-white/90 px-1.5 text-xs font-bold tabular-nums text-zinc-900 dark:bg-zinc-900/90 dark:text-white">
            {fixture.homeScore ?? 0}&thinsp;–&thinsp;{fixture.awayScore ?? 0}
          </span>
        </div>
      )}
    </div>
  )
}

export function BracketMatchCard({ fixture, matchup, home, away }: BracketMatchCardProps) {
  return (
    <MatchDetailSheet
      fixture={fixture}
      matchup={matchup}
      trigger={<CompactCard fixture={fixture} home={home} away={away} />}
    />
  )
}
