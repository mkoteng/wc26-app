import type { Metadata } from 'next'
import { getVenues, getFixtures } from '@/lib/wc26'
import { getLocale } from '@/lib/locale'
import { dict } from '@/lib/i18n'
import { VENUE_IMAGE_PATH, COUNTRY_FLAG } from '@/lib/venue-data'
import { VenueCard } from '@/components/features/venues/VenueCard'
import type { VenueWithMatches } from '@/types/index'
import type { Dict } from '@/lib/i18n'

export const metadata: Metadata = {
  title: 'Venues',
  description: 'All 16 FIFA World Cup 2026 stadiums across USA, Canada, and Mexico.',
}

function StatPill({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-3 dark:border-zinc-800 dark:bg-zinc-900">
      <span className="text-xl font-extrabold tabular-nums text-zinc-900 dark:text-white">
        {value}
      </span>
      <span className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{label}</span>
    </div>
  )
}

function CountrySection({
  country,
  venues,
  imageUrls,
}: {
  country: string
  venues: VenueWithMatches[]
  imageUrls: Record<string, string>
}) {
  const flag = COUNTRY_FLAG[country] ?? ''
  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xl leading-none">{flag}</span>
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          {country}
        </h2>
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          {venues.length}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {venues.map((venue) => (
          <VenueCard
            key={venue.id}
            venue={venue}
            imageUrl={imageUrls[venue.id] ?? ''}
          />
        ))}
      </div>
    </section>
  )
}

export default async function VenuesPage() {
  const locale = await getLocale()
  const t = dict[locale].venues

  const rawVenues = getVenues()

  const venues: VenueWithMatches[] = rawVenues.map((venue) => {
    const matches = getFixtures({ venue: venue.id })
    return { ...venue, matchCount: matches.length, matches }
  })

  const imageUrls = Object.fromEntries(
    venues.map((v) => [v.id, VENUE_IMAGE_PATH[v.id] ?? ''])
  )

  const sortedVenues = [...venues].sort((a, b) => {
    if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount
    return b.capacity - a.capacity
  })

  const countryOrder = ['USA', 'Canada', 'Mexico']
  const byCountry = countryOrder
    .map((c) => ({ country: c, venues: sortedVenues.filter((v) => v.country === c) }))
    .filter((g) => g.venues.length > 0)

  const totalMatches = venues.reduce((s, v) => s + v.matchCount, 0)
  const maxCapacity = Math.max(...venues.map((v) => v.capacity)).toLocaleString('en-US')

  return (
    <div className="animate-fade-up mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          {t.title}
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {t.subtitle}
        </p>
      </div>

      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatPill value={venues.length} label={t.stadiums} />
        <StatPill value={totalMatches} label={t.totalMatches} />
        <StatPill value={maxCapacity} label={t.largestCapacity} />
        <StatPill value="3" label={t.countries} />
      </div>

      <div className="space-y-12">
        {byCountry.map(({ country, venues: countryVenues }) => (
          <CountrySection
            key={country}
            country={country}
            venues={countryVenues}
            imageUrls={imageUrls}
          />
        ))}
      </div>
    </div>
  )
}
