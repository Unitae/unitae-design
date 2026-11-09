import type { ReactNode } from 'react'
import { cn } from './utils.ts'

export type StatTone = 'neutral' | 'positive' | 'warning' | 'negative'

const toneClass: Record<StatTone, string> = {
  neutral: 'text-faint',
  positive: 'text-success-text',
  warning: 'text-warning-text',
  negative: 'text-danger-text',
}

export interface StatTileProps {
  label: ReactNode
  value: ReactNode
  /** Small unit after the value, e.g. "/ 52" or "territoires". */
  unit?: ReactNode
  /** One line under the value: a delta, a context, a comparison. */
  foot?: ReactNode
  /** Colour of the foot line: is this good news, a warning, or neutral context? */
  tone?: StatTone
  /** Optional trend as a 12-point sparkline: history in the muted hue, the last point emphasised. */
  trend?: number[]
  className?: string
}

/** A headline number with its label, used alone or inside a `MetricStrip`. */
export function StatTile({ label, value, unit, foot, tone = 'neutral', trend, className }: StatTileProps) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1 px-4 py-4', className)}>
      <span className="font-medium text-muted-foreground text-sm">{label}</span>
      <span className="font-semibold text-2xl text-foreground leading-tight tracking-tight">
        {value}
        {unit != null && <span className="ml-1.5 font-medium text-faint text-sm tracking-normal">{unit}</span>}
      </span>
      {foot != null && <span className={cn('text-xs', toneClass[tone])}>{foot}</span>}
      {trend && trend.length > 1 && <Sparkline values={trend} className="mt-2" />}
    </div>
  )
}

export interface MetricStripProps {
  children: ReactNode
  /** Accessible name of the group, e.g. « Indicateurs de l'assemblée ». */
  'aria-label': string
  /** Minimum tile width before the strip wraps. */
  minTileWidth?: number
  className?: string
}

/** Stat tiles in one bordered strip, separated by hairlines rather than boxed one by one. */
export function MetricStrip({ children, minTileWidth = 170, className, ...rest }: MetricStripProps) {
  return (
    <section
      aria-label={rest['aria-label']}
      className={cn('grid rounded-lg border border-border bg-card [&>*+*]:border-border [&>*+*]:border-l', className)}
      style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${minTileWidth}px, 1fr))` }}
    >
      {children}
    </section>
  )
}

/** A period without a value: one still to come, one outside the span, or one that should have had a value. */
export type SparkGap = 'future' | 'off' | 'missing'

const gapClass: Record<SparkGap, string> = {
  future: 'bg-hover',
  off: 'bg-transparent',
  missing: 'bg-danger',
}

export interface SparklineProps {
  /** One point per period, in order: a number draws a column, a gap marks a period without one. */
  values: (number | SparkGap)[]
  /** A reference level drawn as a dashed line, e.g. the monthly goal. Columns scale to it as well. */
  goal?: number
  /** Every column in the muted hue, e.g. for a stint that has ended. */
  muted?: boolean
  className?: string
}

/**
 * Tiny columns, decorative: the number it accompanies carries the meaning. The last value is emphasised; a missing
 * period gets a short red mark on the baseline, a future one a grey stub.
 */
export function Sparkline({ values, goal, muted = false, className }: SparklineProps) {
  let max = Math.max(goal ?? 0, 0)
  let last = -1
  values.forEach((v, i) => {
    if (typeof v !== 'number') return
    max = Math.max(max, v)
    last = i
  })
  const scale = (v: number) => (max > 0 ? (v / max) * 100 : 0)

  return (
    <div aria-hidden="true" className={cn('relative flex h-6 items-end gap-0.5', className)}>
      {values.map((v, i) =>
        typeof v === 'number' ? (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: positional series without identity
            key={i}
            className="flex-1 rounded-t-[2px]"
            style={{
              height: `${Math.max(scale(v), 4)}%`,
              background: !muted && i === last ? 'var(--color-chart-1)' : 'var(--color-chart-muted)',
            }}
          />
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: positional series without identity
          <span key={i} className={cn('h-0.5 flex-1 rounded-[1px]', gapClass[v])} />
        ),
      )}
      {goal != null && goal > 0 && (
        <span
          className="pointer-events-none absolute inset-x-0 border-faint border-t border-dashed opacity-70"
          style={{ bottom: `${scale(goal)}%` }}
        />
      )}
    </div>
  )
}
