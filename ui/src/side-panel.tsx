import { type KeyboardEvent, type ReactNode, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { cn } from './utils.ts'

export interface SidePanelProps {
  title: ReactNode
  /** One line under the title, e.g. what the change affects. */
  description?: ReactNode
  onClose: () => void
  /** Accessible name of the close button, e.g. « Fermer ». */
  closeLabel: string
  /** Pinned under the content: cancel, then the primary action. */
  footer?: ReactNode
  /** Where focus goes back on close, e.g. the row's edit button. Defaults to what had focus when the panel opened. */
  returnFocus?: HTMLElement | null
  /**
   * Walks the list the panel was opened from: where this item sits (« 3 sur 12 ») and buttons to the previous and
   * next ones, in the header beside the close button. Leave a handler out where there is nowhere to go.
   */
  walk?: SidePanelWalk
  children: ReactNode
  className?: string
}

export interface SidePanelWalk {
  position: ReactNode
  previousLabel: string
  nextLabel: string
  onPrevious?: () => void
  onNext?: () => void
}

/**
 * Edits the selected item beside the page's main column, so the list stays in view. Not a dialog: nothing is
 * dimmed and the page stays usable. Put it in a flex row after the main column; it takes 340–400 px and sticks to
 * the top while the page scrolls (an app whose shell defeats `position: sticky` positions it itself through
 * `className`). The title and the footer stay put while the content scrolls between them, and the panel never runs
 * past the bottom of the screen: its height follows the space left under its top as the page scrolls. Something
 * fixed at the bottom of the screen, a save bar, reserves its room with the `--side-panel-bottom` variable.
 *
 * Focus moves into the panel when it mounts and goes back where it was when it unmounts, unless the person has
 * moved on. Escape closes it, except when something inside handled the key first (an open menu). Mount one panel
 * per item, with a `key`, so each opening starts from the item.
 */
export function SidePanel({
  title,
  description,
  onClose,
  closeLabel,
  footer,
  returnFocus,
  walk,
  children,
  className,
}: SidePanelProps) {
  const titleId = useId()
  const descriptionId = useId()
  const ref = useRef<HTMLElement>(null)
  const returnTo = useRef(returnFocus)
  returnTo.current = returnFocus
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  // Lower down the page before it scrolls, at its sticky offset after: the panel fits the screen under its top, so
  // its footer is always in view.
  useLayoutEffect(() => {
    const panel = ref.current
    if (panel == null) return
    const measure = () =>
      panel.style.setProperty('--side-panel-top', `${Math.max(panel.getBoundingClientRect().top, 0)}px`)
    let frame = 0
    const fit = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }
    measure()
    // Capture: scroll does not bubble, and the page may scroll in a container rather than the document.
    document.addEventListener('scroll', fit, { capture: true, passive: true })
    window.addEventListener('resize', fit)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('scroll', fit, { capture: true })
      window.removeEventListener('resize', fit)
    }
  }, [])

  // A layout effect, because its cleanup must run while the panel is still in the document: that is the only
  // moment it can tell focus inside the panel (hand it back) from focus the person moved elsewhere (leave it).
  useLayoutEffect(() => {
    const panel = ref.current
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    if (panel != null && !panel.contains(previous)) panel.focus({ preventScroll: true })
    return () => {
      const active = document.activeElement
      const focusWasInside = active == null || active === document.body || panel?.contains(active)
      const target = returnTo.current?.isConnected ? returnTo.current : previous
      if (focusWasInside && target?.isConnected) target.focus({ preventScroll: true })
    }
  }, [])

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== 'Escape' || event.defaultPrevented) return
    event.preventDefault()
    onClose()
  }

  return (
    <aside
      ref={ref}
      tabIndex={-1}
      aria-labelledby={titleId}
      aria-describedby={description != null ? descriptionId : undefined}
      onKeyDown={onKeyDown}
      className={cn(
        'sticky top-4 flex max-h-[calc(100dvh-var(--side-panel-top,1rem)-var(--side-panel-bottom,1rem))] min-w-0 max-w-[400px] flex-[1_1_340px] flex-col self-start rounded-lg border border-border bg-surface shadow-lg outline-none',
        'transition-[opacity,translate] duration-(--u-duration-fast) ease-(--u-ease) motion-reduce:transition-none',
        entered ? 'translate-x-0 opacity-100' : 'translate-x-1 opacity-0',
        className,
      )}
    >
      <div className="flex flex-none items-start gap-2.5 border-border border-b px-4.5 py-4">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h2 id={titleId} className="font-semibold text-base text-foreground leading-snug">
            {title}
          </h2>
          {description != null && (
            <p id={descriptionId} className="text-faint text-xs">
              {description}
            </p>
          )}
        </div>
        {walk != null && (
          <div className="-mt-0.5 flex flex-none items-center gap-0.5">
            <span className="mr-1 text-faint text-xs tabular-nums">{walk.position}</span>
            <HeaderButton label={walk.previousLabel} onClick={walk.onPrevious}>
              <path d="M4 10l4-4 4 4" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
            </HeaderButton>
            <HeaderButton label={walk.nextLabel} onClick={walk.onNext}>
              <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
            </HeaderButton>
          </div>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="-mt-0.5 -mr-1.5 inline-flex size-7 flex-none items-center justify-center rounded-md text-muted-foreground outline-none transition-colors duration-(--u-duration-fast) hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <svg viewBox="0 0 16 16" width={16} height={16} aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4.5 py-4">{children}</div>
      {footer != null && (
        <div className="flex flex-none flex-wrap items-center justify-end gap-2 border-border border-t px-4.5 py-3">
          {footer}
        </div>
      )}
    </aside>
  )
}

function HeaderButton({ label, onClick, children }: { label: string; onClick?: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={onClick == null}
      aria-label={label}
      className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors duration-(--u-duration-fast) hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40"
    >
      <svg viewBox="0 0 16 16" width={16} height={16} aria-hidden="true">
        {children}
      </svg>
    </button>
  )
}
