'use client'

import { useEffect } from 'react'

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
      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-pitch px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90 dark:text-zinc-950"
      >
        Try again
      </button>
    </div>
  )
}
