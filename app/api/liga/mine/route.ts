import { NextResponse } from 'next/server'
import { requireSessionUserId } from '@/lib/auth-helpers'
import { getLeaguesByUser, getLeagueMembers } from '@/lib/db/queries'

export async function GET() {
  let userId: string
  try {
    userId = await requireSessionUserId()
  } catch {
    return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 })
  }

  const rows = await getLeaguesByUser(userId)

  const leagues = await Promise.all(
    rows.map(async (row) => {
      const members = await getLeagueMembers(row.league.id)
      return { league: row.league, memberCount: members.length }
    })
  )

  return NextResponse.json({ leagues })
}
