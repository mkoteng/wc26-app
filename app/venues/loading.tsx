import { Skeleton } from '@/components/ui/skeleton'

export default function VenuesLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Skeleton className="mb-2 h-9 w-40 rounded" />
      <Skeleton className="mb-8 h-5 w-72 rounded" />
      {/* Stats pills */}
      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      {/* Country sections */}
      <div className="space-y-12">
        {[1, 2].map((c) => (
          <div key={c}>
            <Skeleton className="mb-4 h-5 w-32 rounded" />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <Skeleton className="aspect-video w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-5 w-36 rounded" />
                    <Skeleton className="h-4 w-28 rounded" />
                    <Skeleton className="h-4 w-20 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
