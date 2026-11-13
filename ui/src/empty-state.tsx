import type { ReactNode } from 'react'
import { cn } from './utils.ts'

export interface EmptyStateProps {
  /** A quiet icon in a neutral tile; no illustration. */
  icon?: ReactNode
  /** One plain sentence. */
  title: ReactNode
  description?: ReactNode
  /** When the reader can act: the action, usually one button. */
  action?: ReactNode
  className?: string
}

/** What a list or a page shows with nothing in it: one plain sentence and, when the reader can act, the action. */
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-8 text-center sm:py-16', className)}>
      {icon != null && (
        <div className="flex size-12 items-center justify-center rounded-lg bg-muted text-muted-foreground ring-1 ring-border/60 [&>svg]:size-6">
          {icon}
        </div>
      )}
      <div className="flex flex-col gap-1">
        <p className="m-0 font-medium text-foreground text-sm">{title}</p>
        {description != null && <p className="m-0 max-w-sm text-muted-foreground text-sm">{description}</p>}
      </div>
      {action != null && <div className="mt-2">{action}</div>}
    </div>
  )
}
