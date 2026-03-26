/**
 * Downloads Wikipedia header images for all 16 WC26 venues.
 * Saves to public/venues/{id}.jpg
 *
 * Usage: node scripts/download-venue-images.mjs
 */

import { writeFileSync } from 'fs'
import { join, extname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const outDir = join(__dirname, '..', 'public', 'venues')

// Only re-fetch the ones that failed last run
const VENUES = {
  bmo: 'BMO Field',
}

/** Request a specific pixel width from a Wikipedia thumbnail URL. */
function resizeWikipediaUrl(url, width = 1280) {
  // Only resize if it's a Commons thumb URL
  if (url.includes('/thumb/')) {
    return url.replace(/\/\d+px-/, `/${width}px-`)
  }
  return url
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const results = {}
let ok = 0
let failed = 0

for (const [id, title] of Object.entries(VENUES)) {
  await sleep(3000) // stay well under Wikipedia rate limit
  process.stdout.write(`  ${id.padEnd(14)} `)

  try {
    const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
    const summaryRes = await fetch(apiUrl, {
      headers: { 'User-Agent': 'wc26-app/1.0 (venue image downloader)' },
    })
    if (!summaryRes.ok) throw new Error(`Wikipedia API ${summaryRes.status}`)

    const summary = await summaryRes.json()
    const rawUrl = summary.thumbnail?.source ?? summary.originalimage?.source
    if (!rawUrl) throw new Error('No image in Wikipedia response')

    const imageUrl = summary.thumbnail?.source
      ? resizeWikipediaUrl(rawUrl, 1280)
      : rawUrl

    const imgRes = await fetch(imageUrl, {
      headers: { 'User-Agent': 'wc26-app/1.0 (venue image downloader)' },
    })
    if (!imgRes.ok) throw new Error(`Image download ${imgRes.status}`)

    const buffer = Buffer.from(await imgRes.arrayBuffer())

    // Determine extension from the URL path
    const urlPath = new URL(imageUrl).pathname
    const ext = extname(urlPath.replace(/\?.*/, '')).toLowerCase() || '.jpg'
    const filename = `${id}${ext}`

    writeFileSync(join(outDir, filename), buffer)
    results[id] = `/venues/${filename}`
    console.log(`✓  ${filename}  (${Math.round(buffer.length / 1024)} KB)`)
    ok++
  } catch (err) {
    console.log(`✗  ${err.message}`)
    failed++
  }
}

console.log(`\n${ok} downloaded, ${failed} failed`)
console.log('\nAdd to lib/venue-data.ts:\n')
console.log('export const VENUE_IMAGE_PATH: Record<string, string> = {')
for (const [id, path] of Object.entries(results)) {
  console.log(`  ${id.padEnd(14)}: '${path}',`)
}
console.log('}')
