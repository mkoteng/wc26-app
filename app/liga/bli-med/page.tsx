'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { UserPlus } from 'lucide-react'
import { useT } from '@/components/shared/LocaleProvider'

export default function BliMedPage() {
  const { status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useT()
  const [code, setCode] = useState(searchParams.get('kode') ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/api/auth/signin')
  }, [status, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim() || submitting) return
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/liga/bli-med', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: code.trim().toUpperCase() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Noe gikk galt')
        setSubmitting(false)
        return
      }
      router.push(`/liga/${data.leagueId}`)
    } catch {
      setError('Noe gikk galt')
      setSubmitting(false)
    }
  }

  if (status === 'loading') return null

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pitch/10">
          <UserPlus className="h-5 w-5 text-pitch" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          {t.liga.joinLeague}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="invite-code"
            className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            {t.liga.inviteCode}
          </label>
          <input
            id="invite-code"
            type="text"
            maxLength={9}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="WC26-XXXX"
            className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 font-mono text-base tracking-widest text-zinc-900 uppercase outline-none transition-colors focus:border-pitch focus:ring-2 focus:ring-pitch/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-pitch"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <button
          type="submit"
          disabled={!code.trim() || submitting}
          className="w-full rounded-lg bg-pitch px-4 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? '...' : t.liga.join}
        </button>
      </form>
    </div>
  )
}
