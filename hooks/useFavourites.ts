'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  getFavourites,
  toggleFavourite as toggleUtil,
} from '@/lib/favourites'

const STORAGE_KEY = 'wc26:favourites'

export function useFavourites() {
  // Safe SSR init — empty until hydration
  const [favourites, setFavourites] = useState<string[]>([])

  useEffect(() => {
    setFavourites(getFavourites())
  }, [])

  // Sync across browser tabs
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setFavourites(getFavourites())
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const toggleFavourite = useCallback((teamId: string) => {
    toggleUtil(teamId)
    setFavourites(getFavourites())
  }, [])

  const isFavourite = useCallback(
    (teamId: string) => favourites.includes(teamId),
    [favourites]
  )

  return { favourites, toggleFavourite, isFavourite }
}
