import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-6xl font-extrabold tabular-nums text-zinc-200 dark:text-zinc-800">404</p>
      <h2 className="mt-4 text-lg font-bold text-zinc-900 dark:text-white">Fixtures not found</h2>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">We couldn&apos;t find what you were looking for.</p>
      <div className="mt-6 flex gap-3">
        <Link href="/fixtures" className="rounded-lg bg-pitch px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90 dark:text-zinc-950">
          All fixtures
        </Link>
        <Link href="/" className="rounded-lg border border-zinc-200 px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
          Go home
        </Link>
      </div>
    </div>
  )
}
