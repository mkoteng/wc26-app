import { Skeleton } from '@/components/ui/skeleton'

export default function LigaDetailLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Skeleton className="mb-4 h-8 w-64" />
      <Skeleton className="mb-8 h-4 w-40" />
      <Skeleton className="mb-6 h-10 w-80" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  )
}
