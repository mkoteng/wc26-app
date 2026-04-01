import { Skeleton } from '@/components/ui/skeleton'

export default function LigaLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Skeleton className="mb-6 h-8 w-48" />
      <div className="mb-8 grid grid-cols-2 gap-3">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>
    </div>
  )
}
