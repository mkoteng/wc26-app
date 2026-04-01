'use client'

import { Heart } from 'lucide-react'
import { useFavourites } from '@/hooks/useFavourites'

interface FavouriteButtonProps {
  teamId: string
  teamName: string
  size?: 'sm' | 'md'
}

export function FavouriteButton({
  teamId,
  teamName,
  size = 'md',
}: FavouriteButtonProps) {
  const { isFavourite, toggleFavourite } = useFavourites()
  const active = isFavourite(teamId)

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleFavourite(teamId)
      }}
      aria-label={
        active
          ? `Remove ${teamName} from favourites`
          : `Add ${teamName} to favourites`
      }
      aria-pressed={active}
      className={[
        'cursor-pointer rounded-full transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900',
        size === 'sm'
          ? 'flex h-7 w-7 items-center justify-center hover:bg-pitch/10 dark:hover:bg-pitch/15'
          : 'flex h-9 w-9 items-center justify-center border border-zinc-200 hover:border-pitch/40 hover:bg-pitch/5 dark:border-zinc-700 dark:hover:border-pitch/40 dark:hover:bg-pitch/10',
        active
          ? 'text-pitch'
          : 'text-zinc-400 hover:text-pitch dark:text-zinc-500 dark:hover:text-pitch',
      ].join(' ')}
    >
      <Heart
        className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'}
        fill={active ? 'currentColor' : 'none'}
        strokeWidth={2}
      />
    </button>
  )
}
