import type { ReactNode } from 'react'
import { cn } from './utils.ts'

export type StatusTone = 'success' | 'warning' | 'danger' | 'neutral'

/** A status mark: shape and colour together, so the state never relies on colour alone. */
export function StatusIcon({ tone, className }: { tone: StatusTone; className?: string }) {
  return (
    <svg viewBox="0 0 12 12" width={12} height={12} aria-hidden="true" className={cn('shrink-0', className)}>
      {tone === 'success' && (
        <>
          <circle cx={6} cy={6} r={6} style={{ fill: 'var(--u-success)' }} />
          <path d="M3.4 6.1l1.8 1.8 3.4-3.7" fill="none" stroke="#fff" strokeWidth={1.5} strokeLinecap="round" />
        </>
      )}
      {tone === 'warning' && (
        <>
          <circle cx={6} cy={6} r={5.25} fill="none" strokeWidth={1.5} style={{ stroke: 'var(--u-warning)' }} />
          <path d="M6 .75a5.25 5.25 0 0 1 0 10.5z" style={{ fill: 'var(--u-warning)' }} />
        </>
      )}
      {tone === 'danger' && (
        <>
          <circle cx={6} cy={6} r={6} style={{ fill: 'var(--u-danger)' }} />
          <path d="M3.5 6h5" stroke="#fff" strokeWidth={1.5} strokeLinecap="round" />
        </>
      )}
      {tone === 'neutral' && (
        <circle
          cx={6}
          cy={6}
          r={5.25}
          fill="none"
          strokeWidth={1.5}
          strokeDasharray="2.2 1.9"
          style={{ stroke: 'var(--u-fg-faint)' }}
        />
      )}
    </svg>
  )
}

export interface StatusProps {
  tone: StatusTone
  children: ReactNode
  className?: string
}

/** Icon + label, e.g. « Confirmé », « En attente », « À pourvoir ». */
export function Status({ tone, children, className }: StatusProps) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap text-muted-foreground text-sm', className)}>
      <StatusIcon tone={tone} />
      {children}
    </span>
  )
}

export interface TagProps {
  children: ReactNode
  tone?: 'neutral' | 'brand'
  className?: string
}

/** A quiet label for attributes (roles, groups, types). Not for status — use `Status`. */
export function Tag({ children, tone = 'neutral', className }: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex h-5 items-center whitespace-nowrap rounded-sm border px-1.5 font-medium text-xs',
        tone === 'brand'
          ? 'border-transparent bg-brand-soft text-brand-text'
          : 'border-border bg-surface text-muted-foreground',
        className,
      )}
    >
      {children}
    </span>
  )
}

/** A keyboard key hint, e.g. ⌘ K. */
export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-5 items-center justify-center rounded-[4px] border border-border bg-surface px-1 font-sans text-[11px] text-faint leading-none',
        className,
      )}
    >
      {children}
    </kbd>
  )
}
