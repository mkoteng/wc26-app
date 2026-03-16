import { Suspense } from 'react'
import { getGroupStandings } from '@/lib/wc26'
import { GroupTable } from '@/components/features/groups/GroupTable'
import { GroupsGridSkeleton } from '@/components/features/groups/GroupTableSkeleton'

// ── Groups grid ──────────────────────────────────────────────────────────────

function GroupsGrid() {
  const groups = getGroupStandings()

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {groups.map((group) => (
        <GroupTable key={group.groupId} group={group} />
      ))}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function GroupsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Group Stage
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          12 groups &middot; 4 teams each &middot; Top 2 advance to Round of 32
        </p>
      </div>

      {/* Legend */}
      <div className="mb-6 flex flex-wrap items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-0.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
          Advances
        </span>
        <span className="hidden sm:inline">
          P = Played &middot; W = Won &middot; D = Drawn &middot; L = Lost &middot;
          GF = Goals For &middot; GA = Goals Against &middot; GD = Goal Difference &middot; Pts = Points
        </span>
      </div>

      {/* Groups */}
      <Suspense fallback={<GroupsGridSkeleton />}>
        <GroupsGrid />
      </Suspense>
    </div>
  )
}
