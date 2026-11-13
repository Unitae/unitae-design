import type { ReactNode } from 'react'
import { cn } from './utils.ts'

export interface AuthFrameProps {
  /** Opens the column: a monogram, the `Lockup`, or a quiet icon tile on a page that reports rather than asks. */
  emblem?: ReactNode
  /** A line above the title, e.g. the congregation's name or « Erreur 404 ». */
  eyebrow?: ReactNode
  /** The page's action, e.g. « Se connecter ». */
  title: ReactNode
  /** What the page says under its title. */
  description?: ReactNode
  /** A slightly wider column, for a page that is mostly reading. */
  wide?: boolean
  /** Closes the page: the mark, the privacy link, a language switch. */
  footer?: ReactNode
  children?: ReactNode
  className?: string
}

/**
 * The frame of every page outside an app's shell — signing in, a link sent, a payment, an error the app could not
 * frame: the bare page, one narrow column in the middle, no card.
 */
export function AuthFrame({
  emblem,
  eyebrow,
  title,
  description,
  wide = false,
  footer,
  children,
  className,
}: AuthFrameProps) {
  return (
    <div className={cn('flex min-h-svh flex-col items-center bg-background px-4', className)}>
      <main className="flex w-full flex-1 items-center justify-center py-16">
        <div className={cn('flex w-full max-w-[22.5rem] flex-col gap-5', wide && 'max-w-[25rem]')}>
          <div className="flex flex-col items-start gap-3.5">
            {emblem}
            <div className="flex flex-col gap-1">
              {eyebrow != null && <p className="m-0 text-faint text-sm">{eyebrow}</p>}
              <h1 className="m-0 text-h1">{title}</h1>
            </div>
            {description != null && <p className="m-0 text-muted-foreground text-sm leading-relaxed">{description}</p>}
          </div>
          {children}
        </div>
      </main>
      {footer != null && <footer className="flex items-center gap-4 py-6 text-faint text-xs">{footer}</footer>}
    </div>
  )
}
