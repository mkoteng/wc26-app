import { NextResponse } from 'next/server'
import { requireSessionUserId } from '@/lib/auth-helpers'
import {
  isLeagueMember,
  upsertTournamentWinnerPrediction,
  getTournamentWinnerPredictions,
} from '@/lib/db/queries'
import { isTournamentWinnerDeadlinePassed } from '@/lib/deadlines'

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
  const isMember = await isLeagueMember(id, userId)
  if (!isMember) {
    return NextResponse.json({ error: 'Ikke medlem' }, { status: 403 })
  }

  const all = await getTournamentWinnerPredictions(id)
  const deadlinePassed = isTournamentWinnerDeadlinePassed()

  // Before deadline: only show the current user's own pick
  // After deadline: show everyone's picks
  if (deadlinePassed) {
    return NextResponse.json({ predictions: all, deadlinePassed: true })
  }

  const own = all.find((p) => p.userId === userId) ?? null
  return NextResponse.json({
    predictions: own ? [own] : [],
    deadlinePassed: false,
  })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let userId: string
  try {
    userId = await requireSessionUserId()
  } catch {
    return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 })
  }

  const { id } = await params
  const isMember = await isLeagueMember(id, userId)
  if (!isMember) {
    return NextResponse.json({ error: 'Ikke medlem' }, { status: 403 })
  }

  if (isTournamentWinnerDeadlinePassed()) {
    return NextResponse.json(
      { error: 'Fristen for å tippe VM-vinner er passert' },
      { status: 403 }
    )
  }

  const body = await request.json() as { teamId?: string }
  if (!body.teamId) {
    return NextResponse.json({ error: 'Mangler teamId' }, { status: 400 })
  }

  await upsertTournamentWinnerPrediction(userId, id, body.teamId)
  return NextResponse.json({ teamId: body.teamId })
}
