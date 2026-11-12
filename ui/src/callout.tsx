import type { AriaRole, ReactNode } from 'react'
import { StatusIcon } from './status.tsx'
import { cn } from './utils.ts'

export type CalloutTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger'

const toneClass: Record<CalloutTone, string> = {
  neutral: 'border-border bg-subtle',
  info: 'border-transparent bg-brand-soft',
  success: 'border-transparent bg-success-soft',
  warning: 'border-transparent bg-warning-soft',
  danger: 'border-transparent bg-danger-soft',
}

export interface CalloutProps {
  tone: CalloutTone
  /** One short line saying what happened, e.g. « Impossible d’enregistrer ». */
  title?: ReactNode
  /** What it means and what to do, in a sentence or two. */
  children?: ReactNode
  /** One action at the end of the line, e.g. « Réessayer ». */
  action?: ReactNode
  /** `alert` for an error the reader must notice now, `status` for a quiet notice; none for a lasting one. */
  role?: AriaRole
  className?: string
}

/**
 * A notice inside the page: a refused save, an offline warning, a trial ending. The tone is a soft tint and a status
 * shape, never colour alone, and the text keeps its own colours. No tinted icon chip, no left border.
 */
export function Callout({ tone, title, children, action, role, className }: CalloutProps) {
  return (
    <div
      data-callout=""
      data-tone={tone}
      role={role}
      className={cn('flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm', toneClass[tone], className)}
    >
      <span className="flex h-5 flex-none items-center">
        {tone === 'info' ? <InfoIcon /> : <StatusIcon tone={tone} />}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {title != null && <p className="m-0 font-medium text-foreground">{title}</p>}
        {children != null && <div className="text-muted-foreground">{children}</div>}
      </div>
      {action != null && <div className="flex flex-none items-center">{action}</div>}
    </div>
  )
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 12 12" width={12} height={12} aria-hidden="true" className="shrink-0">
      <circle cx={6} cy={6} r={6} style={{ fill: 'var(--u-accent)' }} />
      <path d="M6 5.4v3.1M6 3.5v.1" stroke="#fff" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  )
}
