import { NextResponse } from 'next/server'
import { getVenues, getFixtures } from '@/lib/wc26'
import type { VenueWithMatches } from '@/types/index'

export const revalidate = 60

export async function GET() {
  try {
    const venueList = getVenues()

    const venues: VenueWithMatches[] = venueList.map((venue) => {
      const matches = getFixtures({ venue: venue.id })
      return { ...venue, matchCount: matches.length, matches }
    })

    return NextResponse.json(
      { venues, count: venues.length },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
