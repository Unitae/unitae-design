import { type ReactNode, useEffect, useState } from 'react'
import { chartOther, cn, share } from './utils.ts'

/** True after the first paint, so bars can grow from zero with a CSS transition (no keyframes needed). */
function useMounted(): boolean {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])
  return mounted
}

export interface BarListItem {
  key: string
  label: ReactNode
  value: number
  /** Text shown at the end of the bar; defaults to the formatted value. */
  display?: ReactNode
  /** Folded tail ("Autres", "Sans groupe"): drawn in the neutral colour. */
  other?: boolean
}

export interface BarListProps {
  items: BarListItem[]
  /** Scale maximum; defaults to the largest value. */
  max?: number
  /** Bar colour for regular items; one series → one hue. */
  color?: string
  formatValue?: (value: number) => string
  'aria-label'?: string
  className?: string
}

/** Ranked horizontal bars, one hue: compare parts of a whole or nominal categories. */
export function BarList({
  items,
  max,
  color = 'var(--color-chart-1)',
  formatValue = String,
  className,
  ...rest
}: BarListProps) {
  const mounted = useMounted()
  const scale = max ?? Math.max(...items.map((i) => i.value), 0)
  return (
    <ul aria-label={rest['aria-label']} className={cn('flex flex-col gap-2.5', className)}>
      {items.map((item) => (
        <li
          key={item.key}
          className="group grid items-center gap-3 text-sm"
          style={{ gridTemplateColumns: 'minmax(6rem, min(32%, 14rem)) minmax(0, 1fr) auto' }}
        >
          <span className="truncate text-foreground">{item.label}</span>
          <span className="h-3.5" aria-hidden="true">
            <span
              className="block h-full rounded-r-[4px] transition-[width,filter] duration-(--u-duration-slow) ease-standard group-hover:brightness-110"
              style={{
                width: mounted ? `${share(item.value, scale) * 100}%` : '0%',
                background: item.other ? chartOther : color,
              }}
            />
          </span>
          <span className="min-w-8 text-right text-muted-foreground tabular-nums">
            {item.display ?? formatValue(item.value)}
          </span>
        </li>
      ))}
    </ul>
  )
}

export interface SegmentedBarPart {
  key: string
  label: string
  value: number
  /** Fill colour, e.g. `var(--color-success)` for a state, `seriesColor(i)` for a category. */
  color: string
  /** Label colour inside the fill, e.g. `var(--color-ink-on-success)`; defaults to white. */
  ink?: string
}

export interface SegmentedBarProps {
  parts: SegmentedBarPart[]
  /** Accessible name; the parts and their values are appended to it. */
  'aria-label': string
  /** Parts narrower than this share print no value inside (it stays in the legend's title and the table). */
  labelThreshold?: number
  formatValue?: (value: number) => string
  showLegend?: boolean
  className?: string
}

/** One whole split into at most six parts, read at a glance. Values print inside where they fit. */
export function SegmentedBar({
  parts,
  labelThreshold = 0.1,
  formatValue = String,
  showLegend = true,
  className,
  ...rest
}: SegmentedBarProps) {
  const mounted = useMounted()
  const total = parts.reduce((sum, p) => sum + p.value, 0)
  const description = `${rest['aria-label']} : ${parts.map((p) => `${p.label} ${formatValue(p.value)}`).join(', ')}`
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div role="img" aria-label={description} className="flex h-7 gap-0.5">
        {parts
          .filter((p) => p.value > 0)
          .map((p) => (
            <span
              key={p.key}
              title={`${p.label} : ${formatValue(p.value)}`}
              className="flex min-w-0 items-center overflow-hidden rounded-[4px] px-2 font-semibold text-xs transition-[flex-grow,filter] duration-(--u-duration-slow) ease-standard hover:brightness-110"
              style={{ flex: `${mounted ? p.value : 0} 1 0`, background: p.color, color: p.ink ?? '#fff' }}
            >
              {share(p.value, total) >= labelThreshold ? formatValue(p.value) : null}
            </span>
          ))}
      </div>
      {showLegend && (
        <ul className="flex flex-wrap gap-x-3.5 gap-y-1.5 text-muted-foreground text-sm">
          {parts.map((p) => (
            <li key={p.key} className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="size-2.5 rounded-[2px]" style={{ background: p.color }} />
              {p.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
