const KEY = 'wc26:favourites'

export function getFavourites(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as string[]
  } catch {
    return []
  }
}

export function toggleFavourite(teamId: string): void {
  const current = getFavourites()
  const next = current.includes(teamId)
    ? current.filter((id) => id !== teamId)
    : [...current, teamId]
  localStorage.setItem(KEY, JSON.stringify(next))
}

export function isFavourite(teamId: string): boolean {
  return getFavourites().includes(teamId)
}
