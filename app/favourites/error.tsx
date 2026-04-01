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
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
        <svg
          className="h-6 w-6 text-zinc-400 dark:text-zinc-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
      </div>
      <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
        Something went wrong
      </h2>
      <p className="mt-2 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
        An unexpected error occurred. Try refreshing the page.
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
