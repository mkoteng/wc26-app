import { Skeleton } from '@/components/ui/skeleton'

export default function VenueLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Skeleton className="mb-5 h-5 w-24 rounded" />
      {/* Hero */}
      <Skeleton className="mb-6 aspect-[16/7] w-full rounded-2xl" />
      {/* Info grid */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
      {/* Weather */}
      <Skeleton className="mb-8 h-20 rounded-xl" />
      {/* Match list */}
      <Skeleton className="mb-4 h-7 w-48 rounded" />
      <div className="space-y-2.5">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-[88px] rounded-xl" />
        ))}
      </div>
    </div>
  )
}
