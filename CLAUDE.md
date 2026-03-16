# WC26 App — Claude instructions

## Project overview
A FIFA World Cup 2026 web app with match schedule, live scores, group standings,
and team profiles. Built with Next.js 16.1, deployed on Vercel.

---

## Stack

- **Framework**: Next.js 16.1 with App Router and TypeScript (strict mode)
- **Bundler**: Turbopack (default in v16 — do not add --turbopack flags)
- **Styling**: Tailwind CSS v4, light + dark mode (class-based, toggled via `ThemeProvider`)
- **Components**: shadcn/ui
- **WC26 static data**: wc26-mcp (npm package, zero API keys needed)
- **Live scores**: football-data.org REST API (env: FOOTBALL_DATA_API_KEY)
- **Cache**: Upstash Redis (@upstash/redis) for rate-limit buffering
- **React version**: 19.2 (ships with Next.js 16.1)

---

## Next.js 16 specifics — important

- `middleware.ts` no longer exists. Use `proxy.ts` with an exported `proxy` function
  for any network boundary logic.
- Route params (`params`, `searchParams`) are now async — always `await` them:
  ```ts
  export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
  }
  ```
- `cacheLife` and `cacheTag` are stable — do NOT use the `unstable_` prefix.
- Turbopack is the default for both `next dev` and `next build`. Do not add
  `--turbopack` or `--webpack` flags unless explicitly asked.
- React Compiler is available but NOT enabled by default. Do not enable it unless asked.

---

## Project structure

```
/app
  layout.tsx                  ← root layout, ThemeProvider, global nav
  page.tsx                    ← homepage: today's matches + live scores
  /fixtures
    page.tsx                  ← full schedule, filterable by group/date
  /groups
    page.tsx                  ← group stage standings
  /teams
    /[id]
      page.tsx                ← team profile
/app/api
  /scores
    route.ts                  ← live scores from football-data.org + KV cache
  /fixtures
    route.ts                  ← fixture data via wc26-mcp
  /teams
    route.ts                  ← team data via wc26-mcp
/components
  /ui                         ← shadcn/ui primitives (do not edit)
  /shared                     ← reusable app components (nav, footer, etc.)
  /features                   ← page-specific components, colocated by feature
/lib
  wc26.ts                     ← wc26-mcp wrapper/helpers
  football-data.ts            ← football-data.org API client
  cache.ts                    ← Upstash Redis helpers
/types
  index.ts                    ← shared TypeScript types
```

---

## Code conventions

- **Server components by default.** Add `"use client"` only when the component
  needs browser APIs, event handlers, or React hooks.
- **Async/await** over `.then()` — always.
- **Always handle loading and error states.** Use shadcn `Skeleton` for loading,
  and a visible error message (not just a console.error) for errors.
- **All external API calls must be cached.** Minimum 60 seconds via Upstash Redis or
  Next.js `cacheLife`. Never call football-data.org directly from a client component.
- **No barrel files** (`index.ts` re-exports) — import directly from the source file.
- **Co-locate page-specific components** with their page in `/features`, not in `/shared`.
- **Type everything.** No `any`. Use the types in `/types/index.ts`.

---

## API route pattern

All `/app/api/` routes follow this pattern:

```ts
import { NextResponse } from 'next/server'
import { withCache } from '@/lib/cache'

const CACHE_TTL = 60 // seconds

export async function GET() {
  const data = await withCache('scores:live', fetchFromExternalAPI, CACHE_TTL)
  return NextResponse.json(data)
}
```

---

## Design rules

### Theme switching
- Use `next-themes` (`ThemeProvider`) for light/dark toggling. Wrap the root
  layout in `<ThemeProvider attribute="class" defaultTheme="dark" enableSystem>`.
- Add a `<ThemeToggle />` button in the global nav (use shadcn's `Button` + a
  sun/moon icon from `lucide-react`).
- Every color must work in both modes. Always pair a base class with a `dark:` variant:
  ```tsx
  // correct
  <div className="bg-white dark:bg-zinc-950">
  // wrong — only works in one mode
  <div className="bg-zinc-950">
  ```

### Dark mode palette
- **Base**: `bg-zinc-950`, cards `bg-zinc-900`, borders `border-zinc-800`
- **Text**: `text-white` headings, `text-zinc-400` secondary, `text-zinc-500` muted

### Light mode palette
- **Base**: `bg-white`, cards `bg-zinc-50`, borders `border-zinc-200`
- **Text**: `text-zinc-900` headings, `text-zinc-500` secondary, `text-zinc-400` muted

### Shared
- **Accent**: `emerald-600` light / `emerald-500` dark — use `dark:` variant for both
- **Radius**: `rounded-xl` for cards, `rounded-lg` for buttons/inputs
- **Spacing**: generous — prefer `p-6` on cards, `gap-4` minimum in grids
- **Mobile-first** — design for 375px, then scale up with `sm:` / `md:` / `lg:`
- **Follow `/mnt/skills/public/frontend-design/SKILL.md`** for all UI work.
  Commit to a bold aesthetic direction. Avoid generic AI-slop patterns.

---

## Environment variables

```
# football-data.org
FOOTBALL_DATA_API_KEY=

# Upstash Redis — https://console.upstash.com
KV_REST_API_URL=
KV_REST_API_TOKEN=
```

Never hardcode these. Always read from `process.env`. If a key is missing,
throw a clear error: `throw new Error('Missing env: FOOTBALL_DATA_API_KEY')`.

---

## Data sources

| Data | Source | Notes |
|---|---|---|
| Match schedule | wc26-mcp | Static, ships with the package |
| Team profiles | wc26-mcp | 48 teams, static |
| Group standings (predicted) | wc26-mcp | Based on FIFA rankings + odds |
| Live scores | football-data.org | Free tier, max 10 req/min — always cache |
| Injuries / news / odds | wc26-mcp | Updated periodically by package maintainer |

Tournament dates: **11 June – 19 July 2026**

---

## football-data.org usage

- Free tier: 10 requests/minute. **Always go through the Upstash Redis cache.**
- Base URL: `https://api.football-data.org/v4`
- Auth header: `X-Auth-Token: ${process.env.FOOTBALL_DATA_API_KEY}`
- VM 2026 competition code: `WC` (verify at start of tournament)
- Poll live scores every 60 seconds max — use Redis TTL to enforce this.

---

## Do not

- Do not use `experimental` flags unless explicitly asked
- Do not hardcode dark-only colors — always include `dark:` variants
- Do not call external APIs from client components
- Do not commit `.env.local`
- Do not use `middleware.ts` — use `proxy.ts` in Next.js 16
- Do not use the `unstable_` prefix on `cacheLife`/`cacheTag`
- Do not enable the React Compiler without being asked
- Do not add `--turbopack` to npm scripts (it's the default in v16)