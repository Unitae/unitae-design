import { type KeyboardEvent, useEffect, useId, useMemo, useRef, useState } from 'react'
import { cn } from './utils.ts'

export interface DateFieldLabels {
  /** The calendar button and the calendar itself, e.g. « Choisir une date ». */
  openCalendar: string
  previousMonth: string
  nextMonth: string
}

export interface DateFieldProps {
  id?: string
  /** Submitted with the form as `YYYY-MM-DD` (empty when no date), through a hidden input. */
  name?: string
  /** The day as `YYYY-MM-DD`, or null for none. Leave it out to let the field keep its own value. */
  value?: string | null
  defaultValue?: string | null
  onChange?: (value: string | null) => void
  /** The reader's language, e.g. `fr-FR`: how the day is written and in which order it is typed. */
  locale: string
  labels: DateFieldLabels
  /** First and last days that can be chosen, as `YYYY-MM-DD`. */
  min?: string
  max?: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
  className?: string
}

/** A calendar day read at noon UTC and formatted in UTC never slips to the day before or after. */
const noon = (day: string) => new Date(`${day}T12:00:00Z`)
const iso = (date: Date) => date.toISOString().slice(0, 10)
const addDays = (day: string, days: number) => iso(new Date(noon(day).getTime() + days * 86_400_000))

function addMonths(day: string, months: number): string {
  const [year, month, date] = day.split('-').map(Number)
  const target = new Date(Date.UTC(year, month - 1 + months, 1, 12))
  const last = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0, 12)).getUTCDate()
  target.setUTCDate(Math.min(date, last))
  return iso(target)
}

function todayIso(): string {
  const now = new Date()
  return iso(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 12)))
}

/** 1 = Monday … 7 = Sunday, from the locale's week when the runtime knows it. */
function firstDayOfWeek(locale: string): number {
  try {
    const intl = new Intl.Locale(locale) as Intl.Locale & {
      getWeekInfo?: () => { firstDay: number }
      weekInfo?: { firstDay: number }
    }
    const info = intl.getWeekInfo?.() ?? intl.weekInfo
    if (info != null) return info.firstDay
    return ['US', 'CA', 'BR', 'JP'].includes(intl.maximize().region ?? '') ? 7 : 1
  } catch {
    return 1
  }
}

function formats(locale: string) {
  const utc = { timeZone: 'UTC' } as const
  return {
    written: new Intl.DateTimeFormat(locale, {
      ...utc,
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    numeric: new Intl.DateTimeFormat(locale, { ...utc, day: '2-digit', month: '2-digit', year: 'numeric' }),
    spoken: new Intl.DateTimeFormat(locale, {
      ...utc,
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    month: new Intl.DateTimeFormat(locale, { ...utc, month: 'long', year: 'numeric' }),
    weekday: new Intl.DateTimeFormat(locale, { ...utc, weekday: 'narrow' }),
    order: new Intl.DateTimeFormat(locale, { ...utc, day: '2-digit', month: '2-digit', year: 'numeric' })
      .formatToParts(noon('2026-11-10'))
      .map((part) => part.type)
      .filter((type): type is 'day' | 'month' | 'year' => type === 'day' || type === 'month' || type === 'year'),
  }
}

/** A typed date in the reader's order (« 3/12/26 », « 03.12.2026 »): the day, or null when it is not one. */
function parseTyped(text: string, order: ('day' | 'month' | 'year')[]): string | null {
  const parts = text.trim().split(/\D+/).filter(Boolean)
  if (parts.length !== 3) return null
  const value = Object.fromEntries(order.map((type, index) => [type, Number(parts[index])])) as Record<
    'day' | 'month' | 'year',
    number
  >
  const year = value.year < 100 ? 2000 + value.year : value.year
  const date = new Date(Date.UTC(year, value.month - 1, value.day, 12))
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== value.month - 1 || date.getUTCDate() !== value.day) {
    return null
  }
  return iso(date)
}

/**
 * A date written out with its weekday (« mar. 10 novembre 2026 »), so the day of the week reads at once. The reader
 * can type it in their own order while the field has focus, or pick it in a month calendar walked by keyboard; on a
 * touch screen the device's own picker opens instead. The value is a calendar day (`YYYY-MM-DD`), free of any zone.
 */
export function DateField({
  id,
  name,
  value,
  defaultValue = null,
  onChange,
  locale,
  labels,
  min,
  max,
  required,
  disabled,
  placeholder,
  className,
  ...aria
}: DateFieldProps) {
  const format = useMemo(() => formats(locale), [locale])
  const [inner, setInner] = useState<string | null>(defaultValue)
  const current = value !== undefined ? value : inner
  const [draft, setDraft] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const fieldRef = useRef<HTMLInputElement>(null)

  const set = (next: string | null) => {
    if (value === undefined) setInner(next)
    onChange?.(next)
  }
  const inRange = (day: string) => (min == null || day >= min) && (max == null || day <= max)

  function commit() {
    if (draft == null) return
    if (draft.trim() === '') set(null)
    else {
      const typed = parseTyped(draft, format.order)
      if (typed != null && inRange(typed)) set(typed)
    }
    setDraft(null)
  }

  useEffect(() => {
    if (!open) return
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const shown = draft ?? (current != null ? format.written.format(noon(current)) : '')

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <input
        ref={fieldRef}
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={shown}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        aria-describedby={aria['aria-describedby']}
        aria-invalid={aria['aria-invalid']}
        onFocus={() => setDraft(current != null ? format.numeric.format(noon(current)) : '')}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && draft != null) {
            event.preventDefault()
            commit()
          }
        }}
        className="h-(--u-control-height,2.25rem) w-full min-w-0 rounded-md border border-input bg-surface py-1 pr-9 pl-3 text-foreground text-sm outline-none transition-[color,border-color,box-shadow] duration-(--u-duration-fast) placeholder:text-faint focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger"
      />
      <button
        type="button"
        aria-label={labels.openCalendar}
        aria-haspopup="dialog"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((previous) => !previous)}
        className="-translate-y-1/2 absolute top-1/2 right-1 inline-flex size-7 items-center justify-center rounded-md text-faint outline-none transition-colors duration-(--u-duration-fast) hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring pointer-coarse:hidden"
      >
        <CalendarIcon />
      </button>
      {/* On a touch screen the device's own picker opens: an invisible native field over the written one. */}
      <input
        type="date"
        tabIndex={-1}
        aria-hidden="true"
        value={current ?? ''}
        min={min}
        max={max}
        disabled={disabled}
        onChange={(event) => set(event.target.value || null)}
        className="absolute inset-0 hidden h-full w-full cursor-pointer opacity-0 pointer-coarse:block"
      />
      {name != null && <input type="hidden" name={name} value={current ?? ''} />}
      {open && (
        <Calendar
          selected={current}
          format={format}
          weekStart={firstDayOfWeek(locale)}
          labels={labels}
          inRange={inRange}
          onPick={(day) => {
            set(day)
            setOpen(false)
            fieldRef.current?.focus({ preventScroll: true })
            setDraft(null)
          }}
          onClose={() => {
            setOpen(false)
            fieldRef.current?.focus({ preventScroll: true })
            setDraft(null)
          }}
        />
      )}
    </div>
  )
}

/** 1 = Monday … 7 = Sunday. */
const weekday = (day: string) => ((noon(day).getUTCDay() + 6) % 7) + 1

/** Where a key moves the calendar's focus: arrows by day and week, Page Up / Down by month, Home / End to the week's ends. */
function stepFor(key: string, day: string, weekStart: number): string | null {
  const intoWeek = (weekday(day) - weekStart + 7) % 7
  switch (key) {
    case 'ArrowLeft':
      return addDays(day, -1)
    case 'ArrowRight':
      return addDays(day, 1)
    case 'ArrowUp':
      return addDays(day, -7)
    case 'ArrowDown':
      return addDays(day, 7)
    case 'PageUp':
      return addMonths(day, -1)
    case 'PageDown':
      return addMonths(day, 1)
    case 'Home':
      return addDays(day, -intoWeek)
    case 'End':
      return addDays(day, 6 - intoWeek)
    default:
      return null
  }
}

interface CalendarProps {
  selected: string | null
  format: ReturnType<typeof formats>
  weekStart: number
  labels: DateFieldLabels
  inRange: (day: string) => boolean
  onPick: (day: string) => void
  onClose: () => void
}

/** The month grid: arrows move by day and week, Page Up / Page Down by month, Home / End to the week's ends. */
function Calendar({ selected, format, weekStart, labels, inRange, onPick, onClose }: CalendarProps) {
  const today = todayIso()
  const [focusDay, setFocusDay] = useState(selected ?? today)
  const gridRef = useRef<HTMLTableElement>(null)
  const titleId = useId()

  useEffect(() => {
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-day="${focusDay}"]`)?.focus({ preventScroll: true })
  }, [focusDay])

  const monthStart = `${focusDay.slice(0, 8)}01`
  const offset = (weekday(monthStart) - weekStart + 7) % 7
  const gridStart = addDays(monthStart, -offset)
  const month = focusDay.slice(0, 7)
  const weeks: string[][] = []
  for (let week = 0; week < 6; week++) {
    const days = Array.from({ length: 7 }, (_, index) => addDays(gridStart, week * 7 + index))
    if (week > 0 && days[0].slice(0, 7) !== month) break
    weeks.push(days)
  }

  function onKeyDown(event: KeyboardEvent<HTMLTableElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      onClose()
      return
    }
    const next = stepFor(event.key, focusDay, weekStart)
    if (next == null) return
    event.preventDefault()
    setFocusDay(next)
  }

  return (
    <div
      role="dialog"
      aria-label={labels.openCalendar}
      className="absolute top-full left-0 z-50 mt-1 w-70 rounded-lg border border-border bg-surface p-2.5 shadow-lg"
    >
      <div className="mb-1.5 flex items-center justify-between">
        <MonthButton label={labels.previousMonth} onClick={() => setFocusDay(addMonths(focusDay, -1))} back />
        <span id={titleId} className="font-medium text-foreground text-sm">
          {format.month.format(noon(monthStart))}
        </span>
        <MonthButton label={labels.nextMonth} onClick={() => setFocusDay(addMonths(focusDay, 1))} />
      </div>
      {/* The date picker pattern: a grid of days, walked with the arrow keys; each day is a button. */}
      <table
        ref={gridRef}
        // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: a table of days is the date picker grid
        role="grid"
        aria-labelledby={titleId}
        onKeyDown={onKeyDown}
        className="w-full border-collapse"
      >
        <thead>
          <tr>
            {weeks[0].map((day) => (
              <th key={day} scope="col" className="pb-1 font-normal text-faint text-xs">
                {format.weekday.format(noon(day))}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((days) => (
            <tr key={days[0]}>
              {days.map((day) => {
                const outside = day.slice(0, 7) !== month
                const isSelected = day === selected
                return (
                  <td key={day} className="p-0 text-center">
                    {outside ? null : (
                      <button
                        type="button"
                        data-day={day}
                        tabIndex={day === focusDay ? 0 : -1}
                        aria-label={format.spoken.format(noon(day))}
                        aria-pressed={isSelected}
                        disabled={!inRange(day)}
                        onClick={() => onPick(day)}
                        className={cn(
                          'inline-flex size-8 items-center justify-center rounded-md text-sm tabular-nums outline-none transition-colors duration-(--u-duration-fast) focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:text-faint disabled:opacity-40',
                          isSelected
                            ? 'bg-primary font-medium text-primary-foreground'
                            : 'text-foreground hover:bg-hover',
                          !isSelected && day === today && 'ring-1 ring-border-strong ring-inset',
                        )}
                      >
                        {Number(day.slice(8))}
                      </button>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MonthButton({ label, onClick, back }: { label: string; onClick: () => void; back?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors duration-(--u-duration-fast) hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
    >
      <svg viewBox="0 0 16 16" width={16} height={16} aria-hidden="true">
        <path
          d={back ? 'M10 4l-4 4 4 4' : 'M6 4l4 4-4 4'}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 16 16" width={16} height={16} aria-hidden="true">
      <rect x={2.5} y={3.5} width={11} height={10} rx={1.5} fill="none" stroke="currentColor" strokeWidth={1.3} />
      <path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" />
    </svg>
  )
}
