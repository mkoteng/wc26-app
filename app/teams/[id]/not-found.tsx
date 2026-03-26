import Link from 'next/link'

export default function TeamNotFound() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
      <span className="text-4xl">🏳</span>
      <h2 className="mt-4 text-lg font-bold text-zinc-900 dark:text-white">
        Team not found
      </h2>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        This team doesn&apos;t exist or hasn&apos;t qualified yet.
      </p>
      <Link
        href="/teams"
        className="mt-6 rounded-lg bg-pitch px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90 dark:text-zinc-950"
      >
        All teams
      </Link>
    </div>
  )
}
