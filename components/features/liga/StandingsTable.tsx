'use client'

import Image from 'next/image'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useT } from '@/components/shared/LocaleProvider'
import type { LeagueStanding } from '@/types/predictions'

interface StandingsTableProps {
  standings: LeagueStanding[]
  currentUserId: string
}

export function StandingsTable({ standings, currentUserId }: StandingsTableProps) {
  const t = useT()

  if (standings.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Ingen poeng ennå
      </p>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-zinc-100 hover:bg-transparent dark:border-zinc-800">
            <TableHead className="w-10 py-2 pl-4 text-center text-xs text-zinc-400">
              {t.liga.rank}
            </TableHead>
            <TableHead className="py-2 text-xs text-zinc-400">
              {t.liga.player}
            </TableHead>
            <TableHead className="w-14 py-2 text-center text-xs font-bold text-zinc-500">
              {t.liga.points}
            </TableHead>
            <TableHead className="hidden w-14 py-2 text-center text-xs text-zinc-400 sm:table-cell">
              {t.liga.exact}
            </TableHead>
            <TableHead className="hidden w-14 py-2 text-center text-xs text-zinc-400 sm:table-cell">
              {t.liga.correct}
            </TableHead>
            <TableHead className="hidden w-16 py-2 text-center text-xs text-zinc-400 sm:table-cell">
              {t.liga.winner}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {standings.map((s) => {
            const isYou = s.userId === currentUserId
            return (
              <TableRow
                key={s.userId}
                className={[
                  'border-b border-zinc-100 last:border-0 dark:border-zinc-800/60',
                  isYou
                    ? '[box-shadow:inset_2px_0_0_var(--pitch)] bg-pitch/[0.06] dark:bg-pitch/[0.05]'
                    : '',
                ].join(' ')}
              >
                <TableCell className="py-3 pl-4 text-center text-xs font-bold tabular-nums">
                  <span className={s.rank === 1 ? 'text-gold' : 'text-zinc-400 dark:text-zinc-500'}>
                    {s.rank}
                  </span>
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex items-center gap-2">
                    {s.image && (
                      <Image
                        src={s.image}
                        alt={s.displayName}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    )}
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-200">
                      {s.displayName}
                      {isYou && (
                        <span className="ml-1 text-xs font-normal text-pitch">
                          {t.liga.you}
                        </span>
                      )}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-3 text-center text-sm font-bold tabular-nums text-zinc-900 dark:text-white">
                  {s.points}
                </TableCell>
                <TableCell className="hidden py-3 text-center text-xs tabular-nums text-zinc-500 dark:text-zinc-400 sm:table-cell">
                  {s.exactScores}
                </TableCell>
                <TableCell className="hidden py-3 text-center text-xs tabular-nums text-zinc-500 dark:text-zinc-400 sm:table-cell">
                  {s.correctOutcomes}
                </TableCell>
                <TableCell className="hidden py-3 text-center text-xs tabular-nums sm:table-cell">
                  {s.winnerPoints > 0 ? (
                    <span className="font-bold text-pitch">+5</span>
                  ) : (
                    <span className="text-zinc-400 dark:text-zinc-500">—</span>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
