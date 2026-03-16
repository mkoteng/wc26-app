import { dict } from '@/lib/i18n'
import type { Locale } from '@/lib/locale'
import type { Team } from '@/types/index'

interface TeamHeroProps {
  team: Team
  locale: Locale
}

export function TeamHero({ team, locale }: TeamHeroProps) {
  const t = dict[locale].teams
  const confLabel = t.confederation[team.confederation] ?? team.confederation

  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_0%,rgba(16,185,129,0.07),transparent)] dark:bg-[radial-gradient(ellipse_60%_60%_at_50%_0%,rgba(16,185,129,0.11),transparent)]"
      />

      <div className="relative px-6 py-10 text-center sm:py-14">
        <div className="mb-4 text-[5rem] leading-none sm:text-[7rem]">
          {team.flag_emoji}
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
          {team.name}
        </h1>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {t.group(team.group)}
          </span>

          <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {confLabel}
          </span>

          {team.fifa_ranking != null && (
            <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-bold text-white dark:bg-white dark:text-zinc-900">
              FIFA #{team.fifa_ranking}
            </span>
          )}

          {team.is_host && (
            <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white dark:bg-emerald-500 dark:text-zinc-950">
              {t.hostNation}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
