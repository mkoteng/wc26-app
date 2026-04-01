'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useT } from '@/components/shared/LocaleProvider'
import { Skeleton } from '@/components/ui/skeleton'
import { getFixtures } from '@/lib/wc26'
import type { MatchFixture } from '@/types/index'

interface MemberPrediction {
  userId: string
  matchId: string
  homeGoals: number
  awayGoals: number
}

interface MemberInfo {
  userId: string
  name: string
  image: string | null
}

interface ResultsTabProps {
  leagueId: string
}

export function ResultsTab({ leagueId }: ResultsTabProps) {
  const t = useT()
  const [predictions, setPredictions] = useState<MemberPrediction[]>([])
  const [members, setMembers] = useState<MemberInfo[]>([])
  const [loading, setLoading] = useState(true)

  // Completed fixtures
  const completedFixtures = getFixtures()
    .filter((f) => f.status === 'completed' && f.homeScore !== undefined)
    .sort((a, b) => b.utcDateTime.localeCompare(a.utcDateTime))

  useEffect(() => {
    Promise.all([
      fetch(`/api/liga/${leagueId}`).then((r) => r.json()),
    ])
      .then(([data]) => {
        setMembers(data.members ?? [])
        // All predictions for the league
        fetch(`/api/liga/${leagueId}/tips?alle=true`)
          .then((r) => r.json())
          .then((tipsData) => {
            setPredictions(tipsData.predictions ?? [])
          })
          .catch(() => {})
          .finally(() => setLoading(false))
      })
      .catch(() => setLoading(false))
  }, [leagueId])

  if (loading) {
    return <Skeleton className="h-48 w-full rounded-xl" />
  }

  if (completedFixtures.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Ingen ferdige kamper ennå
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {completedFixtures.map((fixture) => {
        const matchPreds = predictions.filter((p) => p.matchId === fixture.id)

        return (
          <div
            key={fixture.id}
            className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            {/* Match result */}
            <div className="mb-3 flex items-center justify-center gap-3">
              <span className="text-lg">{fixture.home?.flagEmoji ?? '🏳'}</span>
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {fixture.home
                  ? (t.teamNames[fixture.home.name] ?? fixture.home.name)
                  : 'TBD'}
              </span>
              <span className="rounded-lg bg-zinc-900 px-3 py-1 text-sm font-bold tabular-nums text-white dark:bg-white dark:text-zinc-900">
                {fixture.homeScore} – {fixture.awayScore}
              </span>
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {fixture.away
                  ? (t.teamNames[fixture.away.name] ?? fixture.away.name)
                  : 'TBD'}
              </span>
              <span className="text-lg">{fixture.away?.flagEmoji ?? '🏳'}</span>
            </div>

            {/* Members' predictions */}
            {matchPreds.length > 0 && (
              <div className="space-y-1">
                {matchPreds.map((pred) => {
                  const member = members.find((m) => m.userId === pred.userId)
                  const isExact =
                    pred.homeGoals === fixture.homeScore &&
                    pred.awayGoals === fixture.awayScore
                  const predOutcome = Math.sign(pred.homeGoals - pred.awayGoals)
                  const actualOutcome = Math.sign(
                    (fixture.homeScore ?? 0) - (fixture.awayScore ?? 0)
                  )
                  const isCorrectOutcome =
                    !isExact && predOutcome === actualOutcome

                  return (
                    <div
                      key={pred.userId}
                      className={[
                        'flex items-center justify-between rounded-lg px-3 py-2 text-sm',
                        isExact
                          ? 'bg-pitch/10 text-pitch'
                          : isCorrectOutcome
                            ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                            : 'bg-zinc-50 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
                      ].join(' ')}
                    >
                      <div className="flex items-center gap-2">
                        {member?.image && (
                          <Image
                            src={member.image}
                            alt={member.name}
                            width={20}
                            height={20}
                            className="rounded-full"
                          />
                        )}
                        <span className="font-medium">
                          {member?.name ?? pred.userId}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="tabular-nums">
                          {pred.homeGoals} – {pred.awayGoals}
                        </span>
                        <span className="text-xs font-bold">
                          {isExact ? '3p' : isCorrectOutcome ? '1p' : '0p'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
