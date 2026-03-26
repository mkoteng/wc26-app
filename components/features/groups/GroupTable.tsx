import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { dict } from '@/lib/i18n'
import type { Locale } from '@/lib/locale'
import type { GroupStandingTable, GroupStanding } from '@/types/index'

interface GroupTableProps {
  group: GroupStandingTable
  locale: Locale
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
  mayQualify,
}: {
  standing: GroupStanding
  position: number
  qualifies: boolean
  mayQualify: boolean
}) {
  const { team } = standing

  return (
    <TableRow
      className={[
        'border-b border-zinc-100 transition-colors last:border-0 dark:border-zinc-800/60',
        'hover:bg-zinc-50 dark:hover:bg-zinc-800/40',
        // Position 1 = gold (champion), position 2 = pitch green (qualifies), position 3 = amber (may qualify)
        position === 1
          ? '[box-shadow:inset_2px_0_0_var(--gold)] bg-amber-50/40 dark:bg-amber-500/[0.04]'
          : qualifies
            ? '[box-shadow:inset_2px_0_0_var(--pitch)] bg-pitch/[0.06] dark:bg-pitch/[0.05]'
            : mayQualify
              ? '[box-shadow:inset_2px_0_0_#f59e0b] bg-yellow-50/40 dark:bg-yellow-500/[0.04] dark:[box-shadow:inset_2px_0_0_#fbbf24]'
              : '',
      ].join(' ')}
    >
      {/* Position — col width set by <colgroup> */}
      <TableCell className="py-2.5 pl-4 pr-2 text-center text-xs font-bold sm:pl-5">
        <span className={
          position === 1
            ? 'text-gold font-extrabold'
            : qualifies
              ? 'text-pitch'
              : mayQualify
                ? 'text-amber-500 dark:text-amber-400'
                : 'text-zinc-400 dark:text-zinc-500'
        }>
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
          <span className={`truncate text-sm font-semibold dark:text-zinc-200 ${
            position === 1
              ? 'text-zinc-900 group-hover/link:text-gold dark:group-hover/link:text-gold'
              : qualifies
                ? 'text-zinc-800 group-hover/link:text-pitch'
                : mayQualify
                  ? 'text-zinc-800 group-hover/link:text-amber-500 dark:group-hover/link:text-amber-400'
                  : 'text-zinc-800 group-hover/link:text-zinc-600 dark:group-hover/link:text-zinc-300'
          }`}>
            {team.name}
          </span>
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
            ? 'text-pitch'
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

export function GroupTable({ group, locale }: GroupTableProps) {
  const t = dict[locale].groups
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {/* Card header */}
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <h2 className="text-sm font-bold tracking-wide text-zinc-900 dark:text-white">
          {t.group(group.groupId)}
        </h2>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          {t.top2Advance}
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
              {t.teamHeader}
            </TableHead>
            <TableHead className="hidden py-2 text-center text-xs text-zinc-400 dark:text-zinc-500 sm:table-cell">
              {t.colP}
            </TableHead>
            <TableHead className="hidden py-2 text-center text-xs text-zinc-400 dark:text-zinc-500 sm:table-cell">
              {t.colW}
            </TableHead>
            <TableHead className="hidden py-2 text-center text-xs text-zinc-400 dark:text-zinc-500 sm:table-cell">
              {t.colD}
            </TableHead>
            <TableHead className="hidden py-2 text-center text-xs text-zinc-400 dark:text-zinc-500 sm:table-cell">
              {t.colL}
            </TableHead>
            <TableHead className="hidden py-2 text-center text-xs text-zinc-400 dark:text-zinc-500 sm:table-cell">
              {t.colGF}
            </TableHead>
            <TableHead className="hidden py-2 text-center text-xs text-zinc-400 dark:text-zinc-500 sm:table-cell">
              {t.colGA}
            </TableHead>
            <TableHead className="hidden py-2 text-center text-xs text-zinc-400 dark:text-zinc-500 sm:table-cell">
              {t.colGD}
            </TableHead>
            <TableHead className="py-2 pr-4 text-center text-xs font-bold text-zinc-500 dark:text-zinc-400 sm:pr-5">
              {t.colPts}
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
              mayQualify={i === 2}
            />
          ))}
        </TableBody>
      </Table>

      {/* Legend — mobile only */}
      <div className="border-t border-zinc-100 px-4 py-2 dark:border-zinc-800 sm:hidden">
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          {t.fullStats}
        </p>
      </div>
    </div>
  )
}
