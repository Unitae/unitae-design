import { type ReactNode, useEffect } from 'react'
import { cn } from './utils.ts'

// The pieces drawn over a map. They know nothing of the map engine: the app places them (as MapLibre markers, or
// absolutely inside the map's frame) and wires their callbacks to the map. Colours come from the tokens; the map
// itself is a quiet grey ground (`@unitae/tokens/map-style`), so these are the only coloured things on it.

export type MapPinState = 'idle' | 'hovered' | 'selected'

export interface MapPinProps {
  /** What the pin shows: the number the list shows for this place. */
  children: ReactNode
  /** Accessible name, e.g. « 4 allée des Peupliers · 68 foyers ». */
  label: string
  /** Hovered here or in the list it mirrors; selected once picked. */
  state?: MapPinState
  onSelect?: () => void
  /** Pointer or keyboard focus entering (true) and leaving (false) the pin. */
  onHover?: (hovering: boolean) => void
  className?: string
}

const PIN_LOOK: Record<MapPinState, string> = {
  idle: '',
  hovered: 'z-10 scale-115 ring-primary ring-offset-2 ring-offset-surface',
  selected: 'z-20 scale-115 bg-foreground text-background',
}

/**
 * A place on the map, numbered like the list beside it. A button: it takes focus, says what it is, and reports
 * whether it is the picked one. Anchor it by its bottom centre. On a touch screen its target reaches 44 px.
 */
export function MapPin({ children, label, state = 'idle', onSelect, onHover, className }: MapPinProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={state === 'selected'}
      title={label}
      onClick={onSelect}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      onFocus={() => onHover?.(true)}
      onBlur={() => onHover?.(false)}
      className={cn(
        'relative flex h-5.5 min-w-6 origin-bottom cursor-pointer items-center justify-center rounded-full bg-primary px-1.5 font-semibold text-[11px] text-primary-foreground tabular-nums shadow-sm ring-2 ring-surface transition-transform',
        'focus-visible:outline-2 focus-visible:outline-foreground focus-visible:outline-offset-3',
        'pointer-coarse:before:absolute pointer-coarse:before:-inset-x-2.5 pointer-coarse:before:-inset-y-3',
        PIN_LOOK[state],
        className,
      )}
    >
      {children}
    </button>
  )
}

/** Where an entrance stands in an edit: on the territory, free, on another one, about to be added or removed. */
export type MapDotState = 'in' | 'free' | 'other' | 'add' | 'remove'

const DOT_LOOK: Record<MapDotState, string> = {
  in: 'size-4.5 bg-primary text-primary-foreground ring-2 ring-surface shadow-sm',
  // Free reads as « nothing yet »: the neutral dashed circle of the lists, never green.
  // On the dark ground the surface would vanish: a slightly lighter fill and a stronger ring keep the dot in view.
  free: 'size-4.5 border-[1.5px] border-dashed border-faint bg-surface shadow-sm dark:border-muted-foreground dark:bg-hover',
  other: 'size-2.5 bg-faint/70 ring-2 ring-surface',
  add: 'size-4.5 bg-primary text-primary-foreground ring-2 ring-surface outline-[1.5px] outline-primary outline-offset-[3px] shadow-sm',
  remove: 'size-4.5 border-2 border-danger bg-surface text-danger shadow-sm',
}

const DOT_ICON: Partial<Record<MapDotState, string>> = {
  in: 'M3 6.2 5 8.2 9 3.8',
  add: 'M6 2.5v7M2.5 6h7',
  remove: 'M3.2 3.2l5.6 5.6M8.8 3.2 3.2 8.8',
}

export interface MapDotProps {
  state: MapDotState
  /** `small` for a legend or a card line. */
  size?: 'map' | 'small'
  className?: string
}

/** An entrance's mark in an editor: state by shape and icon, not by colour alone. Decorative: name it around it. */
export function MapDot({ state, size = 'map', className }: MapDotProps) {
  const icon = DOT_ICON[state]
  return (
    <span
      aria-hidden="true"
      data-state={state}
      className={cn(
        'inline-grid shrink-0 place-content-center rounded-full',
        DOT_LOOK[state],
        size === 'small' && (state === 'other' ? 'size-2' : 'size-3.5 outline-offset-2'),
        className,
      )}
    >
      {icon != null && (
        <svg viewBox="0 0 12 12" aria-hidden="true" className={size === 'small' ? 'size-2.5' : 'size-3'} fill="none">
          <path d={icon} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  )
}

export interface MapClusterProps {
  count: number
  /** Accessible name, e.g. « 24 entrées ». */
  label: string
  /** Usually: zoom in on the group. Without it the disc is only a mark. */
  onSelect?: () => void
  className?: string
}

/** Several places too close to tell apart at this zoom: a quiet disc with their number, larger as it holds more. */
export function MapCluster({ count, label, onSelect, className }: MapClusterProps) {
  const size = count < 10 ? 'size-6.5' : count < 100 ? 'size-8' : 'size-9.5'
  const look = cn(
    'grid place-items-center rounded-full bg-surface font-semibold text-foreground text-xs tabular-nums shadow-sm ring-1 ring-border',
    size,
    className,
  )
  if (onSelect == null) {
    return (
      <span role="img" aria-label={label} className={look}>
        {count}
      </span>
    )
  }
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onSelect}
      className={cn(
        look,
        // A touch target of 44 px at least, whatever the disc's size: the first thing tapped on a zoomed-out map.
        'relative cursor-pointer focus-visible:outline-2 focus-visible:outline-ring pointer-coarse:before:absolute pointer-coarse:before:-inset-2.5',
      )}
    >
      {count}
    </button>
  )
}

/** A stack of map buttons sharing one floating surface. */
export function MapControlGroup({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-col divide-y divide-border overflow-hidden rounded-md bg-surface shadow-md ring-1 ring-border',
        className,
      )}
    >
      {children}
    </div>
  )
}

export interface MapControlButtonProps {
  /** Accessible name and tooltip. */
  label: string
  onClick: () => void
  /** The icon, 16 px. */
  children: ReactNode
  className?: string
}

/** One square map button: 32 px with a mouse, 44 px on a touch screen. */
export function MapControlButton({ label, onClick, children, className }: MapControlButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        'grid size-8 cursor-pointer place-content-center text-muted-foreground transition-colors hover:bg-hover hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2 pointer-coarse:size-11 [&_svg]:size-4',
        className,
      )}
    >
      {children}
    </button>
  )
}

export interface MapControlsProps {
  labels: { zoomIn: string; zoomOut: string; recenter: string }
  onZoomIn: () => void
  onZoomOut: () => void
  /** Brings everything that matters back into view. */
  onRecenter: () => void
  /** More groups under the standard ones, e.g. an address search. */
  children?: ReactNode
  className?: string
}

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

/** Zoom and « Recentrer » in place of the map's own controls, in the map's top-right corner. */
export function MapControls({ labels, onZoomIn, onZoomOut, onRecenter, children, className }: MapControlsProps) {
  return (
    <div className={cn('absolute top-3 right-3 z-10 flex flex-col gap-2', className)}>
      <MapControlGroup>
        <MapControlButton label={labels.zoomIn} onClick={onZoomIn}>
          <svg viewBox="0 0 16 16" aria-hidden="true" {...STROKE}>
            <path d="M8 3.5v9M3.5 8h9" />
          </svg>
        </MapControlButton>
        <MapControlButton label={labels.zoomOut} onClick={onZoomOut}>
          <svg viewBox="0 0 16 16" aria-hidden="true" {...STROKE}>
            <path d="M3.5 8h9" />
          </svg>
        </MapControlButton>
      </MapControlGroup>
      <MapControlGroup>
        <MapControlButton label={labels.recenter} onClick={onRecenter}>
          <svg viewBox="0 0 16 16" aria-hidden="true" {...STROKE}>
            <path d="M2.5 6V3.5a1 1 0 0 1 1-1H6M10 2.5h2.5a1 1 0 0 1 1 1V6M13.5 10v2.5a1 1 0 0 1-1 1H10M6 13.5H3.5a1 1 0 0 1-1-1V10" />
            <circle cx={8} cy={8} r={1.5} />
          </svg>
        </MapControlButton>
      </MapControlGroup>
      {children}
    </div>
  )
}

/** A line about the map, in its top-left corner, e.g. « Les repères portent les numéros de la liste ». */
export function MapCaption({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'pointer-events-none absolute top-3 left-3 z-10 max-w-[calc(100%-5rem)] rounded-md bg-surface px-2 py-1 text-muted-foreground text-xs shadow-md ring-1 ring-border',
        className,
      )}
    >
      {children}
    </span>
  )
}

export interface MapAttributionProps {
  /** Who to credit, e.g. `MAP_ATTRIBUTION` from `@unitae/tokens/map-style`. */
  sources: readonly { label: string; href: string }[]
  className?: string
}

/**
 * The credit the map's data asks for, in its bottom-right corner. It stays visible: put cards and sheets above it
 * (`MapCard` already sits clear of it).
 */
export function MapAttribution({ sources, className }: MapAttributionProps) {
  return (
    <span
      className={cn(
        'absolute right-1.5 bottom-1.5 z-10 whitespace-nowrap rounded-sm bg-surface/85 px-1.5 text-[10.5px] text-faint leading-[18px]',
        className,
      )}
    >
      {sources.map((source, index) => (
        <span key={source.href}>
          {index > 0 && ' · '}
          <a href={source.href} target="_blank" rel="noreferrer" className="hover:text-foreground hover:underline">
            {source.label}
          </a>
        </span>
      ))}
    </span>
  )
}

export interface MapCardProps {
  /** The place, e.g. « 4, 6, 8 allée des Peupliers ». Names the card. */
  title: ReactNode
  /** One quiet line under the title, e.g. « 68 foyers · 8 tél. ». */
  meta?: ReactNode
  onClose: () => void
  /** Accessible name of the close button, e.g. « Fermer la fiche ». */
  closeLabel: string
  children?: ReactNode
  className?: string
}

/**
 * What a picked place holds, without leaving the map: in the map's bottom-right corner on a wide screen, across its
 * width below 1280 px, and above the attribution on both. Escape closes it, unless something inside handled the key.
 * It listens on the window: mount one card per map.
 */
export function MapCard({ title, meta, onClose, closeLabel, children, className }: MapCardProps) {
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) onClose()
    }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [onClose])

  return (
    <section
      aria-label={typeof title === 'string' ? title : undefined}
      className={cn(
        'absolute bottom-7 z-20 flex flex-col gap-2 rounded-lg bg-surface px-3.5 pt-3 pb-3.5 shadow-lg ring-1 ring-border max-xl:inset-x-2 xl:right-3 xl:w-75',
        className,
      )}
    >
      <div className="flex items-start gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5 pt-1">
          <span className="font-semibold tabular-nums">{title}</span>
          {meta != null && <span className="text-faint text-sm tabular-nums">{meta}</span>}
        </div>
        <button
          type="button"
          aria-label={closeLabel}
          onClick={onClose}
          className="grid size-7 shrink-0 cursor-pointer place-content-center rounded-md text-muted-foreground hover:bg-hover hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring pointer-coarse:size-11"
        >
          <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4" {...STROKE}>
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      </div>
      {children}
    </section>
  )
}

export interface MapStatusProps {
  /** `loading` shows a spinner; `error` a warning mark and, usually, a « Réessayer » action. */
  tone: 'loading' | 'error'
  children: ReactNode
  action?: ReactNode
  className?: string
}

/** The map's state in the middle of its frame, so nothing jumps while it loads or when its tiles fail. */
export function MapStatus({ tone, children, action, className }: MapStatusProps) {
  return (
    <div
      role="status"
      className={cn(
        'absolute top-1/2 left-1/2 z-30 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2.5 whitespace-nowrap rounded-md bg-surface py-1.5 pr-1.5 pl-3 text-muted-foreground text-sm shadow-md ring-1 ring-border',
        action == null && 'pr-3',
        className,
      )}
    >
      {tone === 'loading' ? (
        <span
          aria-hidden="true"
          className="size-3.5 animate-spin rounded-full border-2 border-border border-t-muted-foreground"
        />
      ) : (
        <svg viewBox="0 0 12 12" width={12} height={12} aria-hidden="true" className="shrink-0">
          <circle cx={6} cy={6} r={5.25} fill="none" strokeWidth={1.5} style={{ stroke: 'var(--u-warning)' }} />
          <path d="M6 .75a5.25 5.25 0 0 1 0 10.5z" style={{ fill: 'var(--u-warning)' }} />
        </svg>
      )}
      <span>{children}</span>
      {action}
    </div>
  )
}
