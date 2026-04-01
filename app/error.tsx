'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
      <span className="text-4xl">⚡</span>
      <h2 className="mt-4 text-lg font-bold text-zinc-900 dark:text-white">
        Something went wrong
      </h2>
      <p className="mt-2 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
        An unexpected error occurred. This is usually temporary — try refreshing.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-pitch px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90 dark:text-zinc-950"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-zinc-200 px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
