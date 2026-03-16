import Link from 'next/link'
import { VenueImage } from '@/components/features/venues/VenueImage'
import { COUNTRY_FLAG, VENUE_DETAILS } from '@/lib/venue-data'
import type { VenueWithMatches } from '@/types/index'

interface VenueCardProps {
  venue: VenueWithMatches
  imageUrl: string
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
      {children}
    </span>
  )
}

export function VenueCard({ venue, imageUrl }: VenueCardProps) {
  const flag = COUNTRY_FLAG[venue.country] ?? ''
  const details = VENUE_DETAILS[venue.id]
  const capacity = venue.capacity.toLocaleString('en-US')

  return (
    <Link
      href={`/venues/${venue.id}`}
      className="group block overflow-hidden rounded-xl border border-zinc-200 bg-white transition-all duration-200 hover:scale-[1.015] hover:border-zinc-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
    >
      {/* Stadium photo */}
      <div className="relative aspect-video overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <VenueImage
          src={imageUrl}
          alt={`${venue.name} stadium`}
          venueName={venue.name}
          className="h-full w-full transition-transform duration-300 group-hover:scale-[1.03]"
        />

        {/* Match count pill — top right */}
        <span className="absolute right-2.5 top-2.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          {venue.matchCount} {venue.matchCount === 1 ? 'match' : 'matches'}
        </span>
      </div>

      {/* Card body */}
      <div className="p-4">
        <h3 className="truncate text-base font-bold leading-tight text-zinc-900 dark:text-white">
          {venue.name}
        </h3>

        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
          <span>{venue.city}{venue.state_province ? `, ${venue.state_province}` : ''}</span>
          <span aria-hidden>·</span>
          <span>{flag} {venue.country}</span>
        </p>

        {/* Capacity */}
        <p className="mt-2 flex items-baseline gap-1 text-sm">
          <span className="font-bold tabular-nums text-zinc-900 dark:text-white">{capacity}</span>
          <span className="text-xs text-zinc-400 dark:text-zinc-500">capacity</span>
        </p>

        {/* Badges */}
        {details && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <Badge>{details.surface}</Badge>
            <Badge>{details.roof} roof</Badge>
          </div>
        )}

        {/* Notable */}
        {venue.notable.length > 0 && (
          <p className="mt-2.5 line-clamp-1 text-xs text-emerald-600 dark:text-emerald-500">
            {venue.notable[0]}
          </p>
        )}
      </div>
    </Link>
  )
}
