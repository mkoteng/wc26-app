import { NextResponse } from 'next/server'
import { requireSessionUserId } from '@/lib/auth-helpers'
import { createLeague } from '@/lib/db/queries'

export async function POST(request: Request) {
  let userId: string
  try {
    userId = await requireSessionUserId()
  } catch {
    return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 })
  }

  const body = await request.json() as { name?: string }
  const name = body.name?.trim()
  if (!name || name.length > 50) {
    return NextResponse.json(
      { error: 'Ugyldig liganavn (maks 50 tegn)' },
      { status: 400 }
    )
  }

  const { id, inviteCode } = await createLeague(name, userId)
  return NextResponse.json({ leagueId: id, inviteCode })
}
