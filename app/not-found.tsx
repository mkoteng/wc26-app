import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-6xl font-extrabold tabular-nums text-zinc-200 dark:text-zinc-800">
        404
      </p>
      <h2 className="mt-4 text-lg font-bold text-zinc-900 dark:text-white">
        Page not found
      </h2>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        We couldn&apos;t find what you were looking for.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400"
      >
        Go home
      </Link>
    </div>
  )
}
