import Link from 'next/link'

export default function VenueNotFound() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
      <span className="text-4xl">🏟️</span>
      <h2 className="mt-4 text-lg font-bold text-zinc-900 dark:text-white">
        Venue not found
      </h2>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        This stadium isn&apos;t part of WC26.
      </p>
      <Link
        href="/venues"
        className="mt-6 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400"
      >
        All venues
      </Link>
    </div>
  )
}
