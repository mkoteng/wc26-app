import { NextResponse } from 'next/server'
import { getFixtures } from '@/lib/wc26'
import type { MatchRound, MatchStatus } from '@/types/index'

// Static WC26 schedule — revalidate once per minute to pick up status updates
export const revalidate = 60

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const group = searchParams.get('group') ?? undefined
  const round = searchParams.get('round') as MatchRound | undefined
  const status = searchParams.get('status') as MatchStatus | undefined
  const date = searchParams.get('date') ?? undefined
  const date_from = searchParams.get('date_from') ?? undefined
  const date_to = searchParams.get('date_to') ?? undefined

  const fixtures = getFixtures({ group, round, status, date, date_from, date_to })

  return NextResponse.json(
    { fixtures, count: fixtures.length },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    }
  )
}
