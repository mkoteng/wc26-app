'use client'

import { useState, useEffect, useCallback } from 'react'
import { LiveScoreCard } from '@/components/features/scores/LiveScoreCard'
import { Skeleton } from '@/components/ui/skeleton'
import { useT } from '@/components/shared/LocaleProvider'
import type { LiveScore, TodayScoresResponse } from '@/types/index'

const POLL_INTERVAL = 60_000 // 60 seconds

interface TodayScoresProps {
  initialMatches: LiveScore[]
}

function TodayScoresSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
        >
          <div className="mb-3 flex items-center justify-between">
            <Skeleton className="h-5 w-28 rounded-md" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-3">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
              <Skeleton className="h-4 w-20 rounded" />
            </div>
            <Skeleton className="h-7 w-12 rounded" />
            <div className="flex flex-row-reverse items-center gap-2.5">
              <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
              <Skeleton className="h-4 w-20 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function TodayScores({ initialMatches }: TodayScoresProps) {
  const t = useT()
  const [matches, setMatches] = useState<LiveScore[]>(initialMatches)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const refresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const res = await fetch('/api/scores', { cache: 'no-store' })
      if (!res.ok) return
      const data: TodayScoresResponse = await res.json()
      if (!data.error) {
        setMatches(data.matches)
        setLastUpdated(new Date())
      }
    } catch {
      // Silently ignore — keep showing stale data
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  // Poll every 60 s
  useEffect(() => {
    const id = setInterval(refresh, POLL_INTERVAL)
    return () => clearInterval(id)
  }, [refresh])

  if (matches.length === 0) {
    return null // Parent handles empty state
  }

  return (
    <div>
      <div className="space-y-3">
        {matches.map((m) => (
          <LiveScoreCard key={m.id} match={m} />
        ))}
      </div>

      {/* Refresh indicator */}
      <p className="mt-2 text-right text-xs text-zinc-400 dark:text-zinc-600">
        {isRefreshing ? (
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400 dark:bg-zinc-600" />
            {t.scores.updating}
          </span>
        ) : lastUpdated ? (
          t.scores.updated(lastUpdated.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false }))
        ) : (
          t.scores.live
        )}
      </p>
    </div>
  )
}

// Export skeleton for Suspense fallback
export { TodayScoresSkeleton }
