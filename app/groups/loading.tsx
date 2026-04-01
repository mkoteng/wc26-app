import { GroupsGridSkeleton } from '@/components/features/groups/GroupTableSkeleton'
import { Skeleton } from '@/components/ui/skeleton'

export default function GroupsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <Skeleton className="mb-2 h-9 w-48 rounded" />
        <Skeleton className="h-5 w-72 rounded" />
      </div>
      {/* View toggle */}
      <div className="mb-6 flex gap-2">
        <Skeleton className="h-9 w-32 rounded-lg" />
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>
      <GroupsGridSkeleton />
    </div>
  )
}
