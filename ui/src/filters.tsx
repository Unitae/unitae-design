import type { ComponentProps, ReactNode } from 'react'
import { cn } from './utils.ts'

export interface FilterButtonProps extends Omit<ComponentProps<'button'>, 'children'> {
  /** The button's text, e.g. « Filtres ». */
  label: string
  /** How many filters are on; nothing shows at 0. */
  count?: number
  /** The accessible name while filters are on, e.g. « Filtres, 2 actifs ». */
  activeLabel?: string
}

/**
 * The one « Filtres » button of a list's toolbar, saying how many filters are on. The popover it opens is the app's
 * (it passes the trigger props through, refs included, so a Radix `asChild` trigger works).
 */
export function FilterButton({
  label,
  count = 0,
  activeLabel,
  className,
  type = 'button',
  ...props
}: FilterButtonProps) {
  return (
    <button
      type={type}
      aria-label={count > 0 && activeLabel ? activeLabel : undefined}
      className={cn(
        'inline-flex h-(--u-control-height,2.25rem) items-center gap-2 rounded-md border border-input bg-surface px-3 font-medium text-foreground text-sm outline-none transition-colors duration-(--u-duration-fast) hover:bg-hover focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
      {...props}
    >
      <svg viewBox="0 0 16 16" width={16} height={16} aria-hidden="true" className="text-muted-foreground">
        <path
          d="M2.5 4h11M4.5 8h7M6.5 12h3"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      </svg>
      {label}
      {count > 0 && (
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1.5 text-background text-xs tabular-nums">
          {count}
        </span>
      )}
    </button>
  )
}

export interface FilterChipItem {
  /** Identifies the chip, e.g. the query parameter its × clears. */
  key: string
  /** The filter's name, e.g. « Groupe ». */
  label: string
  /** What it is set to, e.g. « Nord ». */
  value: string
  /** Where its × leads (the address without this filter), rendered through `renderLink`; else `onRemove`. */
  removeHref?: string
  onRemove?: () => void
}

export interface FilterChipLinkProps {
  href: string
  className: string
  'aria-label'?: string
  children: ReactNode
}

export interface FilterChipBarProps {
  chips: FilterChipItem[]
  /** Names the region for screen readers, e.g. « Filtres actifs ». */
  'aria-label': string
  /** The × button's accessible name for a chip, e.g. `c => \`Retirer ${c.label} : ${c.value}\``. */
  removeLabel: (chip: FilterChipItem) => string
  /** The text of the link that clears them all, e.g. « Effacer les filtres ». */
  clearLabel: string
  clearHref?: string
  onClear?: () => void
  /** Renders a link with the app's router link. */
  renderLink?: (props: FilterChipLinkProps) => ReactNode
  className?: string
}

const removeClass =
  'inline-flex size-6 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors duration-(--u-duration-fast) hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring'
const clearClass = 'text-sm text-brand-text underline-offset-4 hover:underline'

function Cross() {
  return (
    <svg viewBox="0 0 16 16" width={14} height={14} aria-hidden="true">
      <path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  )
}

/**
 * The active filters under a list's toolbar, one chip each (« Groupe : Nord »), and the link that clears them all.
 * Only a chip's × removes its filter, so a click on the label never drops one by mistake. Nothing shows without one.
 */
export function FilterChipBar({
  chips,
  removeLabel,
  clearLabel,
  clearHref,
  onClear,
  renderLink,
  className,
  ...rest
}: FilterChipBarProps) {
  if (chips.length === 0) return null
  const link = (props: FilterChipLinkProps) => (renderLink ? renderLink(props) : <a {...props} />)
  return (
    <section
      aria-label={rest['aria-label']}
      aria-live="polite"
      className={cn('flex flex-wrap items-center gap-1.5', className)}
    >
      {chips.map((chip) => (
        <span
          key={chip.key}
          title={`${chip.label} : ${chip.value}`}
          className="inline-flex h-7 items-center gap-1 rounded-full border border-border bg-card pr-0.5 pl-2.5 text-sm"
        >
          <span className="text-muted-foreground">{chip.label} :</span>
          <span className="block max-w-[16ch] truncate sm:max-w-[24ch]">{chip.value}</span>
          {chip.removeHref != null ? (
            link({
              href: chip.removeHref,
              className: removeClass,
              'aria-label': removeLabel(chip),
              children: <Cross />,
            })
          ) : (
            <button type="button" onClick={chip.onRemove} aria-label={removeLabel(chip)} className={removeClass}>
              <Cross />
            </button>
          )}
        </span>
      ))}
      {clearHref != null ? (
        link({ href: clearHref, className: clearClass, children: clearLabel })
      ) : (
        <button type="button" onClick={onClear} className={cn(clearClass, 'border-0 bg-transparent p-0')}>
          {clearLabel}
        </button>
      )}
    </section>
  )
}
