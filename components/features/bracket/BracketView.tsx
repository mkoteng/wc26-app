import { getFixtures } from '@/lib/wc26'
import { dict } from '@/lib/i18n'
import type { Locale } from '@/lib/locale'
import type { MatchFixture, MatchRound } from '@/types/index'
import { BracketMatchCard } from './BracketMatchCard'

// ── Layout constants ──────────────────────────────────────────────────────────

const CW = 152   // card width
const CH = 52    // card height
const SH = 72    // slot height (per R32 row)
const GAP = 32   // gap between columns (connector space)
const COL = CW + GAP  // 184

const BRACKET_H = 8 * SH   // 576 — vertical space for 8 R32 slots
const TOTAL_W = 9 * CW + 8 * GAP  // 1624

// Column left-edge x positions
const X = {
  L_R32: 0,
  L_R16: COL,
  L_QF: COL * 2,
  L_SF: COL * 3,
  FINAL: COL * 4,
  R_SF: COL * 5,
  R_QF: COL * 6,
  R_R16: COL * 7,
  R_R32: COL * 8,
} as const

// ── Y-center computation ──────────────────────────────────────────────────────

const R32_C = Array.from({ length: 8 }, (_, i) => i * SH + SH / 2)
const R16_C = [0, 1, 2, 3].map((i) => (R32_C[i * 2] + R32_C[i * 2 + 1]) / 2)
const QF_C  = [0, 1].map((i) => (R16_C[i * 2] + R16_C[i * 2 + 1]) / 2)
const SF_C  = (QF_C[0] + QF_C[1]) / 2

const top = (center: number) => Math.round(center - CH / 2)

// ── SVG connectors ────────────────────────────────────────────────────────────

function leftConnector(colX: number, nextColX: number, topC: number, botC: number): string {
  const midX = colX + CW + GAP / 2
  const c = (topC + botC) / 2
  return `M ${colX + CW},${topC} H ${midX} V ${botC} M ${colX + CW},${botC} H ${midX} M ${midX},${c} H ${nextColX}`
}

function rightConnector(colX: number, nextColX: number, topC: number, botC: number): string {
  const midX = colX - GAP / 2
  const nextRight = nextColX + CW
  const c = (topC + botC) / 2
  return `M ${colX},${topC} H ${midX} V ${botC} M ${colX},${botC} H ${midX} M ${midX},${c} H ${nextRight}`
}

function buildConnectors(): string {
  const paths: string[] = []
  for (let i = 0; i < 4; i++) paths.push(leftConnector(X.L_R32, X.L_R16, R32_C[i * 2], R32_C[i * 2 + 1]))
  for (let i = 0; i < 2; i++) paths.push(leftConnector(X.L_R16, X.L_QF, R16_C[i * 2], R16_C[i * 2 + 1]))
  paths.push(leftConnector(X.L_QF, X.L_SF, QF_C[0], QF_C[1]))
  paths.push(`M ${X.L_SF + CW},${SF_C} H ${X.FINAL}`)
  for (let i = 0; i < 4; i++) paths.push(rightConnector(X.R_R32, X.R_R16, R32_C[i * 2], R32_C[i * 2 + 1]))
  for (let i = 0; i < 2; i++) paths.push(rightConnector(X.R_R16, X.R_QF, R16_C[i * 2], R16_C[i * 2 + 1]))
  paths.push(rightConnector(X.R_QF, X.R_SF, QF_C[0], QF_C[1]))
  paths.push(`M ${X.R_SF},${SF_C} H ${X.FINAL + CW}`)
  return paths.join(' ')
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ColHeader({ x, label }: { x: number; label: string }) {
  return (
    <div className="absolute text-center" style={{ left: x, width: CW, top: 0 }}>
      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        {label}
      </span>
    </div>
  )
}

function BracketSlot({ fixture, colX, centerY }: { fixture: MatchFixture; colX: number; centerY: number }) {
  const home = fixture.home ? { name: fixture.home.name, flag: fixture.home.flagEmoji } : null
  const away = fixture.away ? { name: fixture.away.name, flag: fixture.away.flagEmoji } : null

  return (
    <div className="absolute" style={{ left: colX, top: top(centerY), width: CW, height: CH }}>
      <BracketMatchCard fixture={fixture} home={home} away={away} />
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export function BracketView({ locale }: { locale: Locale }) {
  const t = dict[locale].tournament

  const ROUNDS: MatchRound[] = ['Round of 32', 'Round of 16', 'Quarter-final', 'Semi-final', 'Final', 'Third-place play-off']
  const all: Record<string, MatchFixture[]> = {}
  for (const round of ROUNDS) {
    all[round] = getFixtures({ round }).sort((a, b) => a.matchNumber - b.matchNumber)
  }

  const r32 = all['Round of 32']
  const r16 = all['Round of 16']
  const qf  = all['Quarter-final']
  const sf  = all['Semi-final']
  const fin = all['Final']
  const tp  = all['Third-place play-off']

  const roundCols = [
    { x: X.L_R32, label: t.roundLabels['Round of 32'] ?? 'R32' },
    { x: X.L_R16, label: t.roundLabels['Round of 16'] ?? 'R16' },
    { x: X.L_QF,  label: t.roundLabels['Quarter-final'] ?? 'QF' },
    { x: X.L_SF,  label: t.roundLabels['Semi-final'] ?? 'SF' },
    { x: X.FINAL, label: t.roundLabels['Final'] ?? 'Final' },
    { x: X.R_SF,  label: t.roundLabels['Semi-final'] ?? 'SF' },
    { x: X.R_QF,  label: t.roundLabels['Quarter-final'] ?? 'QF' },
    { x: X.R_R16, label: t.roundLabels['Round of 16'] ?? 'R16' },
    { x: X.R_R32, label: t.roundLabels['Round of 32'] ?? 'R32' },
  ]

  const THIRD_Y = BRACKET_H + 40

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
      <div style={{ minWidth: TOTAL_W, position: 'relative' }}>

        {/* Round column headers */}
        <div className="relative mb-2" style={{ height: 28 }}>
          {roundCols.map((col) => (
            <ColHeader key={col.x} x={col.x} label={col.label} />
          ))}
        </div>

        {/* Bracket area */}
        <div className="relative" style={{ height: THIRD_Y + CH + 16 }}>
          {/* SVG connector lines */}
          <svg
            className="pointer-events-none absolute inset-0"
            width={TOTAL_W}
            height={BRACKET_H}
            style={{ top: 0, left: 0 }}
          >
            <path
              d={buildConnectors()}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="text-zinc-300 dark:text-zinc-700"
            />
          </svg>

          {/* Left R32 */}
          {r32.slice(0, 8).map((f, i) => (
            <BracketSlot key={f.id} fixture={f} colX={X.L_R32} centerY={R32_C[i]} />
          ))}
          {/* Left R16 */}
          {r16.slice(0, 4).map((f, i) => (
            <BracketSlot key={f.id} fixture={f} colX={X.L_R16} centerY={R16_C[i]} />
          ))}
          {/* Left QF */}
          {qf.slice(0, 2).map((f, i) => (
            <BracketSlot key={f.id} fixture={f} colX={X.L_QF} centerY={QF_C[i]} />
          ))}
          {/* Left SF */}
          {sf.slice(0, 1).map((f) => (
            <BracketSlot key={f.id} fixture={f} colX={X.L_SF} centerY={SF_C} />
          ))}
          {/* Final */}
          {fin.map((f) => (
            <BracketSlot key={f.id} fixture={f} colX={X.FINAL} centerY={SF_C} />
          ))}
          {/* Right SF */}
          {sf.slice(1, 2).map((f) => (
            <BracketSlot key={f.id} fixture={f} colX={X.R_SF} centerY={SF_C} />
          ))}
          {/* Right QF */}
          {qf.slice(2, 4).map((f, i) => (
            <BracketSlot key={f.id} fixture={f} colX={X.R_QF} centerY={QF_C[i]} />
          ))}
          {/* Right R16 */}
          {r16.slice(4, 8).map((f, i) => (
            <BracketSlot key={f.id} fixture={f} colX={X.R_R16} centerY={R16_C[i]} />
          ))}
          {/* Right R32 */}
          {r32.slice(8, 16).map((f, i) => (
            <BracketSlot key={f.id} fixture={f} colX={X.R_R32} centerY={R32_C[i]} />
          ))}

          {/* Third-place play-off */}
          {tp.length > 0 && (
            <>
              <div
                className="absolute text-center"
                style={{ left: X.FINAL, width: CW, top: THIRD_Y - 20 }}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 dark:text-amber-400">
                  {t.thirdPlace}
                </span>
              </div>
              <BracketSlot fixture={tp[0]} colX={X.FINAL} centerY={THIRD_Y + CH / 2} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
