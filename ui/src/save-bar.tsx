import { type ReactNode, useEffect, useState } from 'react'
import { cn } from './utils.ts'

export interface SaveBarProps {
  /** What is waiting to be saved, e.g. « 3 modifications non enregistrées ». Announced when it changes. */
  label?: ReactNode
  /** Mark the label with the unsaved-changes dot. Leave it off where nothing exists yet to compare with. */
  dirty?: boolean
  /** The buttons: cancel, then the primary save. */
  children: ReactNode
  /** Accessible name of the bar, e.g. « Enregistrement ». */
  'aria-label': string
  className?: string
}

/**
 * The save actions of a long form, held at the bottom of the scrolling area. Sticky by default; an app whose
 * shell defeats `position: sticky` positions it itself through `className`. The label stays on one line: on a
 * narrow screen the buttons move under it.
 */
export function SaveBar({ label, dirty = true, children, className, ...rest }: SaveBarProps) {
  const [entered, setEntered] = useState(false)
  useEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <section
      aria-label={rest['aria-label']}
      className={cn(
        'sticky bottom-0 z-30 flex flex-wrap items-center gap-x-2.5 gap-y-2 border-border border-t bg-surface px-4 py-3 text-sm md:px-8',
        'transition-[opacity,translate] duration-(--u-duration-slow) ease-(--u-ease) motion-reduce:transition-none',
        entered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
        className,
      )}
    >
      <span className="flex flex-[1_1_auto] items-center gap-2.5 whitespace-nowrap">
        {dirty && <span aria-hidden="true" className="size-2 flex-none rounded-full bg-warning" />}
        <span aria-live="polite" className="text-muted-foreground">
          {label}
        </span>
      </span>
      <span className="ml-auto flex flex-wrap items-center justify-end gap-2">{children}</span>
    </section>
  )
}
