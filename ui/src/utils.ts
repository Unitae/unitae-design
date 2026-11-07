import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * The categorical chart colour for a series position, as a CSS value that follows light/dark mode.
 * Assign in order and never cycle: past eight series, fold the rest into `chartOther`.
 */
export function seriesColor(index: number): string {
  if (index < 0 || index > 7) return chartOther
  return `var(--color-chart-${index + 1})`
}

export const chartOther = 'var(--color-chart-other)'
export const chartMuted = 'var(--color-chart-muted)'
export const chartContext = 'var(--color-chart-context)'

/** Share of a value in a total, guarded against an empty total. */
export function share(value: number, total: number): number {
  return total > 0 ? value / total : 0
}
