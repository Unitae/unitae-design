import { cn } from './utils.ts'

export interface MarkProps {
  /** Side length in px. */
  size?: number
  /** `onAccent` for the white mark on a petrol app icon. */
  variant?: 'default' | 'onAccent'
  /** Accessible name; omit when the mark sits next to the wordmark. */
  title?: string
  className?: string
}

/** The Unitae mark: three blocks of a territory and the petrol marker on the map. */
export function Mark({ size = 20, variant = 'default', title, className }: MarkProps) {
  const block = variant === 'onAccent' ? '#ffffff' : 'var(--u-fg)'
  const marker = variant === 'onAccent' ? 'rgb(255 255 255 / 0.45)' : 'var(--u-accent)'
  const blocks = [0, 1, 2, 3].map((i) => (
    <span key={i} style={{ borderRadius: i === 1 ? '50%' : size * 0.09, background: i === 1 ? marker : block }} />
  ))
  const className_ = cn('inline-grid shrink-0 grid-cols-2', className)
  const style = { width: size, height: size, gap: size * 0.14 }
  if (title) {
    return (
      <span role="img" aria-label={title} className={className_} style={style}>
        {blocks}
      </span>
    )
  }
  return (
    <span aria-hidden="true" className={className_} style={style}>
      {blocks}
    </span>
  )
}

export interface LockupProps {
  /** Font size of the wordmark in px; the mark scales with it. */
  size?: number
  className?: string
}

/** Mark + "unitae" wordmark. */
export function Lockup({ size = 18, className }: LockupProps) {
  return (
    <span className={cn('inline-flex items-center', className)} style={{ gap: size * 0.45 }}>
      <Mark size={Math.round(size * 0.95)} />
      <span
        className="font-sans font-semibold text-foreground leading-none"
        style={{ fontSize: size, letterSpacing: '-0.03em' }}
      >
        unitae
      </span>
    </span>
  )
}
