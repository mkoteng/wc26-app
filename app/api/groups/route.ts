import { NextResponse } from 'next/server'
import { getGroupStandings } from '@/lib/wc26'

// Group standings are derived from static wc26-mcp data.
// Revalidate every 60 s so live score updates (when the tournament starts)
// are reflected within a minute.
export const revalidate = 60

export async function GET() {
  const groups = getGroupStandings()
  return NextResponse.json(
    { groups, count: groups.length },
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
  )
}
