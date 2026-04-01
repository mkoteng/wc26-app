'use client'

import { useEffect, useState, useCallback } from 'react'
import { Lock, AlertTriangle, Clock, Check, X } from 'lucide-react'
import { useT } from '@/components/shared/LocaleProvider'
import { WinnerPicker } from '@/components/features/liga/WinnerPicker'
import { PointsInfoBox } from '@/components/features/liga/PointsInfoBox'
import { Skeleton } from '@/components/ui/skeleton'
import { getFixtures } from '@/lib/wc26'
import type { MatchFixture } from '@/types/index'
import {
  isMatchDeadlinePassed,
  formatMatchDeadline,
} from '@/lib/deadlines'

interface UserPrediction {
  matchId: string
  homeGoals: number
  awayGoals: number
}

interface PredictionsTabProps {
  leagueId: string
}

function groupByDate(fixtures: MatchFixture[]) {
  const map = new Map<string, MatchFixture[]>()
  for (const f of fixtures) {
    const group = map.get(f.date) ?? []
    group.push(f)
    map.set(f.date, group)
  }
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
}

function formatDate(date: string): string {
  const d = new Date(date + 'T00:00:00Z')
  return d.toLocaleDateString('nb-NO', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  })
}

// CSS to hide number input spin buttons
const noSpinnerClass =
  'h-10 w-12 rounded-lg border border-zinc-200 bg-zinc-50 text-center text-sm font-bold tabular-nums text-zinc-900 outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/20 disabled:bg-zinc-100 disabled:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'

export function PredictionsTab({ leagueId }: PredictionsTabProps) {
  const t = useT()
  const [predictions, setPredictions] = useState<Map<string, UserPrediction>>(new Map())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<Set<string>>(new Set())
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState<Set<string>>(new Set())

  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15000)
    return () => clearInterval(id)
  }, [])

  const allFixtures = getFixtures()
  const upcoming = allFixtures
    .filter((f) => f.status === 'scheduled')
    .sort((a, b) => a.utcDateTime.localeCompare(b.utcDateTime))

  const grouped = groupByDate(upcoming)

  useEffect(() => {
    fetch(`/api/liga/${leagueId}/tips`)
      .then((r) => r.json())
      .then((data) => {
        const map = new Map<string, UserPrediction>()
        for (const p of data.predictions ?? []) {
          map.set(p.matchId, {
            matchId: p.matchId,
            homeGoals: p.homeGoals,
            awayGoals: p.awayGoals,
          })
        }
        setPredictions(map)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [leagueId])

  const savePrediction = useCallback(
    async (matchId: string, homeGoals: number, awayGoals: number) => {
      setSaving((prev) => new Set(prev).add(matchId))
      try {
        const res = await fetch(`/api/liga/${leagueId}/tips`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ matchId, homeGoals, awayGoals }),
        })
        if (res.ok) {
          setPredictions((prev) => {
            const next = new Map(prev)
            next.set(matchId, { matchId, homeGoals, awayGoals })
            return next
          })
          setSavedIds((prev) => new Set(prev).add(matchId))
          setTimeout(() => {
            setSavedIds((prev) => {
              const next = new Set(prev)
              next.delete(matchId)
              return next
            })
          }, 2000)
        }
      } catch {
        // silent
      } finally {
        setSaving((prev) => {
          const next = new Set(prev)
          next.delete(matchId)
          return next
        })
      }
    },
    [leagueId]
  )

  const erasePrediction = useCallback(
    async (matchId: string) => {
      setDeleting((prev) => new Set(prev).add(matchId))
      try {
        const res = await fetch(`/api/liga/${leagueId}/tips`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ matchId }),
        })
        if (res.ok) {
          setPredictions((prev) => {
            const next = new Map(prev)
            next.delete(matchId)
            return next
          })
        }
      } catch {
        // silent
      } finally {
        setDeleting((prev) => {
          const next = new Set(prev)
          next.delete(matchId)
          return next
        })
      }
    },
    [leagueId]
  )

  const saveAll = useCallback(async () => {
    for (const [matchId, pred] of predictions.entries()) {
      const fixture = allFixtures.find((f) => f.id === matchId)
      if (!fixture) continue
      const kickoff = new Date(fixture.utcDateTime)
      if (isMatchDeadlinePassed(kickoff)) continue
      await savePrediction(matchId, pred.homeGoals, pred.awayGoals)
    }
  }, [predictions, allFixtures, savePrediction])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Points info */}
      <PointsInfoBox />

      {/* Section A: Tournament Winner */}
      <WinnerPicker leagueId={leagueId} />

      {/* Section B: Match Predictions */}
      <div>
        <h3 className="mb-4 text-lg font-bold text-zinc-900 dark:text-white">
          {t.liga.matchPredictions}
        </h3>

        {grouped.length === 0 && (
          <p className="py-8 text-center text-sm text-zinc-500">
            Ingen kommende kamper
          </p>
        )}

        {grouped.map(([date, fixtures]) => (
          <div key={date} className="mb-6">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              {formatDate(date)}
            </h4>
            <div className="space-y-2">
              {fixtures.map((fixture) => {
                const kickoff = new Date(fixture.utcDateTime)
                const deadline = new Date(kickoff.getTime() - 15 * 60 * 1000)
                const deadlinePassed = now >= deadline.getTime()
                const minsLeft = Math.max(0, Math.floor((deadline.getTime() - now) / 60000))
                const pred = predictions.get(fixture.id)
                const isSaving = saving.has(fixture.id)
                const isSaved = savedIds.has(fixture.id)
                const isDeleting = deleting.has(fixture.id)

                return (
                  <div
                    key={fixture.id}
                    className={[
                      'rounded-xl border bg-white p-4 dark:bg-zinc-900',
                      deadlinePassed
                        ? 'border-zinc-200 opacity-60 dark:border-zinc-800'
                        : 'border-zinc-200 dark:border-zinc-800',
                    ].join(' ')}
                  >
                    {/* Deadline warning — show when ≤ 30 min left */}
                    {!deadlinePassed && minsLeft <= 30 && minsLeft > 0 && (
                      <div className={[
                        'mb-2 flex items-center gap-1.5 text-xs font-medium',
                        minsLeft <= 15 ? 'text-red-500' : 'text-amber-500',
                      ].join(' ')}>
                        {minsLeft <= 15
                          ? <AlertTriangle className="h-3.5 w-3.5" />
                          : <Clock className="h-3.5 w-3.5" />}
                        {minsLeft <= 15
                          ? t.liga.deadlineSoon
                          : `Frist om ${minsLeft} min`}
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      {/* Home */}
                      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
                        <span className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-200">
                          {fixture.home
                            ? (t.teamNames[fixture.home.name] ?? fixture.home.name)
                            : (fixture.homePlaceholder ?? 'TBD')}
                        </span>
                        <span className="shrink-0 text-lg leading-none">
                          {fixture.home?.flagEmoji ?? '🏳'}
                        </span>
                      </div>

                      {/* Score inputs */}
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          max={99}
                          disabled={deadlinePassed}
                          value={pred?.homeGoals ?? ''}
                          onChange={(e) => {
                            const val = Math.max(0, Math.min(99, parseInt(e.target.value) || 0))
                            setPredictions((prev) => {
                              const next = new Map(prev)
                              next.set(fixture.id, {
                                matchId: fixture.id,
                                homeGoals: val,
                                awayGoals: pred?.awayGoals ?? 0,
                              })
                              return next
                            })
                          }}
                          onBlur={() => {
                            if (deadlinePassed) return
                            const p = predictions.get(fixture.id)
                            if (p) savePrediction(fixture.id, p.homeGoals, p.awayGoals)
                          }}
                          className={noSpinnerClass}
                        />
                        <span className="text-xs text-zinc-400">–</span>
                        <input
                          type="number"
                          min={0}
                          max={99}
                          disabled={deadlinePassed}
                          value={pred?.awayGoals ?? ''}
                          onChange={(e) => {
                            const val = Math.max(0, Math.min(99, parseInt(e.target.value) || 0))
                            setPredictions((prev) => {
                              const next = new Map(prev)
                              next.set(fixture.id, {
                                matchId: fixture.id,
                                homeGoals: pred?.homeGoals ?? 0,
                                awayGoals: val,
                              })
                              return next
                            })
                          }}
                          onBlur={() => {
                            if (deadlinePassed) return
                            const p = predictions.get(fixture.id)
                            if (p) savePrediction(fixture.id, p.homeGoals, p.awayGoals)
                          }}
                          className={noSpinnerClass}
                        />
                      </div>

                      {/* Away */}
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <span className="shrink-0 text-lg leading-none">
                          {fixture.away?.flagEmoji ?? '🏳'}
                        </span>
                        <span className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-200">
                          {fixture.away
                            ? (t.teamNames[fixture.away.name] ?? fixture.away.name)
                            : (fixture.awayPlaceholder ?? 'TBD')}
                        </span>
                      </div>

                      {/* Status / erase */}
                      <div className="flex w-9 shrink-0 items-center justify-center">
                        {deadlinePassed && (
                          <Lock className="h-4 w-4 text-zinc-400" />
                        )}
                        {!deadlinePassed && isSaving && (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-gold" />
                        )}
                        {!deadlinePassed && isSaved && !isSaving && (
                          <Check className="h-4 w-4 text-pitch" />
                        )}
                        {!deadlinePassed && pred && !isSaving && !isSaved && !isDeleting && (
                          <button
                            onClick={() => erasePrediction(fixture.id)}
                            aria-label="Slett tips"
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-300 transition-colors hover:bg-red-50 hover:text-red-400 dark:text-zinc-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {!deadlinePassed && isDeleting && (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-red-400" />
                        )}
                      </div>
                    </div>

                    {/* Time + deadline */}
                    <div className="mt-2 flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500">
                      <span>
                        {kickoff.toLocaleTimeString('nb-NO', {
                          timeZone: 'Europe/Oslo',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {fixture.venue && ` · ${fixture.venue.name}`}
                      </span>
                      {!deadlinePassed && (
                        <span>{formatMatchDeadline(kickoff)}</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {grouped.length > 0 && (
          <button
            onClick={saveAll}
            className="w-full rounded-lg bg-gold px-4 py-3 text-sm font-bold text-zinc-900 transition-opacity hover:opacity-90"
          >
            {t.liga.saveAll}
          </button>
        )}
      </div>
    </div>
  )
}
