import type { KeyPlayer } from '@/types/index'

interface PlayerListProps {
  players: KeyPlayer[]
}

const POSITION_COLORS: Record<string, string> = {
  GK: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  DEF: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400',
  MID: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400',
  FWD: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
}

function positionColor(pos: string): string {
  // Normalise e.g. "Midfielder" → "MID"
  const upper = pos.toUpperCase()
  if (upper.startsWith('GK') || upper.includes('GOAL')) return POSITION_COLORS.GK
  if (upper.startsWith('DEF') || upper.includes('BACK') || upper.includes('CENTRE')) return POSITION_COLORS.DEF
  if (upper.startsWith('MID') || upper.includes('MID')) return POSITION_COLORS.MID
  if (upper.startsWith('FWD') || upper.includes('FORWARD') || upper.includes('ATTAC') || upper.includes('WINGER')) return POSITION_COLORS.FWD
  return 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
}

export function PlayerList({ players }: PlayerListProps) {
  if (players.length === 0) {
    return (
      <p className="text-sm text-zinc-400 dark:text-zinc-500">No player data available.</p>
    )
  }

  return (
    <ul className="space-y-2">
      {players.map((player) => (
        <li
          key={player.name}
          className="flex items-center justify-between gap-3 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-800/50"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
              {player.name}
            </p>
            {player.club && (
              <p className="truncate text-xs text-zinc-400 dark:text-zinc-500">
                {player.club}
              </p>
            )}
          </div>

          <span
            className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wide ${positionColor(player.position)}`}
          >
            {player.position}
          </span>
        </li>
      ))}
    </ul>
  )
}
