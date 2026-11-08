import { type ReactNode, useId } from 'react'
import { cn } from './utils.ts'

export interface FormSectionProps {
  title: ReactNode
  /** A short line above the title naming the kind of thing, e.g. « Porte à porte ». An icon may lead it. */
  kicker?: ReactNode
  /** What the fields are for, under the title. */
  description?: ReactNode
  /** Actions on the section itself, under the description, e.g. « Supprimer cette entrée ». */
  actions?: ReactNode
  /** The fields, in a grid of columns at least 200 px wide (a lone field keeps one column); give a field `col-span-full` to take a whole row. */
  children?: ReactNode
  className?: string
}

/**
 * One part of a long form: its title and explanation on the left, its fields on the right, separated from the
 * previous section by a hairline. The two columns stack when the space runs out.
 */
export function FormSection({ title, kicker, description, actions, children, className }: FormSectionProps) {
  const titleId = useId()
  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        'flex flex-wrap gap-x-10 gap-y-4 border-border border-t py-6 first:border-t-0 first:pt-0',
        className,
      )}
    >
      <div className="flex max-w-[300px] flex-[1_1_220px] flex-col items-start gap-1">
        {kicker != null && (
          <p className="inline-flex items-center gap-1.5 font-medium text-faint text-xs [&_svg]:size-3.5">{kicker}</p>
        )}
        <h2 id={titleId} className="font-semibold text-base text-foreground leading-snug">
          {title}
        </h2>
        {description != null && <p className="text-muted-foreground text-sm">{description}</p>}
        {actions != null && <div className="mt-1.5 flex flex-wrap gap-2">{actions}</div>}
      </div>
      {children != null && (
        <div className="grid min-w-0 flex-[3_1_420px] grid-cols-[repeat(auto-fill,minmax(200px,1fr))] content-start gap-4">
          {children}
        </div>
      )}
    </section>
  )
}
