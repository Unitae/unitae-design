import { type KeyboardEvent, type ReactNode, useEffect, useState } from 'react'
import { cn } from './utils.ts'

export interface SelectionBarProps {
  /** How many items are selected, e.g. « 2 sélectionnés ». Announced when it changes. */
  label: ReactNode
  /** The actions on the selection: buttons or links. */
  children: ReactNode
  onClear: () => void
  /** Accessible name of the clear button, e.g. « Vider la sélection ». */
  clearLabel: string
  /** Accessible name of the toolbar, e.g. « Actions sur la sélection ». */
  'aria-label': string
  className?: string
}

/**
 * The actions on a list selection, floating at the bottom of the screen while something is selected.
 * Mount it only when the selection is not empty; Escape inside it clears the selection.
 */
export function SelectionBar({ label, children, onClear, clearLabel, className, ...rest }: SelectionBarProps) {
  const [entered, setEntered] = useState(false)
  useEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Escape') return
    event.preventDefault()
    onClear()
  }

  return (
    <div
      role="toolbar"
      aria-label={rest['aria-label']}
      onKeyDown={onKeyDown}
      className={cn(
        'fixed bottom-6 left-1/2 z-40 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-lg border border-border bg-popover py-1.5 pr-1.5 pl-3.5 text-popover-foreground text-sm shadow-lg',
        'transition-[opacity,translate,scale] duration-(--u-duration-slow) ease-(--u-ease) motion-reduce:transition-none',
        entered ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-3 scale-[0.98] opacity-0',
        className,
      )}
    >
      <span aria-live="polite" className="mr-2 font-medium tabular-nums">
        {label}
      </span>
      {children}
      <button
        type="button"
        onClick={onClear}
        aria-label={clearLabel}
        className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors duration-(--u-duration-fast) hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <svg viewBox="0 0 16 16" width={16} height={16} aria-hidden="true">
          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
