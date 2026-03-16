import { getTeams } from '@/lib/wc26'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default function TeamsPage() {
  const teams = getTeams()

  const byGroup = teams.reduce<Record<string, typeof teams>>((acc, t) => {
    const g = t.group
    if (!acc[g]) acc[g] = []
    acc[g].push(t)
    return acc
  }, {})

  const sortedGroups = Object.keys(byGroup).sort()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Teams
        </h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
          48 nations competing at WC 2026
        </p>
      </div>

      <div className="space-y-8">
        {sortedGroups.map((groupId) => (
          <div key={groupId}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Group {groupId}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
              {byGroup[groupId].map((team) => (
                <Link key={team.id} href={`/teams/${team.id}`}>
                  <Card className="cursor-pointer rounded-xl border border-border bg-card transition-colors hover:border-emerald-500/40">
                    <CardContent className="p-4">
                      <div className="mb-2 text-3xl">{team.flag_emoji}</div>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white leading-tight">
                        {team.name}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          {team.confederation}
                        </span>
                        {team.is_host && (
                          <Badge className="h-4 rounded-full bg-emerald-100 px-1.5 text-xs text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                            Host
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
