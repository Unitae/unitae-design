import type { ReactNode } from 'react'
import { cn } from './utils.ts'

export interface PeriodStep {
  /** Accessible name, e.g. « Mois précédent ». */
  label: string
  /** Where the step leads; rendered through `renderLink` when given, else as a plain anchor. */
  href?: string
  onClick?: () => void
  /** No period that way, e.g. the future. */
  disabled?: boolean
}

export interface PeriodLinkProps {
  href: string
  className: string
  'aria-label': string
  children: ReactNode
}

export interface PeriodStepperProps {
  /** The period shown, e.g. « octobre 2026 ». */
  label: ReactNode
  previous: PeriodStep
  next: PeriodStep
  /** Renders a step that has an `href` with the app's router link, e.g. `p => <Link to={p.href} {...rest} />`. */
  renderLink?: (props: PeriodLinkProps) => ReactNode
  /** The label's minimum width, so the arrows hold still while the label changes. */
  labelWidth?: number
  className?: string
}

const stepClass =
  'inline-flex size-8 flex-none items-center justify-center rounded-md text-muted-foreground outline-none transition-colors duration-(--u-duration-fast) hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring'

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
  renderLink?: PeriodStepperProps['renderLink']
}) {
  const icon = <Chevron direction={direction} />
  if (step.disabled) {
    return (
      <button
        type="button"
        disabled
        aria-label={step.label}
        className={cn(stepClass, 'pointer-events-none opacity-40')}
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

/** Steps through periods — months, service years — with the current one between two arrows. */
export function PeriodStepper({ label, previous, next, renderLink, labelWidth = 128, className }: PeriodStepperProps) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      <Step step={previous} direction="left" renderLink={renderLink} />
      <span
        className="whitespace-nowrap text-center font-medium text-foreground text-sm tabular-nums"
        style={{ minWidth: labelWidth }}
        aria-live="polite"
      >
        {label}
      </span>
      <Step step={next} direction="right" renderLink={renderLink} />
    </div>
  )
}
