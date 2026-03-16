import type { Metadata } from 'next'
import Link from 'next/link'
import { getTeams } from '@/lib/wc26'
import { getLocale } from '@/lib/locale'
import { dict } from '@/lib/i18n'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Teams',
  description: 'All 48 nations competing at FIFA World Cup 2026.',
}

export default async function TeamsPage() {
  const locale = await getLocale()
  const t = dict[locale].teams

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

      <div className="space-y-8">
        {sortedGroups.map((groupId) => (
          <div key={groupId}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {t.group(groupId)}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
              {byGroup[groupId].map((team) => (
                <Link key={team.id} href={`/teams/${team.id}`}>
                  <Card className="cursor-pointer rounded-xl border border-border bg-card transition-all duration-200 hover:scale-[1.02] hover:border-emerald-500/40 hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="mb-2 text-3xl">{team.flag_emoji}</div>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white leading-tight">
                        {team.name}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          {t.confederation[team.confederation] ?? team.confederation}
                        </span>
                        {team.is_host && (
                          <Badge className="h-4 rounded-full bg-emerald-100 px-1.5 text-xs text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                            {t.host}
                          </Badge>
                        )}
                      </div>
                      {team.fifa_ranking && (
                        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                          FIFA #{team.fifa_ranking}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
