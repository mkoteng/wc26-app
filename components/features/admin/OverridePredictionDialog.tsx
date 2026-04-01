'use client'

import { useState, useTransition } from 'react'
import { overridePrediction } from '@/app/admin/actions'

interface Props {
  predictionId: string
  leagueId: string
  userName: string
  matchLabel: string
  currentHome: number
  currentAway: number
}

export function OverridePredictionDialog({
  predictionId,
  leagueId,
  userName,
  matchLabel,
  currentHome,
  currentAway,
}: Props) {
  const [open, setOpen] = useState(false)
  const [home, setHome] = useState(currentHome)
  const [away, setAway] = useState(currentAway)
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleOpen() {
    setHome(currentHome)
    setAway(currentAway)
    setReason('')
    setMessage(null)
    setOpen(true)
  }

  function handleSave() {
    startTransition(async () => {
      const result = await overridePrediction(predictionId, leagueId, home, away, reason || undefined)
      if (result.success) {
        setMessage('Lagret')
        setTimeout(() => setOpen(false), 800)
      } else {
        setMessage('Noe gikk galt')
      }
    })
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="text-xs font-medium text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
      >
        Overskrive
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
            <h3 className="mb-1 text-base font-bold text-zinc-900 dark:text-white">
              Overstyr tips
            </h3>
            <p className="mb-4 text-sm text-zinc-500">
              {userName} · {matchLabel}
            </p>

            <div className="mb-4 flex items-center gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-xs text-zinc-500">Hjemmelag</label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={home}
                  onChange={(e) => setHome(Math.max(0, Math.min(20, parseInt(e.target.value) || 0)))}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-center text-sm font-bold dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>
              <span className="mt-5 text-zinc-400">–</span>
              <div className="flex-1">
                <label className="mb-1 block text-xs text-zinc-500">Bortelag</label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={away}
                  onChange={(e) => setAway(Math.max(0, Math.min(20, parseInt(e.target.value) || 0)))}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-center text-sm font-bold dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="mb-1 block text-xs text-zinc-500">Årsak (valgfritt)</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Kort begrunnelse…"
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>

            {message && (
              <p className="mb-3 text-sm text-emerald-600 dark:text-emerald-400">{message}</p>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={isPending}
                className="flex-1 rounded-lg bg-zinc-900 py-2 text-sm font-bold text-white transition-opacity hover:opacity-80 disabled:opacity-50 dark:bg-white dark:text-zinc-900"
              >
                {isPending ? 'Lagrer…' : 'Lagre endring'}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Avbryt
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
