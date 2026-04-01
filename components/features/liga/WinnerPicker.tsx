'use client'

import { useEffect, useState } from 'react'
import { Trophy, Lock, Check } from 'lucide-react'
import { useT } from '@/components/shared/LocaleProvider'
import { getTeams } from '@/lib/wc26'
import {
  isTournamentWinnerDeadlinePassed,
  formatTournamentDeadline,
} from '@/lib/deadlines'

interface WinnerPickerProps {
  leagueId: string
}

export function WinnerPicker({ leagueId }: WinnerPickerProps) {
  const t = useT()
  const teams = getTeams()
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [deadlinePassed, setDeadlinePassed] = useState(() => isTournamentWinnerDeadlinePassed())

  useEffect(() => {
    if (deadlinePassed) return
    const id = setInterval(() => setDeadlinePassed(isTournamentWinnerDeadlinePassed()), 15000)
    return () => clearInterval(id)
  }, [deadlinePassed])

  // Fetch current pick
  useEffect(() => {
    fetch(`/api/liga/${leagueId}/vinner`)
      .then((r) => r.json())
      .then((data) => {
        const own = data.predictions?.[0]
        if (own) setSelectedTeamId(own.teamId)
      })
      .catch(() => {})
  }, [leagueId])

  async function savePick(teamId: string) {
    if (deadlinePassed || saving) return
    setSaving(true)
    try {
      const res = await fetch(`/api/liga/${leagueId}/vinner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId }),
      })
      if (res.ok) {
        setSelectedTeamId(teamId)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch {
      // silent
    } finally {
      setSaving(false)
    }
  }

  const selectedTeam = teams.find((t) => t.id === selectedTeamId)

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-gold" />
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
          {t.liga.whoWinsWC}
        </h3>
      </div>

      {deadlinePassed ? (
        // Locked state
        <div className="flex items-center gap-3">
          <Lock className="h-4 w-4 text-zinc-400" />
          {selectedTeam ? (
            <div className="flex items-center gap-2">
              <span className="text-xl">{selectedTeam.flag_emoji}</span>
              <span className="font-semibold text-zinc-900 dark:text-white">
                {t.teamNames[selectedTeam.name] ?? selectedTeam.name}
              </span>
              <span className="text-xs text-zinc-400">
                — {t.liga.deadlinePassed}
              </span>
            </div>
          ) : (
            <span className="text-sm text-zinc-500">
              {t.liga.missedWinner}
            </span>
          )}
        </div>
      ) : (
        // Active state
        <>
          <select
            value={selectedTeamId ?? ''}
            onChange={(e) => {
              const val = e.target.value
              if (val) savePick(val)
            }}
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          >
            <option value="">{t.liga.selectTeam}</option>
            {teams
              .sort((a, b) => {
                const nameA = t.teamNames[a.name] ?? a.name
                const nameB = t.teamNames[b.name] ?? b.name
                return nameA.localeCompare(nameB)
              })
              .map((team) => (
                <option key={team.id} value={team.id}>
                  {team.flag_emoji} {t.teamNames[team.name] ?? team.name}
                </option>
              ))}
          </select>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              {formatTournamentDeadline()}
            </span>
            {saving && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-gold" />
            )}
            {saved && !saving && (
              <div className="flex items-center gap-1 text-xs text-pitch">
                <Check className="h-3.5 w-3.5" />
                {t.liga.saved}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
