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
        'hover:bg-zinc-50 dark:hover:bg-zinc-800/40',
        // Emerald left-border via inset box-shadow — purely visual, zero effect on layout
        qualifies
          ? '[box-shadow:inset_2px_0_0_#10b981] bg-emerald-50/40 dark:bg-emerald-500/[0.04] dark:[box-shadow:inset_2px_0_0_#34d399]'
          : '',
      ].join(' ')}
    >
      {/* Position — col width set by <colgroup> */}
      <TableCell className="py-2.5 pl-4 pr-2 text-center text-xs font-bold sm:pl-5">
        <span className={qualifies ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-500'}>
          {position}
        </span>
      </TableCell>

      {/* Team */}
      <TableCell className="py-2.5 pl-1 pr-2">
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

      {/* P — hidden on mobile */}
      <TableCell className="hidden py-2.5 text-center text-xs tabular-nums text-zinc-500 dark:text-zinc-400 sm:table-cell">
        {standing.played}
      </TableCell>

      {/* W — hidden on mobile */}
      <TableCell className="hidden py-2.5 text-center text-xs tabular-nums text-zinc-500 dark:text-zinc-400 sm:table-cell">
        {standing.won}
      </TableCell>

      {/* D — hidden on mobile */}
      <TableCell className="hidden py-2.5 text-center text-xs tabular-nums text-zinc-500 dark:text-zinc-400 sm:table-cell">
        {standing.drawn}
      </TableCell>

      {/* L — hidden on mobile */}
      <TableCell className="hidden py-2.5 text-center text-xs tabular-nums text-zinc-500 dark:text-zinc-400 sm:table-cell">
        {standing.lost}
      </TableCell>

      {/* GF — hidden on mobile */}
      <TableCell className="hidden py-2.5 text-center text-xs tabular-nums text-zinc-500 dark:text-zinc-400 sm:table-cell">
        {standing.goalsFor}
      </TableCell>

      {/* GA — hidden on mobile */}
      <TableCell className="hidden py-2.5 text-center text-xs tabular-nums text-zinc-500 dark:text-zinc-400 sm:table-cell">
        {standing.goalsAgainst}
      </TableCell>

      {/* GD — hidden on mobile */}
      <TableCell
        className={[
          'hidden py-2.5 text-center text-xs font-medium tabular-nums sm:table-cell',
          standing.goalDifference > 0
            ? 'text-emerald-600 dark:text-emerald-400'
            : standing.goalDifference < 0
              ? 'text-red-500 dark:text-red-400'
              : 'text-zinc-400 dark:text-zinc-500',
        ].join(' ')}
      >
        {fmtGD(standing.goalDifference)}
      </TableCell>

      {/* Pts — always visible */}
      <TableCell className="py-2.5 pr-4 text-center text-sm font-bold tabular-nums text-zinc-900 dark:text-white sm:pr-5">
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

      <Table className="table-fixed">
        {/*
          Explicit column widths — prevents any cell from being squeezed/cut.
          Mobile: only # | Team | Pts columns are visible.
          Desktop (sm+): all 10 columns are visible.
        */}
        <colgroup>
          {/* # */}
          <col className="w-9" />
          {/* Team — takes remaining space */}
          <col />
          {/* P W D L GF GA — each 32px, hidden on mobile */}
          <col className="hidden w-8 sm:table-column" />
          <col className="hidden w-8 sm:table-column" />
          <col className="hidden w-8 sm:table-column" />
          <col className="hidden w-8 sm:table-column" />
          <col className="hidden w-8 sm:table-column" />
          <col className="hidden w-8 sm:table-column" />
          {/* GD — 40px, hidden on mobile */}
          <col className="hidden w-10 sm:table-column" />
          {/* Pts */}
          <col className="w-10" />
        </colgroup>

        <TableHeader>
          <TableRow className="border-b border-zinc-100 hover:bg-transparent dark:border-zinc-800">
            <TableHead className="py-2 pl-4 pr-2 text-center text-xs text-zinc-400 dark:text-zinc-500 sm:pl-5">
              #
            </TableHead>
            <TableHead className="py-2 pl-1 pr-2 text-xs text-zinc-400 dark:text-zinc-500">
              Team
            </TableHead>
            <TableHead className="hidden py-2 text-center text-xs text-zinc-400 dark:text-zinc-500 sm:table-cell">
              P
            </TableHead>
            <TableHead className="hidden py-2 text-center text-xs text-zinc-400 dark:text-zinc-500 sm:table-cell">
              W
            </TableHead>
            <TableHead className="hidden py-2 text-center text-xs text-zinc-400 dark:text-zinc-500 sm:table-cell">
              D
            </TableHead>
            <TableHead className="hidden py-2 text-center text-xs text-zinc-400 dark:text-zinc-500 sm:table-cell">
              L
            </TableHead>
            <TableHead className="hidden py-2 text-center text-xs text-zinc-400 dark:text-zinc-500 sm:table-cell">
              GF
            </TableHead>
            <TableHead className="hidden py-2 text-center text-xs text-zinc-400 dark:text-zinc-500 sm:table-cell">
              GA
            </TableHead>
            <TableHead className="hidden py-2 text-center text-xs text-zinc-400 dark:text-zinc-500 sm:table-cell">
              GD
            </TableHead>
            <TableHead className="py-2 pr-4 text-center text-xs font-bold text-zinc-500 dark:text-zinc-400 sm:pr-5">
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
          Full stats on wider screens
        </p>
      </div>
    </div>
  )
}
