import type { ReactNode } from 'react'
import type { PeriodLinkProps, PeriodStep } from './period-stepper.tsx'
import { cn } from './utils.ts'

export interface PaginationBarProps {
  /** Where the reader is, e.g. « 1–25 sur 42 » or « Page 1 sur 2 ». */
  label: ReactNode
  previous: PeriodStep
  next: PeriodStep
  /** Renders a step that has an `href` with the app's router link. */
  renderLink?: (props: PeriodLinkProps) => ReactNode
  /** On the left, before the label: a page-size control, a total. */
  children?: ReactNode
  className?: string
}

const stepClass =
  'inline-flex size-8 flex-none items-center justify-center rounded-md border border-input bg-surface text-muted-foreground outline-none transition-colors duration-(--u-duration-fast) hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring'

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 16 16" width={16} height={16} aria-hidden="true">
      <path
        d={direction === 'left' ? 'M10 3.5L5.5 8l4.5 4.5' : 'M6 3.5L10.5 8 6 12.5'}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Step({
  step,
  direction,
  renderLink,
}: {
  step: PeriodStep
  direction: 'left' | 'right'
  renderLink?: PaginationBarProps['renderLink']
}) {
  const icon = <Chevron direction={direction} />
  if (step.disabled) {
    return (
      <button
        type="button"
        disabled
        aria-label={step.label}
        className={cn(stepClass, 'pointer-events-none opacity-45')}
      >
        {icon}
      </button>
    )
  }
  if (step.href != null) {
    const props = { href: step.href, className: stepClass, 'aria-label': step.label, children: icon }
    return renderLink ? renderLink(props) : <a {...props} />
  }
  return (
    <button type="button" onClick={step.onClick} aria-label={step.label} className={stepClass}>
      {icon}
    </button>
  )
}

/** Under a long list: where the reader is, and the way to the previous and next page. */
export function PaginationBar({ label, previous, next, renderLink, children, className }: PaginationBarProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {children}
      <span className="text-faint text-sm tabular-nums">{label}</span>
      <span className="flex-1" />
      <Step step={previous} direction="left" renderLink={renderLink} />
      <Step step={next} direction="right" renderLink={renderLink} />
    </div>
  )
}
