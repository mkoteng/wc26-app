import Link from 'next/link'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { requireAdmin } from '@/lib/admin'
import {
  getUserAdmin,
  getUserLeaguesAdmin,
  getUserPredictionsAdmin,
} from '@/lib/db/queries'
import { getFixtures } from '@/lib/wc26'

const fixtureMap = new Map(
  getFixtures().map((f) => {
    const home = f.home?.name ?? f.homePlaceholder ?? 'TBD'
    const away = f.away?.name ?? f.awayPlaceholder ?? 'TBD'
    return [f.id, `${home} – ${away}`]
  })
)

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getUserAdmin(id)
  return { title: user ? `${user.name} — Admin` : 'Bruker — Admin' }
}

export default async function AdminBrukerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params

  const [user, leagues, predictions] = await Promise.all([
    getUserAdmin(id),
    getUserLeaguesAdmin(id),
    getUserPredictionsAdmin(id),
  ])

  if (!user) notFound()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link href="/admin/brukere" className="mb-2 inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
          ← Brukere
        </Link>
        <div className="flex items-center gap-4">
          {user.image && (
            <Image
              src={user.image}
              alt={user.name}
              width={48}
              height={48}
              className="rounded-full"
            />
          )}
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">{user.name}</h1>
            <p className="text-sm text-zinc-500">{user.email}</p>
            {user.createdAt && (
              <p className="text-xs text-zinc-400">
                Registrert {user.createdAt.toLocaleDateString('nb-NO')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Leagues */}
      <section>
        <h2 className="mb-3 text-base font-bold text-zinc-900 dark:text-white">
          Ligaer ({leagues.length})
        </h2>
        {leagues.length === 0 ? (
          <p className="text-sm text-zinc-400">Ikke med i noen ligaer</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/60">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Liga</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Kode</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Ble med</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {leagues.map(({ league, joinedAt }) => (
                  <tr key={league.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                    <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white">{league.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-500">{league.inviteCode}</td>
                    <td className="px-4 py-3 text-zinc-400">
                      {joinedAt?.toLocaleDateString('nb-NO') ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/ligaer/${league.id}`}
                        className="text-xs font-medium text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                      >
                        Se liga →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Predictions */}
      <section>
        <h2 className="mb-3 text-base font-bold text-zinc-900 dark:text-white">
          Kamptips ({predictions.length})
        </h2>
        {predictions.length === 0 ? (
          <p className="text-sm text-zinc-400">Ingen kamptips registrert</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/60">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Liga</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Kamp</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-400">Tips</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Oppdatert</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {predictions.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/ligaer/${p.leagueId}`}
                        className="text-zinc-900 hover:underline dark:text-white"
                      >
                        {p.leagueName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {fixtureMap.get(p.matchId) ?? p.matchId}
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-zinc-900 dark:text-white">
                      {p.homeGoals}–{p.awayGoals}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {p.updatedAt?.toLocaleDateString('nb-NO') ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
