/**
 * Fetches the main image for a Wikipedia article via the REST summary API.
 * Cached for 24 hours — images rarely change.
 */

interface WikiSummary {
  originalimage?: { source: string; width: number; height: number }
  thumbnail?: { source: string; width: number; height: number }
}

export async function getWikipediaImage(title: string): Promise<string | null> {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
    const res = await fetch(url, { next: { revalidate: 86400 } })
    if (!res.ok) return null
    const data = (await res.json()) as WikiSummary
    return data.originalimage?.source ?? data.thumbnail?.source ?? null
  } catch {
    return null
  }
}
