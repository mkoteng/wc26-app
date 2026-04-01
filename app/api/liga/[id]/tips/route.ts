import { NextResponse } from 'next/server'
import { requireSessionUserId } from '@/lib/auth-helpers'
import { isLeagueMember, upsertPrediction, deletePrediction, getPredictionsByUser, getPredictionsByLeague } from '@/lib/db/queries'
import { isMatchDeadlinePassed } from '@/lib/deadlines'
import { getMatchById } from '@/lib/wc26'

export async function GET(
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

  const url = new URL(request.url)
  const alle = url.searchParams.get('alle') === 'true'

  if (alle) {
    // Return all members' predictions, but only for matches whose deadline has passed
    const all = await getPredictionsByLeague(id)
    const revealed: typeof all = []
    for (const p of all) {
      const match = getMatchById(p.matchId)
      if (!match) continue
      const kickoff = new Date(`${match.date}T${match.time_utc}:00Z`)
      if (isMatchDeadlinePassed(kickoff)) revealed.push(p)
    }
    return NextResponse.json({ predictions: revealed })
  }

  // Default: return only the current user's predictions
  const predictions = await getPredictionsByUser(userId, id)
  return NextResponse.json({ predictions })
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

  const body = await request.json() as {
    matchId?: string
    homeGoals?: number
    awayGoals?: number
  }

  const { matchId, homeGoals, awayGoals } = body
  if (
    !matchId ||
    homeGoals === undefined ||
    awayGoals === undefined ||
    homeGoals < 0 ||
    homeGoals > 99 ||
    awayGoals < 0 ||
    awayGoals > 99
  ) {
    return NextResponse.json({ error: 'Ugyldig tips' }, { status: 400 })
  }

  const match = getMatchById(matchId)
  if (match) {
    const kickoff = new Date(`${match.date}T${match.time_utc}:00Z`)
    if (isMatchDeadlinePassed(kickoff)) {
      return NextResponse.json(
        { error: 'Fristen for denne kampen er passert' },
        { status: 403 }
      )
    }
  }

  await upsertPrediction({
    userId,
    leagueId: id,
    matchId,
    homeGoals: Math.floor(homeGoals),
    awayGoals: Math.floor(awayGoals),
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(
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

  const body = await request.json() as { matchId?: string }
  if (!body.matchId) {
    return NextResponse.json({ error: 'Mangler matchId' }, { status: 400 })
  }

  const match = getMatchById(body.matchId)
  if (match) {
    const kickoff = new Date(`${match.date}T${match.time_utc}:00Z`)
    if (isMatchDeadlinePassed(kickoff)) {
      return NextResponse.json(
        { error: 'Fristen for denne kampen er passert' },
        { status: 403 }
      )
    }
  }

  await deletePrediction(userId, id, body.matchId)
  return NextResponse.json({ ok: true })
}
