import type { ReactNode } from 'react'
import { cn } from './utils.ts'

export interface SectionHeadingProps {
  /** The section's name. */
  title: ReactNode
  /** Quiet context right after the title: a count, a date. */
  meta?: ReactNode
  /** A tag after the meta, e.g. « 2 non lus ». */
  badge?: ReactNode
  /** Controls and links at the end of the line. They wrap under the title when the space runs out. */
  actions?: ReactNode
  /** The heading level: `h2` unless the page needs a lower one. */
  as?: 'h2' | 'h3'
  /**
   * Turns the title into a button that shows and hides the section's content: `controls` is the id of that
   * content, `expanded` whether it shows. The meta and the badge go inside the button; the actions stay out.
   */
  collapsible?: { expanded: boolean; onToggle: () => void; controls: string }
  /** For the section to be named after its heading (`aria-labelledby`). */
  id?: string
  className?: string
}

function Chevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={16}
      height={16}
      aria-hidden="true"
      className={cn(
        'shrink-0 text-faint transition-transform duration-150 motion-reduce:transition-none',
        expanded && 'rotate-90',
      )}
    >
      <path
        d="M6 4l4 4-4 4"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * The line above a block of a page: its title in ink, a quiet count, a tag, and its actions at the end. Collapsible,
 * the whole title side is one button that says whether the block is open.
 */
export function SectionHeading({
  title,
  meta,
  badge,
  actions,
  as: Heading = 'h2',
  collapsible,
  id,
  className,
}: SectionHeadingProps) {
  const quiet = meta != null && <span className="font-normal text-faint text-sm tabular-nums">{meta}</span>

  return (
    <div className={cn('flex min-h-7 flex-wrap items-center gap-x-2.5 gap-y-1', className)}>
      {collapsible ? (
        <Heading id={id} className="min-w-0 flex-1 font-semibold text-[15px] text-foreground leading-snug">
          <button
            type="button"
            aria-expanded={collapsible.expanded}
            aria-controls={collapsible.controls}
            onClick={collapsible.onToggle}
            className="-mx-1.5 flex w-[calc(100%+0.75rem)] items-center gap-2 rounded-md px-1.5 py-1 text-left outline-none transition-colors hover:bg-hover focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Chevron expanded={collapsible.expanded} />
            <span>{title}</span>
            {quiet}
            {badge}
          </button>
        </Heading>
      ) : (
        <>
          <Heading id={id} className="font-semibold text-[15px] text-foreground leading-snug">
            {title}
          </Heading>
          {quiet}
          {badge}
        </>
      )}
      {actions != null && <div className="ml-auto flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
