import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { getAllUsersAdmin } from '@/lib/db/queries'

export const metadata = { title: 'Brukere — Admin' }

export default async function AdminBrukereePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  await requireAdmin()
  const { q } = await searchParams
  const users = await getAllUsersAdmin(q)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Brukere</h1>
        <span className="text-sm text-zinc-400">{users.length} totalt</span>
      </div>

      {/* Search */}
      <form method="GET" action="/admin/brukere">
        <div className="flex gap-2">
          <input
            name="q"
            defaultValue={q ?? ''}
            placeholder="Søk på navn eller epost…"
            className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-zinc-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:opacity-80 dark:bg-white dark:text-zinc-900"
          >
            Søk
          </button>
          {q && (
            <Link
              href="/admin/brukere"
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              Nullstill
            </Link>
          )}
        </div>
      </form>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/60">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Navn</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Epost</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-400">Ligaer</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Registrert</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-zinc-400">
                  Ingen brukere funnet
                </td>
              </tr>
            )}
            {users.map((u) => (
              <tr
                key={u.id}
                className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/brukere/${u.id}`}
                    className="font-medium text-zinc-900 hover:underline dark:text-white"
                  >
                    {u.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-500">{u.email}</td>
                <td className="px-4 py-3 text-center text-zinc-900 dark:text-white">
                  {Number(u.leagueCount)}
                </td>
                <td className="px-4 py-3 text-zinc-400">
                  {u.createdAt?.toLocaleDateString('nb-NO') ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
