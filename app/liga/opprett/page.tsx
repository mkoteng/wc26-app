'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Trophy } from 'lucide-react'
import { useT } from '@/components/shared/LocaleProvider'

export default function OpprettLigaPage() {
  const { status } = useSession()
  const router = useRouter()
  const t = useT()
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/api/auth/signin')
  }, [status, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || submitting) return
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/liga', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
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
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10">
          <Trophy className="h-5 w-5 text-gold" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          {t.liga.createLeague}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="league-name"
            className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            {t.liga.leagueName}
          </label>
          <input
            id="league-name"
            type="text"
            maxLength={50}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VM Tippeliga 2026"
            className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-gold"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <button
          type="submit"
          disabled={!name.trim() || submitting}
          className="w-full rounded-lg bg-gold px-4 py-3 text-sm font-bold text-zinc-900 transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? '...' : t.liga.create}
        </button>
      </form>
    </div>
  )
}
