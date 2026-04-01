import { Info } from 'lucide-react'
import { formatTournamentDeadline } from '@/lib/deadlines'

export function PointsInfoBox() {
  const winnerDeadline = formatTournamentDeadline()

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
      <div className="mb-3 flex items-center gap-2">
        <Info className="h-4 w-4 shrink-0 text-zinc-400" />
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Poengsystem
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
        <div className="flex items-center gap-2">
          <span className="min-w-[28px] rounded-md bg-zinc-900 px-1.5 py-0.5 text-center text-xs font-extrabold tabular-nums text-white dark:bg-white dark:text-zinc-900">
            3p
          </span>
          <span className="text-xs text-zinc-600 dark:text-zinc-400">Riktig resultat</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="min-w-[28px] rounded-md bg-zinc-200 px-1.5 py-0.5 text-center text-xs font-extrabold tabular-nums text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
            1p
          </span>
          <span className="text-xs text-zinc-600 dark:text-zinc-400">Riktig utfall</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="min-w-[28px] rounded-md bg-zinc-100 px-1.5 py-0.5 text-center text-xs font-extrabold tabular-nums text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
            0p
          </span>
          <span className="text-xs text-zinc-600 dark:text-zinc-400">Feil</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="min-w-[28px] rounded-md bg-amber-400/20 px-1.5 py-0.5 text-center text-xs font-extrabold tabular-nums text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
            5p
          </span>
          <span className="text-xs text-zinc-600 dark:text-zinc-400">VM-vinner</span>
        </div>
      </div>
      <div className="mt-3 space-y-0.5 text-xs text-zinc-400 dark:text-zinc-500">
        <p>Kampresultater: frist 15 min før avspark</p>
        <p>VM-vinner: {winnerDeadline}</p>
      </div>
    </div>
  )
}
