'use client'

import Link from 'next/link'

export default function LigaDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/10">
        <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <h2 className="mb-2 text-lg font-bold text-zinc-900 dark:text-white">
        Noe gikk galt
      </h2>
      <p className="mb-6 text-sm text-zinc-500">{error.message}</p>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
        >
          Prøv igjen
        </button>
        <Link
          href="/liga"
          className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Tilbake
        </Link>
      </div>
    </div>
  )
}
