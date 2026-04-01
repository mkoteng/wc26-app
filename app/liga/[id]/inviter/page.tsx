'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Share2, Copy, Check, ArrowLeft } from 'lucide-react'
import { useT } from '@/components/shared/LocaleProvider'
import { Skeleton } from '@/components/ui/skeleton'

export default function InviterPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { status } = useSession()
  const router = useRouter()
  const t = useT()
  const [leagueId, setLeagueId] = useState('')
  const [league, setLeague] = useState<{ name: string; inviteCode: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/api/auth/signin')
  }, [status, router])

  useEffect(() => {
    params.then(({ id }) => setLeagueId(id))
  }, [params])

  useEffect(() => {
    if (!leagueId || status !== 'authenticated') return
    fetch(`/api/liga/${leagueId}`)
      .then((r) => r.json())
      .then((data) => {
        setLeague(data.league)
        setLoading(false)
      })
      .catch(() => {
        router.push('/liga')
      })
  }, [leagueId, status, router])

  function copyLink() {
    if (!league) return
    const url = `${window.location.origin}/liga/bli-med?kode=${league.inviteCode}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  if (loading || !league) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
        <Skeleton className="mb-4 h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <Link
        href={`/liga/${leagueId}`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        {league.name}
      </Link>

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pitch/10">
          <Share2 className="h-5 w-5 text-pitch" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          {t.liga.invite}
        </h1>
      </div>

      {/* Invite code display */}
      <div className="mb-6 rounded-xl border border-zinc-200 bg-zinc-50 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          {t.liga.inviteCode}
        </p>
        <p className="font-mono text-3xl font-extrabold tracking-[0.15em] text-zinc-900 dark:text-white">
          {league.inviteCode}
        </p>
      </div>

      {/* Copy link button */}
      <button
        onClick={copyLink}
        className={[
          'flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold transition-all',
          copied
            ? 'bg-pitch text-white'
            : 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100',
        ].join(' ')}
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" />
            {t.liga.copied}
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            {t.liga.copyLink}
          </>
        )}
      </button>

      {/* Share text */}
      <p className="mt-4 rounded-lg bg-zinc-100 px-4 py-3 text-center text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
        {t.liga.shareText(league.inviteCode)}
      </p>
    </div>
  )
}
