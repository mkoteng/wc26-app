'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Trophy, Share2, Lock, AlertTriangle, Clock } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { useT } from '@/components/shared/LocaleProvider'
import { StandingsTable } from '@/components/features/liga/StandingsTable'
import { PredictionsTab } from '@/components/features/liga/PredictionsTab'
import { ResultsTab } from '@/components/features/liga/ResultsTab'
import type { LeagueStanding, LeagueMember } from '@/types/predictions'

interface LeagueData {
  league: {
    id: string
    name: string
    inviteCode: string
    createdBy: string | null
  }
  members: LeagueMember[]
  standings: LeagueStanding[]
  currentUserId: string
}

export default function LigaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { status } = useSession()
  const router = useRouter()
  const t = useT()
  const [data, setData] = useState<LeagueData | null>(null)
  const [loading, setLoading] = useState(true)
  const [leagueId, setLeagueId] = useState<string>('')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/api/auth/signin')
  }, [status, router])

  useEffect(() => {
    params.then(({ id }) => setLeagueId(id))
  }, [params])

  const fetchData = useCallback(async () => {
    if (!leagueId) return
    try {
      const res = await fetch(`/api/liga/${leagueId}`)
      if (!res.ok) {
        router.push('/liga')
        return
      }
      const json = await res.json()
      setData(json)
    } catch {
      router.push('/liga')
    } finally {
      setLoading(false)
    }
  }, [leagueId, router])

  useEffect(() => {
    if (status === 'authenticated' && leagueId) fetchData()
  }, [status, leagueId, fetchData])

  if (loading || !data) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <Skeleton className="mb-4 h-8 w-64" />
        <Skeleton className="mb-8 h-4 w-40" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10">
              <Trophy className="h-5 w-5 text-gold" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              {data.league.name}
            </h1>
          </div>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {t.liga.members(data.members.length)} ·{' '}
            <span className="font-mono">{data.league.inviteCode}</span>
          </p>
        </div>
        <Link
          href={`/liga/${leagueId}/inviter`}
          className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">{t.liga.invite}</span>
        </Link>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tabell">
        <TabsList className="mb-6 w-full sm:w-auto">
          <TabsTrigger value="tabell">{t.liga.standings}</TabsTrigger>
          <TabsTrigger value="tips">{t.liga.predictions}</TabsTrigger>
          <TabsTrigger value="resultater">{t.liga.results}</TabsTrigger>
        </TabsList>

        <TabsContent value="tabell">
          <StandingsTable
            standings={data.standings}
            currentUserId={data.currentUserId}
          />
        </TabsContent>

        <TabsContent value="tips">
          <PredictionsTab leagueId={leagueId} />
        </TabsContent>

        <TabsContent value="resultater">
          <ResultsTab leagueId={leagueId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
