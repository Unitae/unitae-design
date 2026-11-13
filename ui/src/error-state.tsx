import type { ReactNode } from 'react'
import { cn } from './utils.ts'

export interface ErrorStateProps {
  /** A quiet icon in a neutral tile, e.g. a magnifier for « introuvable ». */
  icon?: ReactNode
  /** Above the title, e.g. « Erreur 404 ». */
  code?: ReactNode
  title: ReactNode
  /** What happened and what to do, in plain words. */
  description?: ReactNode
  /** The ways on: one filled button (a retry, or the most useful way back), the others quieter. */
  actions?: ReactNode
  /** Below the actions, e.g. the technical details of a server error in a `<details>`. */
  details?: ReactNode
  className?: string
}

/** An error drawn where the page would have been, so the shell around it stays and the way back is one click. */
export function ErrorState({ icon, code, title, description, actions, details, className }: ErrorStateProps) {
  return (
    <div className={cn('flex w-full max-w-[25rem] flex-col gap-4.5', className)}>
      {icon != null && (
        <span className="grid size-10 place-content-center rounded-md border border-border bg-sidebar text-faint [&>svg]:size-5">
          {icon}
        </span>
      )}
      <div className="flex flex-col gap-1">
        {code != null && <p className="m-0 text-faint text-sm tabular-nums">{code}</p>}
        <h1 className="m-0 text-h1">{title}</h1>
      </div>
      {description != null && <p className="m-0 text-muted-foreground text-sm leading-relaxed">{description}</p>}
      {actions != null && <div className="flex flex-wrap gap-2">{actions}</div>}
      {details}
    </div>
  )
}
