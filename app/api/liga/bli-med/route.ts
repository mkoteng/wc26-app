import { NextResponse } from 'next/server'
import { requireSessionUserId } from '@/lib/auth-helpers'
import { getLeagueByInviteCode, joinLeague } from '@/lib/db/queries'

export async function POST(request: Request) {
  let userId: string
  try {
    userId = await requireSessionUserId()
  } catch {
    return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 })
  }

  const body = await request.json() as { inviteCode?: string }
  const code = body.inviteCode?.trim().toUpperCase()
  if (!code) {
    return NextResponse.json({ error: 'Mangler invitasjonskode' }, { status: 400 })
  }

  const league = await getLeagueByInviteCode(code)
  if (!league) {
    return NextResponse.json(
      { error: 'Fant ingen liga med den koden' },
      { status: 404 }
    )
  }

  await joinLeague(league.id, userId)
  return NextResponse.json({ leagueId: league.id })
}
