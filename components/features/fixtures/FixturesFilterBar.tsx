'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { useT } from '@/components/shared/LocaleProvider'

const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'] as const

interface FixturesFilterBarProps {
  activeGroup?: string
  activeDate?: string
}

export function FixturesFilterBar({ activeGroup, activeDate }: FixturesFilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useT()

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      }
      router.push(`/fixtures?${params.toString()}`)
    },
    [router, searchParams]
  )

  return (
    <div className="space-y-3">
      {/* Group filter pills — scrollable on mobile, wrapping on desktop */}
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-1.5 sm:flex-wrap" style={{ width: 'max-content' }}>
          <button
            onClick={() => updateParams({ group: undefined })}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              !activeGroup
                ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-zinc-950'
                : 'border border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-800'
            }`}
          >
            {t.fixtures.allGroups}
          </button>
          {GROUPS.map((g) => (
            <button
              key={g}
              onClick={() => updateParams({ group: activeGroup === g ? undefined : g })}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                activeGroup === g
                  ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-zinc-950'
                  : 'border border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-800'
              }`}
            >
              {t.fixtures.group(g)}
            </button>
          ))}
        </div>
      </div>

      {/* Date filter */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400" htmlFor="date-filter">
          {t.fixtures.date}
        </label>
        <input
          id="date-filter"
          type="date"
          value={activeDate ?? ''}
          min="2026-06-11"
          max="2026-07-19"
          onChange={(e) => updateParams({ date: e.target.value || undefined })}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:focus:border-emerald-500"
        />
        {activeDate && (
          <button
            onClick={() => updateParams({ date: undefined })}
            className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            {t.fixtures.clear}
          </button>
        )}
      </div>
    </div>
  )
}
