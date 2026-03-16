import type { Team } from '@/types/index'

interface TeamHeroProps {
  team: Team
}

const CONFEDERATION_LABEL: Record<string, string> = {
  UEFA: 'Europe',
  CONMEBOL: 'South America',
  CONCACAF: 'North & Central America',
  CAF: 'Africa',
  AFC: 'Asia',
  OFC: 'Oceania',
}

export function TeamHero({ team }: TeamHeroProps) {
  const confLabel = CONFEDERATION_LABEL[team.confederation] ?? team.confederation

  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
      {/* Radial glow centred on the flag */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_0%,rgba(16,185,129,0.07),transparent)] dark:bg-[radial-gradient(ellipse_60%_60%_at_50%_0%,rgba(16,185,129,0.11),transparent)]"
      />

      <div className="relative px-6 py-10 text-center sm:py-14">
        {/* Flag */}
        <div className="mb-4 text-[5rem] leading-none sm:text-[7rem]">
          {team.flag_emoji}
        </div>

        {/* Name */}
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
          {team.name}
        </h1>

        {/* Badges row */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {/* Group */}
          <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            Group {team.group}
          </span>

          {/* Confederation */}
          <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {confLabel}
          </span>

          {/* FIFA ranking */}
          {team.fifa_ranking != null && (
            <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-bold text-white dark:bg-white dark:text-zinc-900">
              FIFA #{team.fifa_ranking}
            </span>
          )}

          {/* Host */}
          {team.is_host && (
            <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white dark:bg-emerald-500 dark:text-zinc-950">
              Host Nation
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
