'use client'

import { useState, useTransition } from 'react'
import { removeFromLeague } from '@/app/admin/actions'

interface Props {
  leagueId: string
  leagueName: string
  userId: string
  userName: string
}

export function RemoveMemberDialog({ leagueId, leagueName, userId, userName }: Props) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleRemove() {
    startTransition(async () => {
      const result = await removeFromLeague(leagueId, userId, userName)
      if (result.success) {
        setMessage(result.message)
        setTimeout(() => setOpen(false), 800)
      } else {
        setMessage(result.message)
      }
    })
  }

  return (
    <>
      <button
        onClick={() => { setMessage(null); setOpen(true) }}
        className="text-xs font-medium text-red-400 hover:text-red-600 dark:hover:text-red-400"
      >
        Fjern
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
            <h3 className="mb-2 text-base font-bold text-zinc-900 dark:text-white">
              Fjern spiller fra liga
            </h3>
            <p className="mb-1 text-sm text-zinc-600 dark:text-zinc-300">
              Er du sikker på at du vil fjerne{' '}
              <span className="font-semibold">{userName}</span> fra{' '}
              <span className="font-semibold">{leagueName}</span>?
            </p>
            <p className="mb-6 text-sm text-red-500">
              Dette vil også slette alle deres tips i denne ligaen.
            </p>

            {message && (
              <p className="mb-3 text-sm text-zinc-500">{message}</p>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 rounded-lg border border-zinc-200 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Avbryt
              </button>
              <button
                onClick={handleRemove}
                disabled={isPending}
                className="flex-1 rounded-lg bg-red-500 py-2 text-sm font-bold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
              >
                {isPending ? 'Fjerner…' : 'Fjern spiller'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
