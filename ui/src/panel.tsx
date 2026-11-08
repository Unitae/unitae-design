import { type ReactNode, useId } from 'react'
import { cn } from './utils.ts'

export interface PanelProps {
  /** The panel's heading. Without one, name the panel with `aria-label`. */
  title?: ReactNode
  /** Controls after the title: a filter, buttons. They wrap under the title when the space runs out. */
  actions?: ReactNode
  /** Give the content the panel's padding, for fields. Leave it off for rows that run from edge to edge. */
  padded?: boolean
  /** A closing line under the content, aligned to the end, e.g. totals. */
  footer?: ReactNode
  children?: ReactNode
  'aria-label'?: string
  className?: string
}

/**
 * A bordered surface for one block of a page: a list of rows, or a few fields. The header holds the title and
 * its actions; rows run edge to edge under a hairline, padded content sits under the title without one.
 */
export function Panel({ title, actions, padded = false, footer, children, className, ...rest }: PanelProps) {
  const titleId = useId()
  const hasHeader = title != null || actions != null

  return (
    <section
      aria-labelledby={title != null ? titleId : undefined}
      aria-label={title == null ? rest['aria-label'] : undefined}
      className={cn('overflow-hidden rounded-lg border border-border bg-surface', className)}
    >
      {hasHeader && (
        <div
          className={cn(
            'flex flex-wrap items-center gap-2 px-4.5 py-3.5',
            !padded && children != null && 'border-border border-b',
          )}
        >
          {title != null && (
            <h2 id={titleId} className="flex-1 font-semibold text-base text-foreground leading-snug">
              {title}
            </h2>
          )}
          {actions != null && <div className="ml-auto flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      {children != null && (
        <div className={cn(padded && 'px-4.5 pb-4', padded && !hasHeader && 'pt-4')}>{children}</div>
      )}
      {footer != null && (
        <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 border-border border-t px-4.5 py-2.5 text-muted-foreground text-sm">
          {footer}
        </div>
      )}
    </section>
  )
}
