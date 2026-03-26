import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { getGroupStandings } from '@/lib/wc26'
import { getLocale } from '@/lib/locale'
import { dict } from '@/lib/i18n'
import { GroupTable } from '@/components/features/groups/GroupTable'
import { GroupsGridSkeleton } from '@/components/features/groups/GroupTableSkeleton'
import { BracketView } from '@/components/features/bracket/BracketView'
import type { Locale } from '@/lib/locale'

export const metadata: Metadata = {
  title: 'Tournament',
  description: 'FIFA World Cup 2026 group stage standings and knockout bracket — 12 groups, 48 teams.',
}

interface PageProps {
  searchParams: Promise<{ view?: string }>
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

export default async function GroupsPage({ searchParams }: PageProps) {
  const { view } = await searchParams
  const isBracket = view === 'bracket'

  const locale = await getLocale()
  const t = dict[locale]

  return (
    <div className="animate-fade-up mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          {t.tournament.title}
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {isBracket ? t.tournament.subtitle : t.groups.subtitle}
        </p>
      </div>

      {/* View toggle */}
      <div className="mb-6 flex items-center gap-2">
        <Link
          href="/groups"
          className={[
            'rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
            !isBracket
              ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
              : 'border border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-800',
          ].join(' ')}
        >
          {t.tournament.viewGroups}
        </Link>
        <Link
          href="/groups?view=bracket"
          className={[
            'rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
            isBracket
              ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
              : 'border border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-800',
          ].join(' ')}
        >
          {t.tournament.viewBracket}
        </Link>
      </div>

      {/* Group stage legend */}
      {!isBracket && (
        <div className="mb-6 flex flex-wrap items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-0.5 rounded-full bg-pitch" />
            {t.groups.advances}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-0.5 rounded-full bg-amber-500 dark:bg-amber-400" />
            {t.groups.mayAdvance}
          </span>
          <span className="hidden sm:inline">
            {t.groups.legend}
          </span>
        </div>
      )}

      {/* Content */}
      {isBracket ? (
        <BracketView locale={locale} />
      ) : (
        <Suspense fallback={<GroupsGridSkeleton />}>
          <GroupsGrid locale={locale} />
        </Suspense>
      )}
    </div>
  )
}
