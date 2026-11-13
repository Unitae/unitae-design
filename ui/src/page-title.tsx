import type { ReactNode } from 'react'
import { cn } from './utils.ts'

export interface PageTitleProps {
  title: ReactNode
  /** Right after the title, e.g. a count or a `Tag`. */
  titleBadge?: ReactNode
  subtitle?: ReactNode
  /** A line of facts under the subtitle, e.g. « Territoire 14 · 14 foyers · 3 entrées ». */
  meta?: ReactNode
  /** What the page is about, drawn in a quiet tile before the title (a building, a congregation…). */
  icon?: ReactNode
  /** Controls over what the page shows (a filter, a period) on the title's row. Actions go in the top bar. */
  controls?: ReactNode
  className?: string
}

/** The page's title row: the h1 with its facts, and the controls that change what the page shows. */
export function PageTitle({ title, titleBadge, subtitle, meta, icon, controls, className }: PageTitleProps) {
  const heading = (
    <div className={cn('flex min-w-0', icon != null ? 'items-start gap-4' : 'items-center gap-3')}>
      {icon != null && (
        <span className="grid size-11 shrink-0 place-content-center rounded-lg border border-border bg-sidebar text-faint [&>svg]:size-5">
          {icon}
        </span>
      )}
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-2">
          <h1 className="m-0 text-h1">{title}</h1>
          {titleBadge}
        </div>
        {subtitle != null && <p className="m-0 mt-0.5 text-muted-foreground text-sm">{subtitle}</p>}
        {meta != null && (
          <div className="mt-1.5 flex flex-wrap gap-x-3.5 gap-y-1 text-muted-foreground text-sm">{meta}</div>
        )}
      </div>
    </div>
  )
  if (controls == null) return <div className={className}>{heading}</div>
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3', className)}>
      {heading}
      {/* On a phone the controls wrap under each other on a row of their own, rather than run past the edge. */}
      <div className="flex max-w-full shrink-0 flex-wrap items-center gap-2 max-md:w-full">{controls}</div>
    </div>
  )
}
