import { NextResponse } from 'next/server'
import { getTeams, getTeamById, getTeamProfile } from '@/lib/wc26'

// Team data is static — revalidate once per minute to pick up any wc26-mcp updates
export const revalidate = 60

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const group = searchParams.get('group') ?? undefined
  const confederation = searchParams.get('confederation') ?? undefined

  if (id) {
    const team = getTeamById(id)
    if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    const profile = getTeamProfile(id)
    return NextResponse.json(
      { team, profile },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
    )
  }

  const teams = getTeams({ group, confederation })
  return NextResponse.json(
    { teams, count: teams.length },
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
  )
}
