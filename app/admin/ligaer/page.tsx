import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { getAllLeaguesAdmin } from '@/lib/db/queries'

export const metadata = { title: 'Ligaer — Admin' }

export default async function AdminLigaerPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  await requireAdmin()
  const { q, page } = await searchParams
  const pageNum = Math.max(1, parseInt(page ?? '1') || 1)
  const PAGE_SIZE = 20

  const all = await getAllLeaguesAdmin(q)
  const total = all.length
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const leagues = all.slice((pageNum - 1) * PAGE_SIZE, pageNum * PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Ligaer</h1>
        <span className="text-sm text-zinc-400">{total} totalt</span>
      </div>

      {/* Search */}
      <form method="GET" action="/admin/ligaer">
        <div className="flex gap-2">
          <input
            name="q"
            defaultValue={q ?? ''}
            placeholder="Søk på navn eller invitasjonskode…"
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
              href="/admin/ligaer"
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
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Kode</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Opprettet av</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-400">Medl.</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Opprettet</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {leagues.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-zinc-400">
                  Ingen ligaer funnet
                </td>
              </tr>
            )}
            {leagues.map((l) => (
              <tr key={l.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white">{l.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-500">{l.inviteCode}</td>
                <td className="px-4 py-3 text-zinc-500">{l.creatorName ?? '—'}</td>
                <td className="px-4 py-3 text-center text-zinc-900 dark:text-white">{Number(l.memberCount)}</td>
                <td className="px-4 py-3 text-zinc-400">
                  {l.createdAt?.toLocaleDateString('nb-NO') ?? '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/ligaer/${l.id}`}
                    className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  >
                    Se detaljer →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-400">Side {pageNum} av {totalPages}</span>
          <div className="flex gap-2">
            {pageNum > 1 && (
              <Link
                href={`/admin/ligaer?${q ? `q=${q}&` : ''}page=${pageNum - 1}`}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Forrige
              </Link>
            )}
            {pageNum < totalPages && (
              <Link
                href={`/admin/ligaer?${q ? `q=${q}&` : ''}page=${pageNum + 1}`}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Neste
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
