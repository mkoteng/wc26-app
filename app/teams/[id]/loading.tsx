import { Skeleton } from '@/components/ui/skeleton'

export default function TeamLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Skeleton className="mb-5 h-5 w-24 rounded" />
      {/* Hero */}
      <Skeleton className="mb-6 h-52 rounded-2xl" />
      <div className="grid gap-5 lg:grid-cols-[1fr,360px]">
        <div className="space-y-5">
          {/* Squad section */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="border-b border-zinc-100 px-5 py-3.5 dark:border-zinc-800">
              <Skeleton className="h-4 w-32 rounded" />
            </div>
            <div className="space-y-2 p-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-zinc-100 px-3 py-2.5 dark:border-zinc-800">
                  <div>
                    <Skeleton className="mb-1 h-4 w-28 rounded" />
                    <Skeleton className="h-3 w-20 rounded" />
                  </div>
                  <Skeleton className="h-6 w-10 rounded-md" />
                </div>
              ))}
            </div>
          </div>
          {/* History section */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="border-b border-zinc-100 px-5 py-3.5 dark:border-zinc-800">
              <Skeleton className="h-4 w-36 rounded" />
            </div>
            <div className="grid grid-cols-3 gap-3 p-5">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-5">
          {/* Fixtures section */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="border-b border-zinc-100 px-5 py-3.5 dark:border-zinc-800">
              <Skeleton className="h-4 w-20 rounded" />
            </div>
            <div className="space-y-2.5 p-5">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[88px] rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
