import { type KeyboardEvent, type ReactNode, useRef } from 'react'
import { cn } from './utils.ts'

export interface SegmentedOption<T extends string> {
  value: T
  label: ReactNode
}

export interface SegmentedControlProps<T extends string> {
  options: readonly SegmentedOption<T>[]
  value: T
  onValueChange: (value: T) => void
  /** Accessible name of the group, e.g. « Période ». */
  'aria-label': string
  size?: 'sm' | 'md'
  className?: string
}

/**
 * Two to five mutually exclusive choices with a sliding indicator.
 * Arrow keys move the selection; each option is a real button with `aria-pressed`.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onValueChange,
  size = 'md',
  className,
  ...rest
}: SegmentedControlProps<T>) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([])
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  )

  function move(event: KeyboardEvent<HTMLButtonElement>, from: number) {
    const step =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? -1
          : 0
    if (step === 0) return
    event.preventDefault()
    const next = (from + step + options.length) % options.length
    onValueChange(options[next].value)
    buttons.current[next]?.focus()
  }

  return (
    <fieldset
      aria-label={rest['aria-label']}
      className={cn(
        'relative m-0 inline-grid min-w-0 rounded-md border-0 bg-hover p-0.5',
        size === 'sm' ? 'h-7 text-xs' : 'h-[var(--u-control-height,2.125rem)] text-sm',
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      <span
        aria-hidden="true"
        className="absolute top-0.5 bottom-0.5 left-0.5 rounded-[calc(var(--u-radius-md)-1px)] bg-surface shadow-xs ring-1 ring-border transition-transform duration-(--u-duration-slow) ease-standard"
        style={{ width: `calc((100% - 4px) / ${options.length})`, transform: `translateX(${index * 100}%)` }}
      />
      {options.map((option, i) => (
        <button
          key={option.value}
          ref={(el) => {
            buttons.current[i] = el
          }}
          type="button"
          aria-pressed={option.value === value}
          tabIndex={option.value === value ? 0 : -1}
          onClick={() => onValueChange(option.value)}
          onKeyDown={(event) => move(event, i)}
          className={cn(
            'relative z-10 rounded-md px-2.5 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring',
            option.value === value ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {option.label}
        </button>
      ))}
    </fieldset>
  )
}
