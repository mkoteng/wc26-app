import { Skeleton } from '@/components/ui/skeleton'

export function MatchCardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="h-5 w-32 rounded-md" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
      <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>
        <Skeleton className="h-6 w-12 rounded" />
        <div className="flex flex-row-reverse items-center gap-2">
          <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1">
        <Skeleton className="h-3 w-3 rounded-full" />
        <Skeleton className="h-3 w-48 rounded" />
      </div>
    </div>
  )
}

export function MatchListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <MatchCardSkeleton key={i} />
      ))}
    </div>
  )
}
