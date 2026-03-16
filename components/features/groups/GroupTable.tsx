import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { GroupStandingTable, GroupStanding } from '@/types/index'

interface GroupTableProps {
  group: GroupStandingTable
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtGD(gd: number): string {
  if (gd > 0) return `+${gd}`
  return String(gd)
}

// ── Standing row ─────────────────────────────────────────────────────────────

function StandingRow({
  standing,
  position,
  qualifies,
}: {
  standing: GroupStanding
  position: number
  qualifies: boolean
}) {
  const { team } = standing

  return (
    <TableRow
      className={[
        'border-b border-zinc-100 transition-colors last:border-0 dark:border-zinc-800/60',
        // Row hover
        'hover:bg-zinc-50 dark:hover:bg-zinc-800/40',
        // Qualifying highlight
        qualifies ? 'relative' : '',
      ].join(' ')}
    >
      {/* Qualifying marker — left border via a pseudo-element trick using a div cell */}
      {qualifies && (
        <td
          aria-hidden
          className="absolute left-0 top-0 h-full w-0.5 bg-emerald-500 dark:bg-emerald-400"
        />
      )}

      {/* Position */}
      <TableCell className="w-8 pl-4 pr-2 text-center text-xs font-bold text-zinc-400 dark:text-zinc-500 sm:pl-5">
        <span
          className={
            qualifies
              ? 'text-emerald-600 dark:text-emerald-400'
              : ''
          }
        >
          {position}
        </span>
      </TableCell>

      {/* Team */}
      <TableCell className="min-w-0 py-2.5 pl-1">
        <Link
          href={`/teams/${team.id}`}
          className="group/link flex min-w-0 items-center gap-2"
        >
          <span className="shrink-0 text-lg leading-none">{team.flag_emoji}</span>
          <span className="truncate text-sm font-semibold text-zinc-800 group-hover/link:text-emerald-600 dark:text-zinc-200 dark:group-hover/link:text-emerald-400">
            {team.name}
          </span>
          {team.is_host && (
            <span className="hidden shrink-0 rounded-full bg-emerald-100 px-1.5 py-0.5 text-xs font-semibold leading-none text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 sm:inline">
              Host
            </span>
          )}
        </Link>
      </TableCell>

      {/* Played — hidden on mobile */}
      <TableCell className="hidden w-8 text-center text-xs tabular-nums text-zinc-500 dark:text-zinc-400 sm:table-cell">
        {standing.played}
      </TableCell>

      {/* Won — hidden on mobile */}
      <TableCell className="hidden w-8 text-center text-xs tabular-nums text-zinc-500 dark:text-zinc-400 sm:table-cell">
        {standing.won}
      </TableCell>

      {/* Drawn — hidden on mobile */}
      <TableCell className="hidden w-8 text-center text-xs tabular-nums text-zinc-500 dark:text-zinc-400 sm:table-cell">
        {standing.drawn}
      </TableCell>

      {/* Lost — hidden on mobile */}
      <TableCell className="hidden w-8 text-center text-xs tabular-nums text-zinc-500 dark:text-zinc-400 sm:table-cell">
        {standing.lost}
      </TableCell>

      {/* GF — hidden on mobile */}
      <TableCell className="hidden w-8 text-center text-xs tabular-nums text-zinc-500 dark:text-zinc-400 sm:table-cell">
        {standing.goalsFor}
      </TableCell>

      {/* GA — hidden on mobile */}
      <TableCell className="hidden w-8 text-center text-xs tabular-nums text-zinc-500 dark:text-zinc-400 sm:table-cell">
        {standing.goalsAgainst}
      </TableCell>

      {/* GD — hidden on mobile */}
      <TableCell
        className={[
          'hidden w-10 text-center text-xs font-medium tabular-nums sm:table-cell',
          standing.goalDifference > 0
            ? 'text-emerald-600 dark:text-emerald-400'
            : standing.goalDifference < 0
              ? 'text-red-500 dark:text-red-400'
              : 'text-zinc-400 dark:text-zinc-500',
        ].join(' ')}
      >
        {fmtGD(standing.goalDifference)}
      </TableCell>

      {/* Points — always visible, bold */}
      <TableCell className="w-10 pr-4 text-center text-sm font-bold tabular-nums text-zinc-900 dark:text-white sm:pr-5">
        {standing.points}
      </TableCell>
    </TableRow>
  )
}

// ── GroupTable ────────────────────────────────────────────────────────────────

export function GroupTable({ group }: GroupTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {/* Card header */}
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <h2 className="text-sm font-bold tracking-wide text-zinc-900 dark:text-white">
          Group {group.groupId}
        </h2>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          Top 2 advance
        </span>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-b border-zinc-100 hover:bg-transparent dark:border-zinc-800">
            {/* # */}
            <TableHead className="w-8 pl-4 pr-2 text-center text-xs text-zinc-400 dark:text-zinc-500 sm:pl-5">
              #
            </TableHead>
            {/* Team */}
            <TableHead className="pl-1 text-xs text-zinc-400 dark:text-zinc-500">
              Team
            </TableHead>
            {/* P */}
            <TableHead className="hidden w-8 text-center text-xs text-zinc-400 dark:text-zinc-500 sm:table-cell">
              P
            </TableHead>
            {/* W */}
            <TableHead className="hidden w-8 text-center text-xs text-zinc-400 dark:text-zinc-500 sm:table-cell">
              W
            </TableHead>
            {/* D */}
            <TableHead className="hidden w-8 text-center text-xs text-zinc-400 dark:text-zinc-500 sm:table-cell">
              D
            </TableHead>
            {/* L */}
            <TableHead className="hidden w-8 text-center text-xs text-zinc-400 dark:text-zinc-500 sm:table-cell">
              L
            </TableHead>
            {/* GF */}
            <TableHead className="hidden w-8 text-center text-xs text-zinc-400 dark:text-zinc-500 sm:table-cell">
              GF
            </TableHead>
            {/* GA */}
            <TableHead className="hidden w-8 text-center text-xs text-zinc-400 dark:text-zinc-500 sm:table-cell">
              GA
            </TableHead>
            {/* GD */}
            <TableHead className="hidden w-10 text-center text-xs text-zinc-400 dark:text-zinc-500 sm:table-cell">
              GD
            </TableHead>
            {/* Pts */}
            <TableHead className="w-10 pr-4 text-center text-xs font-bold text-zinc-500 dark:text-zinc-400 sm:pr-5">
              Pts
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {group.standings.map((standing, i) => (
            <StandingRow
              key={standing.team.id}
              standing={standing}
              position={i + 1}
              qualifies={i < 2}
            />
          ))}
        </TableBody>
      </Table>

      {/* Legend — mobile only */}
      <div className="border-t border-zinc-100 px-4 py-2 dark:border-zinc-800 sm:hidden">
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          Showing Pts only &mdash; rotate or use a wider screen for full stats
        </p>
      </div>
    </div>
  )
}
