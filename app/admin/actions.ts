'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { requireAdmin } from '@/lib/admin'
import {
  removeUserFromLeague,
  updatePredictionById,
  upsertTournamentWinnerPrediction,
  insertAdminOverride,
  getLeaguePredictionsAdmin,
  getLeagueWinnerPredictionsAdmin,
} from '@/lib/db/queries'

async function getAdminEmail(): Promise<string> {
  const session = await auth()
  return session?.user?.email ?? 'unknown'
}

export async function removeFromLeague(
  leagueId: string,
  userId: string,
  userName: string
): Promise<{ success: boolean; message: string }> {
  await requireAdmin()
  const adminEmail = await getAdminEmail()

  try {
    await removeUserFromLeague(leagueId, userId)
    await insertAdminOverride({
      adminEmail,
      action: 'remove_from_league',
      targetId: userId,
      details: { leagueId, userId, userName },
    })
    revalidatePath(`/admin/ligaer/${leagueId}`)
    return { success: true, message: `${userName} ble fjernet fra ligaen` }
  } catch {
    return { success: false, message: 'Noe gikk galt' }
  }
}

export async function overridePrediction(
  predictionId: string,
  leagueId: string,
  homeGoals: number,
  awayGoals: number,
  reason?: string
): Promise<{ success: boolean }> {
  await requireAdmin()
  const adminEmail = await getAdminEmail()

  // Fetch current values for the audit log
  const all = await getLeaguePredictionsAdmin(leagueId)
  const current = all.find((p) => p.id === predictionId)

  await updatePredictionById(predictionId, homeGoals, awayGoals)
  await insertAdminOverride({
    adminEmail,
    action: 'override_prediction',
    targetId: predictionId,
    details: {
      before: current
        ? { homeGoals: current.homeGoals, awayGoals: current.awayGoals }
        : null,
      after: { homeGoals, awayGoals },
    },
    reason,
  })
  revalidatePath(`/admin/ligaer/${leagueId}`)
  return { success: true }
}

export async function overrideTournamentWinner(
  userId: string,
  leagueId: string,
  teamId: string,
  reason?: string
): Promise<{ success: boolean }> {
  await requireAdmin()
  const adminEmail = await getAdminEmail()

  const winnerPreds = await getLeagueWinnerPredictionsAdmin(leagueId)
  const current = winnerPreds.find((p) => p.userId === userId)

  await upsertTournamentWinnerPrediction(userId, leagueId, teamId)
  await insertAdminOverride({
    adminEmail,
    action: 'override_winner',
    targetId: userId,
    details: {
      leagueId,
      before: current?.teamId ?? null,
      after: teamId,
    },
    reason,
  })
  revalidatePath(`/admin/ligaer/${leagueId}`)
  return { success: true }
}
