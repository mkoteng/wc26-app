'use client'

import { useState } from 'react'
import Image from 'next/image'

// Tiny 1×1 gray GIF — prevents layout shift while image loads
const BLUR_DATA_URL =
  'data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=='

interface VenueImageProps {
  src: string
  alt: string
  venueName: string
  className?: string
}

function Fallback({ venueName }: { venueName: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
      <div className="px-4 text-center">
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
        <p className="line-clamp-2 text-xs font-medium text-zinc-400 dark:text-zinc-500">
          {venueName}
        </p>
      </div>
    </div>
  )
}

export function VenueImage({ src, alt, venueName, className = '' }: VenueImageProps) {
  const [errored, setErrored] = useState(false)

  if (!src || errored) {
    return <Fallback venueName={venueName} />
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={`object-cover ${className}`}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      placeholder="blur"
      blurDataURL={BLUR_DATA_URL}
      onError={() => setErrored(true)}
    />
  )
}
