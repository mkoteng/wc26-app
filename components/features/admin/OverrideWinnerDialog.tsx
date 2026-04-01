'use client'

import { useState, useTransition } from 'react'
import { overrideTournamentWinner } from '@/app/admin/actions'
import { getTeams } from '@/lib/wc26'

const allTeams = getTeams().sort((a, b) => a.name.localeCompare(b.name))

interface Props {
  userId: string
  leagueId: string
  userName: string
  currentTeamId: string | null
  currentTeamName: string | null
}

export function OverrideWinnerDialog({
  userId,
  leagueId,
  userName,
  currentTeamId,
  currentTeamName,
}: Props) {
  const [open, setOpen] = useState(false)
  const [teamId, setTeamId] = useState(currentTeamId ?? allTeams[0]?.id ?? '')
  const [search, setSearch] = useState('')
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const filtered = search
    ? allTeams.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))
    : allTeams

  function handleOpen() {
    setTeamId(currentTeamId ?? allTeams[0]?.id ?? '')
    setSearch('')
    setReason('')
    setMessage(null)
    setOpen(true)
  }

  function handleSave() {
    startTransition(async () => {
      const result = await overrideTournamentWinner(userId, leagueId, teamId, reason || undefined)
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
              Overstyr VM-vinner tips
            </h3>
            <p className="mb-1 text-sm text-zinc-500">{userName}</p>
            {currentTeamName && (
              <p className="mb-4 text-xs text-zinc-400">Nåværende: {currentTeamName}</p>
            )}

            <div className="mb-3">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Søk etter lag…"
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>

            <div className="mb-4 max-h-48 overflow-y-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
              {filtered.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTeamId(t.id)}
                  className={[
                    'flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors',
                    teamId === t.id
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                      : 'text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800',
                  ].join(' ')}
                >
                  <span>{t.flag_emoji}</span>
                  <span>{t.name}</span>
                </button>
              ))}
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
                disabled={isPending || !teamId}
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
