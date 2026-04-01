import { Skeleton } from '@/components/ui/skeleton'
import { MatchListSkeleton } from '@/components/features/fixtures/MatchCardSkeleton'

export default function FixturesLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Skeleton className="mb-2 h-9 w-44 rounded" />
      <Skeleton className="mb-8 h-5 w-64 rounded" />
      {/* Filter bar */}
      <div className="mb-6 flex gap-2">
        <Skeleton className="h-10 w-32 rounded-xl" />
        <Skeleton className="h-10 w-28 rounded-xl" />
        <Skeleton className="h-10 w-24 rounded-xl" />
      </div>
      <MatchListSkeleton count={8} />
    </div>
  )
}
