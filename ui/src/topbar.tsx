import type { ReactNode } from 'react'
import { cn } from './utils.ts'

export interface TopbarRowProps {
  /** The trail, usually a `Breadcrumb`. */
  trail: ReactNode
  /** Right after the trail: the arrows to the list's previous and next item. */
  trailEnd?: ReactNode
  /** Before the trail: what brings back a collapsed sidebar. */
  leading?: ReactNode
  /** On the right: the page's export and its primary action. Never a switch: that goes on the title row. */
  actions?: ReactNode
  className?: string
}

/**
 * The 48 px bar at the top of a page: the trail on the left, the page's actions on the right, a hairline under it.
 * Where it sits, and how it stacks on a phone, is the app shell's business; pass the classes through `className`.
 */
export function TopbarRow({ trail, trailEnd, leading, actions, className }: TopbarRowProps) {
  return (
    <div className={cn('flex h-12 items-center gap-2 border-b px-6', className)}>
      {leading}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {trail}
        {trailEnd != null && <div className="flex shrink-0 items-center">{trailEnd}</div>}
      </div>
      {actions != null && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export interface BreadcrumbItem {
  label: ReactNode
  /** Where the crumb leads; the last crumb, the page itself, needs none. */
  href?: string
}

export interface BreadcrumbLinkProps {
  href: string
  className: string
  children: ReactNode
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
  /** Names the trail for screen readers, e.g. « Fil d’Ariane ». */
  'aria-label': string
  /** Renders a crumb with the app's router link, e.g. `p => <Link to={p.href} {...rest} />`. */
  renderLink?: (props: BreadcrumbLinkProps) => ReactNode
  className?: string
}

function Chevron() {
  return (
    <svg viewBox="0 0 16 16" width={14} height={14} aria-hidden="true" className="shrink-0 text-faint">
      <path
        d="M6 3.5L10.5 8 6 12.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const linkClass = 'truncate text-muted-foreground no-underline transition-colors hover:text-foreground'

/**
 * The page's trail on one line, ending with the page itself in ink. On a phone the page's title sits right below, so
 * only the ancestors show, as the way back.
 */
export function Breadcrumb({ items, renderLink, className, ...rest }: BreadcrumbProps) {
  const last = items.length - 1
  return (
    <nav aria-label={rest['aria-label']} className={cn('min-w-0', last === 0 && 'max-md:hidden', className)}>
      <ol className="m-0 flex min-w-0 list-none items-center gap-1.5 whitespace-nowrap p-0 text-sm">
        {items.map((item, index) => (
          <li
            // biome-ignore lint/suspicious/noArrayIndexKey: a trail may repeat a label; its order never changes
            key={index}
            className={cn(
              'flex min-w-0 items-center gap-1.5',
              index === last ? 'max-md:hidden' : 'max-w-48 shrink-0 max-md:shrink',
            )}
          >
            {index > 0 && <Chevron />}
            {index === last ? (
              <span aria-current="page" className="truncate font-medium text-foreground">
                {item.label}
              </span>
            ) : item.href != null ? (
              renderLink ? (
                renderLink({ href: item.href, className: linkClass, children: item.label })
              ) : (
                <a href={item.href} className={linkClass}>
                  {item.label}
                </a>
              )
            ) : (
              <span className="truncate text-muted-foreground">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
