import { Skeleton } from '@/components/ui/skeleton'

export default function FavouritesLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Header banner */}
      <Skeleton className="mb-8 h-28 rounded-2xl" />
      {/* Teams grid */}
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-6 w-32 rounded" />
        <Skeleton className="h-5 w-6 rounded-full" />
      </div>
      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="mb-3 flex items-start justify-between">
              <Skeleton className="h-4 w-8 rounded-full" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
            <Skeleton className="mb-2.5 h-12 w-12 rounded-full" />
            <Skeleton className="mb-1 h-4 w-20 rounded" />
            <Skeleton className="h-3 w-16 rounded" />
          </div>
        ))}
      </div>
      {/* Upcoming matches */}
      <Skeleton className="mb-4 h-6 w-44 rounded" />
      <div className="space-y-2.5">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[88px] rounded-xl" />
        ))}
      </div>
    </div>
  )
}
