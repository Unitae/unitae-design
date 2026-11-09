import { cn } from './utils.ts'

export interface DateChipProps {
  /** The month, already formatted in the reader's language (« mars », « nov. »). Shown in capitals. */
  month: string
  /** The day of the month. */
  day: string
  className?: string
}

/** A day as a small tile, the month over the day. Decorative: the row beside it says the full date. */
export function DateChip({ month, day, className }: DateChipProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex size-11 shrink-0 flex-col items-center justify-center rounded-md border border-border leading-none',
        className,
      )}
    >
      <span className="font-semibold text-[10px] text-brand-text uppercase tracking-wide">{month}</span>
      <span className="mt-1 font-semibold text-base tabular-nums">{day}</span>
    </span>
  )
}
