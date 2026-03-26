import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getVenues, getVenueById, getFixtures, getHistoricalMatchup } from '@/lib/wc26'
import { getLocale } from '@/lib/locale'
import { dict } from '@/lib/i18n'
import { VENUE_IMAGE_PATH, VENUE_DETAILS, COUNTRY_FLAG } from '@/lib/venue-data'
import { VenueImage } from '@/components/features/venues/VenueImage'
import { MatchDetailSheet } from '@/components/features/fixtures/MatchDetailSheet'
import type { Dict } from '@/lib/i18n'

// ── Static params ─────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return getVenues().map((v) => ({ id: v.id }))
}

// ── Metadata ─────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const venue = getVenueById(id)
  if (!venue) return { title: 'Venue not found' }
  return {
    title: venue.name,
    description: `${venue.name} in ${venue.city}, ${venue.country} — FIFA World Cup 2026 venue with ${venue.capacity.toLocaleString('en-US')} capacity.`,
  }
}

// ── Info cell ─────────────────────────────────────────────────────────────────

function InfoCell({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/60">
      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        {label}
      </span>
      <span
        className={[
          'text-sm font-semibold leading-snug',
          accent
            ? 'text-pitch'
            : 'text-zinc-900 dark:text-white',
        ].join(' ')}
      >
        {value}
      </span>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function VenuePage({ params }: PageProps) {
  const { id } = await params
  const venue = getVenueById(id)
  if (!venue) notFound()

  const locale = await getLocale()
  const t = dict[locale].venues

  const fixtures = getFixtures({ venue: id }).sort((a, b) =>
    a.utcDateTime.localeCompare(b.utcDateTime)
  )

  const imageUrl = VENUE_IMAGE_PATH[id] ?? ''
  const details = VENUE_DETAILS[id]
  const flag = COUNTRY_FLAG[venue.country] ?? ''
  const capacity = venue.capacity.toLocaleString('en-US')

  const juneMid = Math.round((venue.weather.june_avg_high_f + venue.weather.june_avg_low_f) / 2)
  const julyMid = Math.round((venue.weather.july_avg_high_f + venue.weather.july_avg_low_f) / 2)
  const weatherSummary = `Jun ${t.tempFormat(juneMid)} · Jul ${t.tempFormat(julyMid)}`

  const coordStr = `${venue.coordinates.lat.toFixed(4)}, ${venue.coordinates.lng.toFixed(4)}`

  return (
    <div className="animate-fade-up mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Back link */}
      <div className="mb-5">
        <Link
          href="/venues"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {t.allVenues}
        </Link>
      </div>

      {/* Hero image */}
      <div className="relative mb-6 overflow-hidden rounded-2xl">
        <div className="relative aspect-[16/7] w-full">
          <VenueImage
            src={imageUrl}
            alt={`${venue.name} stadium`}
            venueName={venue.name}
            className="h-full w-full"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
          <p className="mb-1 text-sm font-semibold text-white/80">
            {flag} {venue.city}
            {venue.state_province ? `, ${venue.state_province}` : ''} · {venue.country}
          </p>
          <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl">
            {venue.name}
          </h1>
          <p className="mt-1 text-sm text-white/70">
            <span className="font-bold text-white">{capacity}</span> {t.capacityUnit} · {t.matchesCount(fixtures.length)}
          </p>
        </div>
      </div>

      {/* Info grid */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {details && (
          <>
            <InfoCell label={t.surface} value={t.surfaceLabels[details.surface] ?? details.surface} />
            <InfoCell label={t.roof} value={t.roofLabels[details.roof] ?? details.roof} />
          </>
        )}
        <InfoCell label={t.capacity} value={capacity} accent />
        <InfoCell label={t.timezone} value={venue.timezone.replace('America/', '').replace(/_/g, ' ')} />
        <InfoCell label={t.coordinates} value={coordStr} />
        <InfoCell label={t.avgTemp} value={weatherSummary} />
      </div>

      {/* Weather description */}
      <div className="mb-8 rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          {t.weather}
        </p>
        <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          {t.weatherDescriptions[venue.weather.description] ?? venue.weather.description}
        </p>
      </div>

      {/* Notable facts */}
      {venue.notable.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {t.notable}
          </h2>
          <ul className="space-y-2">
            {venue.notable.map((fact, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-700 dark:text-zinc-300">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-pitch" />
                {t.notableFacts[fact] ?? fact}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Match list */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
            {t.matchesAt(venue.name)}
          </h2>
          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            {fixtures.length}
          </span>
        </div>

        {fixtures.length === 0 ? (
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            {t.noMatches}
          </p>
        ) : (
          <div className="stagger-children space-y-2.5">
            {fixtures.map((f) => (
              <MatchDetailSheet
                key={f.id}
                fixture={f}
                matchup={
                  f.home && f.away
                    ? getHistoricalMatchup(f.home.id, f.away.id)
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
