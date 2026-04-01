import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { getAdminOverrides } from '@/lib/db/queries'

export const metadata = { title: 'Endringslogg — Admin' }

const ACTION_LABELS: Record<string, string> = {
  override_prediction: 'Overstyrte tips',
  remove_from_league: 'Fjernet fra liga',
  override_winner: 'Overstyrte VM-vinner',
}

const ACTION_FILTER_OPTIONS = [
  { value: '', label: 'Alle handlinger' },
  { value: 'override_prediction', label: 'Overstyrt tips' },
  { value: 'remove_from_league', label: 'Fjernet fra liga' },
  { value: 'override_winner', label: 'Overstyrt VM-vinner' },
]

export default async function AdminLoggPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string }>
}) {
  await requireAdmin()
  const { action } = await searchParams
  const entries = await getAdminOverrides(action || undefined)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Endringslogg</h1>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {ACTION_FILTER_OPTIONS.map((opt) => (
          <Link
            key={opt.value}
            href={opt.value ? `/admin/logg?action=${opt.value}` : '/admin/logg'}
            className={[
              'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
              (action ?? '') === opt.value
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                : 'border border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800',
            ].join(' ')}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/60">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Tidspunkt</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Handling</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Mål-ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Detaljer</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Årsak</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {entries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-zinc-400">
                  Ingen logginnslag funnet
                </td>
              </tr>
            )}
            {entries.map((e) => (
              <tr key={e.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-400">
                  {e.createdAt?.toLocaleString('nb-NO', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }) ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {ACTION_LABELS[e.action] ?? e.action}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-500">{e.targetId}</td>
                <td className="px-4 py-3 text-xs text-zinc-500">
                  {e.details ? (
                    <pre className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap font-mono">
                      {JSON.stringify(e.details)}
                    </pre>
                  ) : '—'}
                </td>
                <td className="px-4 py-3 text-xs text-zinc-500">{e.reason ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
