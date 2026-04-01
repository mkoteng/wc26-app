'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Trophy, Plus, UserPlus, Users, ChevronRight } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useT } from '@/components/shared/LocaleProvider'

interface LeagueRow {
  league: {
    id: string
    name: string
    inviteCode: string
    createdBy: string | null
  }
  memberCount?: number
}

export default function LigaPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const t = useT()
  const [leagues, setLeagues] = useState<LeagueRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (!session?.user) return
    fetch('/api/liga/mine')
      .then((r) => r.json())
      .then((data) => {
        setLeagues(data.leagues ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [session])

  if (status === 'loading' || loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Skeleton className="mb-6 h-8 w-48" />
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10">
          <Trophy className="h-5 w-5 text-gold" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          {t.liga.myLeagues}
        </h1>
      </div>

      {/* CTAs */}
      <div className="mb-8 grid grid-cols-2 gap-3">
        <Link
          href="/liga/opprett"
          className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-gold/40 hover:bg-amber-50/50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-gold/30 dark:hover:bg-amber-500/[0.04]"
        >
          <Plus className="h-5 w-5 text-gold" />
          <span className="text-sm font-semibold text-zinc-900 dark:text-white">
            {t.liga.createLeague}
          </span>
        </Link>
        <Link
          href="/liga/bli-med"
          className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-pitch/40 hover:bg-emerald-50/50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-pitch/30 dark:hover:bg-emerald-500/[0.04]"
        >
          <UserPlus className="h-5 w-5 text-pitch" />
          <span className="text-sm font-semibold text-zinc-900 dark:text-white">
            {t.liga.joinLeague}
          </span>
        </Link>
      </div>

      {/* League list */}
      {leagues.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-16 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <Trophy className="mx-auto mb-4 h-10 w-10 text-zinc-300 dark:text-zinc-600" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {t.liga.noLeagues}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {leagues.map((row) => (
            <Link
              key={row.league.id}
              href={`/liga/${row.league.id}`}
              className="group flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-5 transition-colors hover:border-gold/40 hover:bg-amber-50/30 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-gold/30 dark:hover:bg-amber-500/[0.04]"
            >
              <div className="min-w-0">
                <h3 className="truncate text-base font-bold text-zinc-900 dark:text-white">
                  {row.league.name}
                </h3>
                <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {row.memberCount ?? '—'}
                  </span>
                  <span className="font-mono text-zinc-400 dark:text-zinc-500">
                    {row.league.inviteCode}
                  </span>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-zinc-300 transition-transform group-hover:translate-x-0.5 dark:text-zinc-600" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
