import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getGroupStandings } from '@/lib/wc26'
import { getLocale } from '@/lib/locale'
import { dict } from '@/lib/i18n'
import { GroupTable } from '@/components/features/groups/GroupTable'
import { GroupsGridSkeleton } from '@/components/features/groups/GroupTableSkeleton'
import type { Locale } from '@/lib/locale'

export const metadata: Metadata = {
  title: 'Group Stage',
  description: 'FIFA World Cup 2026 group stage standings — 12 groups, 48 teams.',
}

function GroupsGrid({ locale }: { locale: Locale }) {
  const groups = getGroupStandings()

  return (
    <div className="stagger-children grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {groups.map((group) => (
        <GroupTable key={group.groupId} group={group} locale={locale} />
      ))}
    </div>
  )
}

export default async function GroupsPage() {
  const locale = await getLocale()
  const t = dict[locale].groups

  return (
    <div className="animate-fade-up mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          {t.title}
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {t.subtitle}
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-0.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
          {t.advances}
        </span>
        <span className="hidden sm:inline">
          {t.legend}
        </span>
      </div>

      <Suspense fallback={<GroupsGridSkeleton />}>
        <GroupsGrid locale={locale} />
      </Suspense>
    </div>
  )
}
