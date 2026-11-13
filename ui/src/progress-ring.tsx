import { cn } from './utils.ts'

export interface ProgressRingProps {
  value: number
  max: number
  /**
   * Names the ring and announces it as a progress bar. Leave it out when the figure beside it (« 5/7 ») already says
   * the numbers: the ring is then decorative.
   */
  'aria-label'?: string
  /** `sm` (14 px) beside a figure in a list row, `md` (18 px) beside a larger one. */
  size?: 'sm' | 'md'
  /**
   * For a share where more is worse, such as a limit: the arc wears this tone, full or not, instead of turning the
   * success colour once complete. Leave it out for a share where complete means done.
   */
  tone?: 'warning' | 'danger'
  className?: string
}

const SIZE = { sm: 14, md: 18 } as const
const STROKE = 2

/**
 * A share of a whole as a small ring, for a column of shares in a list (« 5/7 », « 20 sur 24 »): it fits a one-line
 * row where a bar would not. A thin arc over a solid track, so it never reads as a status shape (those are filled,
 * dashed or halved); complete, the arc turns the success colour. Past the whole, it stays full.
 */
export function ProgressRing({ value, max, size = 'sm', tone, className, ...rest }: ProgressRingProps) {
  const px = SIZE[size]
  const centre = px / 2
  const radius = (px - STROKE) / 2
  const circumference = 2 * Math.PI * radius
  const share = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0
  const complete = share >= 1
  const drawn = share * circumference
  const arcColour = tone ? `var(--u-${tone})` : complete ? 'var(--u-success)' : 'var(--u-primary)'
  const label = rest['aria-label']
  const semantics =
    label != null
      ? { role: 'progressbar', 'aria-label': label, 'aria-valuenow': value, 'aria-valuemin': 0, 'aria-valuemax': max }
      : {}

  return (
    <span {...semantics} className={cn('inline-flex shrink-0', className)}>
      <svg viewBox={`0 0 ${px} ${px}`} width={px} height={px} aria-hidden="true" className="-rotate-90">
        <circle
          cx={centre}
          cy={centre}
          r={radius}
          fill="none"
          strokeWidth={STROKE}
          style={{ stroke: 'var(--u-border-strong)' }}
        />
        {share > 0 && (
          <circle
            cx={centre}
            cy={centre}
            r={radius}
            fill="none"
            strokeWidth={STROKE}
            strokeLinecap={complete ? 'butt' : 'round'}
            strokeDasharray={`${drawn} ${circumference - drawn}`}
            style={{ stroke: arcColour }}
          />
        )}
      </svg>
    </span>
  )
}
