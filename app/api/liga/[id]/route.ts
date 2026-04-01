import { NextResponse } from 'next/server'
import { requireSessionUserId } from '@/lib/auth-helpers'
import {
  getLeagueById,
  getLeagueMembers,
  isLeagueMember,
  getPredictionsByLeague,
  getTournamentWinnerPredictions,
} from '@/lib/db/queries'
import { calculateStandings } from '@/lib/scoring'
import type { LeagueMember } from '@/types/predictions'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let userId: string
  try {
    userId = await requireSessionUserId()
  } catch {
    return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 })
  }

  const { id } = await params
  const league = await getLeagueById(id)
  if (!league) {
    return NextResponse.json({ error: 'Liga ikke funnet' }, { status: 404 })
  }

  const isMember = await isLeagueMember(id, userId)
  if (!isMember) {
    return NextResponse.json({ error: 'Ikke medlem av denne ligaen' }, { status: 403 })
  }

  const [membersRaw, allPredictions, winnerPredictions] = await Promise.all([
    getLeagueMembers(id),
    getPredictionsByLeague(id),
    getTournamentWinnerPredictions(id),
  ])

  const members: LeagueMember[] = membersRaw.map((m) => ({
    userId: m.userId,
    name: m.name,
    image: m.image,
    joinedAt: m.joinedAt,
  }))

  const results = new Map<string, { homeGoals: number; awayGoals: number }>()
  const actualWinner: string | null = null

  const standings = calculateStandings(
    members,
    allPredictions,
    results,
    winnerPredictions,
    actualWinner
  )

  return NextResponse.json({
    league,
    members,
    standings,
    currentUserId: userId,
  })
}
