import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/admin'
import {
  getLeagueById,
  getLeagueMembersAdmin,
  getLeaguePredictionsAdmin,
  getLeagueWinnerPredictionsAdmin,
} from '@/lib/db/queries'
import { getFixtures, getTeamById } from '@/lib/wc26'
import { RemoveMemberDialog } from '@/components/features/admin/RemoveMemberDialog'
import { OverridePredictionDialog } from '@/components/features/admin/OverridePredictionDialog'
import { OverrideWinnerDialog } from '@/components/features/admin/OverrideWinnerDialog'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const league = await getLeagueById(id)
  return { title: league ? `${league.name} — Admin` : 'Liga — Admin' }
}

const fixtureMap = new Map(
  getFixtures().map((f) => {
    const home = f.home?.name ?? f.homePlaceholder ?? 'TBD'
    const away = f.away?.name ?? f.awayPlaceholder ?? 'TBD'
    return [f.id, `${home} – ${away}`]
  })
)

export default async function AdminLigaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params

  const [league, members, predictions, winnerPreds] = await Promise.all([
    getLeagueById(id),
    getLeagueMembersAdmin(id),
    getLeaguePredictionsAdmin(id),
    getLeagueWinnerPredictionsAdmin(id),
  ])

  if (!league) notFound()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link href="/admin/ligaer" className="mb-2 inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
          ← Ligaer
        </Link>
        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">{league.name}</h1>
        <div className="mt-1 flex flex-wrap gap-4 text-sm text-zinc-500">
          <span>Kode: <span className="font-mono font-semibold">{league.inviteCode}</span></span>
          <span>Opprettet: {league.createdAt?.toLocaleDateString('nb-NO') ?? '—'}</span>
        </div>
      </div>

      {/* Members */}
      <section>
        <h2 className="mb-3 text-base font-bold text-zinc-900 dark:text-white">
          Spillere ({members.length})
        </h2>
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/60">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Spiller</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Epost</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">VM-vinner tips</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Ble med</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {members.map((m) => {
                const winnerPred = winnerPreds.find((w) => w.userId === m.userId)
                const winnerTeam = winnerPred ? getTeamById(winnerPred.teamId) : null
                return (
                  <tr key={m.userId} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/brukere/${m.userId}`}
                        className="font-medium text-zinc-900 hover:underline dark:text-white"
                      >
                        {m.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">{m.email}</td>
                    <td className="px-4 py-3 text-zinc-500">
                      {winnerTeam ? `${winnerTeam.flag_emoji} ${winnerTeam.name}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {m.joinedAt?.toLocaleDateString('nb-NO') ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <RemoveMemberDialog
                        leagueId={id}
                        leagueName={league.name}
                        userId={m.userId}
                        userName={m.name}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* VM-vinner predictions */}
      <section>
        <h2 className="mb-3 text-base font-bold text-zinc-900 dark:text-white">
          VM-vinner tips ({winnerPreds.length})
        </h2>
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/60">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Spiller</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Tips</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Oppdatert</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {winnerPreds.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-zinc-400">
                    Ingen VM-vinner tips ennå
                  </td>
                </tr>
              )}
              {winnerPreds.map((w) => {
                const team = getTeamById(w.teamId)
                return (
                  <tr key={w.userId} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                    <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white">{w.userName}</td>
                    <td className="px-4 py-3 text-zinc-500">
                      {team ? `${team.flag_emoji} ${team.name}` : w.teamId}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {w.updatedAt?.toLocaleDateString('nb-NO') ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <OverrideWinnerDialog
                        userId={w.userId}
                        leagueId={id}
                        userName={w.userName}
                        currentTeamId={w.teamId}
                        currentTeamName={team?.name ?? null}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Predictions */}
      <section>
        <h2 className="mb-3 text-base font-bold text-zinc-900 dark:text-white">
          Kamptips ({predictions.length})
        </h2>
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/60">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Spiller</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Kamp</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-400">Tips</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Oppdatert</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {predictions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-zinc-400">
                    Ingen kamptips ennå
                  </td>
                </tr>
              )}
              {predictions.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white">{p.userName}</td>
                  <td className="px-4 py-3 text-zinc-500">
                    {fixtureMap.get(p.matchId) ?? p.matchId}
                  </td>
                  <td className="px-4 py-3 text-center font-mono font-bold text-zinc-900 dark:text-white">
                    {p.homeGoals}–{p.awayGoals}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {p.updatedAt?.toLocaleDateString('nb-NO') ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <OverridePredictionDialog
                      predictionId={p.id}
                      leagueId={id}
                      userName={p.userName}
                      matchLabel={fixtureMap.get(p.matchId) ?? p.matchId}
                      currentHome={p.homeGoals}
                      currentAway={p.awayGoals}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
