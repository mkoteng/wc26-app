import { Skeleton } from '@/components/ui/skeleton'

export default function TeamsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Skeleton className="mb-2 h-9 w-32 rounded" />
      <Skeleton className="mb-8 h-5 w-56 rounded" />
      <div className="space-y-10">
        {[1, 2].map((g) => (
          <div key={g}>
            <Skeleton className="mb-4 h-6 w-24 rounded" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                  <Skeleton className="mb-3 h-12 w-12 rounded-full" />
                  <Skeleton className="mb-1.5 h-4 w-20 rounded" />
                  <Skeleton className="h-3 w-16 rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
