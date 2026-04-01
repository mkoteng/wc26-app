import { Skeleton } from '@/components/ui/skeleton'

export default function HomeLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Skeleton className="mb-12 h-72 rounded-2xl" />
      <div className="grid gap-8 lg:grid-cols-[1fr,1fr]">
        <div className="space-y-3">
          <Skeleton className="mb-4 h-6 w-40 rounded" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <div className="mb-3 flex items-center justify-between">
                <Skeleton className="h-5 w-28 rounded-md" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
              <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-3">
                <div className="flex items-center gap-2.5">
                  <Skeleton className="h-7 w-7 rounded-full" />
                  <Skeleton className="h-4 w-20 rounded" />
                </div>
                <Skeleton className="h-7 w-12 rounded" />
                <div className="flex flex-row-reverse items-center gap-2.5">
                  <Skeleton className="h-7 w-7 rounded-full" />
                  <Skeleton className="h-4 w-20 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-2.5">
          <Skeleton className="mb-4 h-6 w-32 rounded" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <div className="mb-3 flex items-center justify-between">
                <Skeleton className="h-5 w-36 rounded-md" />
                <Skeleton className="h-4 w-12 rounded" />
              </div>
              <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-4 w-16 rounded" />
                </div>
                <Skeleton className="h-5 w-8 rounded" />
                <div className="flex flex-row-reverse items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-4 w-16 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
