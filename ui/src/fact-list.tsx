import { Fragment, type ReactNode } from 'react'
import { cn } from './utils.ts'

export interface Fact {
  label: ReactNode
  /** Left out, or replaced by the list's `emptyLabel`, when it is null, undefined or an empty string. */
  value: ReactNode
  /** A quiet line under the value: an age, a relative date, who leads the group. */
  hint?: ReactNode
  /** A stable key, when the label is not a unique string. */
  key?: string
}

export interface FactListProps {
  facts: Fact[]
  /** The words for a missing value, e.g. « Non renseigné ». Without them, a fact without a value is left out. */
  emptyLabel?: ReactNode
  className?: string
}

function isEmpty(value: ReactNode) {
  return value == null || value === '' || value === false
}

/**
 * Facts about one thing as label / value pairs: a person's contact details, a group's leaders. A description list,
 * labels in a column of their own width, values taking the rest and wrapping anywhere (addresses, e-mails).
 */
export function FactList({ facts, emptyLabel, className }: FactListProps) {
  const shown = emptyLabel == null ? facts.filter((fact) => !isEmpty(fact.value)) : facts
  if (shown.length === 0) return null

  return (
    <dl className={cn('m-0 grid grid-cols-[max-content_minmax(0,1fr)] gap-x-4 gap-y-2.5 text-sm', className)}>
      {shown.map((fact, index) => (
        <Fragment key={fact.key ?? (typeof fact.label === 'string' ? fact.label : String(index))}>
          <dt className="text-faint">{fact.label}</dt>
          <dd className="m-0 min-w-0 text-foreground wrap-anywhere">
            {isEmpty(fact.value) ? <span className="text-faint">{emptyLabel}</span> : fact.value}
            {fact.hint != null && <span className="mt-0.5 block text-faint text-xs">{fact.hint}</span>}
          </dd>
        </Fragment>
      ))}
    </dl>
  )
}
