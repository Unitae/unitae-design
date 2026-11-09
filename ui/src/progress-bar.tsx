import { cn } from './utils.ts'

export type ProgressTone = 'accent' | 'muted' | 'success'

const toneClass: Record<ProgressTone, string> = {
  accent: 'bg-primary',
  muted: 'bg-chart-muted',
  success: 'bg-success',
}

export interface ProgressBarProps {
  value: number
  max: number
  /**
   * Names the bar and announces it as a progress bar. Leave it out when the text beside the bar already says the
   * numbers: the bar is then decorative.
   */
  'aria-label'?: string
  /** `accent` for the share the page is about, `muted` for a quantity still filling, `success` for a goal reached. */
  tone?: ProgressTone
  /** `sm` (4 px) under a line of text, `md` (6 px) as the main mark of a block. */
  size?: 'sm' | 'md'
  className?: string
}

/** A share of a whole as a thin rounded bar; past the whole, it stays full. */
export function ProgressBar({ value, max, tone = 'accent', size = 'sm', className, ...rest }: ProgressBarProps) {
  const share = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0
  const label = rest['aria-label']
  const semantics =
    label != null
      ? { role: 'progressbar', 'aria-label': label, 'aria-valuenow': value, 'aria-valuemin': 0, 'aria-valuemax': max }
      : { 'aria-hidden': true }

  return (
    <div
      {...semantics}
      className={cn('w-full overflow-hidden rounded-full bg-hover', size === 'md' ? 'h-1.5' : 'h-1', className)}
    >
      <div
        className={cn(
          'h-full rounded-full transition-[width] duration-(--u-duration-fast) ease-(--u-ease) motion-reduce:transition-none',
          toneClass[tone],
        )}
        style={{ width: `${share * 100}%` }}
      />
    </div>
  )
}
