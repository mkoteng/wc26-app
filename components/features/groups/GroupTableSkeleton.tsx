import { Skeleton } from '@/components/ui/skeleton'

function GroupTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <Skeleton className="h-4 w-16 rounded" />
        <Skeleton className="h-3 w-20 rounded" />
      </div>

      {/* Column headers */}
      <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-2 dark:border-zinc-800">
        <Skeleton className="h-3 w-4 rounded" />
        <Skeleton className="h-3 w-24 rounded" />
        <div className="ml-auto flex gap-3">
          <Skeleton className="hidden h-3 w-4 rounded sm:block" />
          <Skeleton className="hidden h-3 w-4 rounded sm:block" />
          <Skeleton className="hidden h-3 w-4 rounded sm:block" />
          <Skeleton className="h-3 w-4 rounded" />
        </div>
      </div>

      {/* 4 team rows */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3 last:border-0 dark:border-zinc-800"
        >
          <Skeleton className="h-3 w-3 shrink-0 rounded" />
          <Skeleton className="h-5 w-5 shrink-0 rounded-full" />
          <Skeleton className="h-4 w-28 rounded" />
          <div className="ml-auto flex gap-3">
            <Skeleton className="hidden h-3 w-4 rounded sm:block" />
            <Skeleton className="hidden h-3 w-4 rounded sm:block" />
            <Skeleton className="hidden h-3 w-4 rounded sm:block" />
            <Skeleton className="h-4 w-5 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function GroupsGridSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 12 }).map((_, i) => (
        <GroupTableSkeleton key={i} />
      ))}
    </div>
  )
}
