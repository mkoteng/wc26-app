import type { Metadata } from 'next'
import Link from 'next/link'
import { getTeams } from '@/lib/wc26'
import { getLocale } from '@/lib/locale'
import { dict } from '@/lib/i18n'

export const metadata: Metadata = {
  title: 'Teams',
  description: 'All 48 nations competing at FIFA World Cup 2026.',
}

export default async function TeamsPage() {
  const locale = await getLocale()
  const d = dict[locale]
  const t = d.teams

  const teams = getTeams()

  const byGroup = teams.reduce<Record<string, typeof teams>>((acc, team) => {
    const g = team.group
    if (!acc[g]) acc[g] = []
    acc[g].push(team)
    return acc
  }, {})

  const sortedGroups = Object.keys(byGroup).sort()

  return (
    <div className="animate-fade-up mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          {t.title}
        </h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
          {t.subtitle}
        </p>
      </div>

      <div className="space-y-10">
        {sortedGroups.map((groupId) => (
          <div key={groupId}>
            <div className="mb-4 flex items-center gap-3">
              <h2 className="border-l-2 border-gold pl-3 text-base font-bold text-zinc-900 dark:text-white">
                {t.group(groupId)}
              </h2>
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                {byGroup[groupId].length}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {byGroup[groupId].map((team) => (
                <Link
                  key={team.id}
                  href={`/teams/${team.id}`}
                  className="hover-lift group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-gold/40 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-gold/30 dark:hover:shadow-black/40"
                >
                  {/* FIFA ranking badge */}
                  {team.fifa_ranking && (
                    <span className="absolute right-3 top-3 rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
                      #{team.fifa_ranking}
                    </span>
                  )}

                  {/* Flag */}
                  <div className="mb-3 text-5xl leading-none">{team.flag_emoji}</div>

                  {/* Name */}
                  <p className="pr-6 text-sm font-bold leading-tight text-zinc-900 group-hover:text-gold dark:text-white dark:group-hover:text-gold">
                    {d.teamNames[team.name] ?? team.name}
                  </p>

                  {/* Confederation */}
                  <p className="mt-1.5 text-xs text-zinc-400 dark:text-zinc-500">
                    {t.confederation[team.confederation] ?? team.confederation}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
