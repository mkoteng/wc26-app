'use client'

import { useState } from 'react'

interface VenueImageProps {
  src: string
  alt: string
  venueName: string
  className?: string
}

export function VenueImage({ src, alt, venueName, className = '' }: VenueImageProps) {
  const [errored, setErrored] = useState(false)

  if (!src || errored) {
    return (
      <div
        className={`flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 ${className}`}
      >
        <div className="px-4 text-center">
          {/* Stadium silhouette */}
          <svg
            aria-hidden
            className="mx-auto mb-2 h-10 w-10 text-zinc-300 dark:text-zinc-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.25}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.75V19a1 1 0 001 1h16a1 1 0 001-1V9.75" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M1 9.75C1 9.75 5 7 12 7s11 2.75 11 2.75" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 20v-6h8v6" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 14h4" />
          </svg>
          <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 line-clamp-2">
            {venueName}
          </p>
        </div>
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={`object-cover ${className}`}
      onError={() => setErrored(true)}
    />
  )
}
