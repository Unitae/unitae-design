import type { ReactNode } from 'react'
import { Kbd } from './status.tsx'
import { cn } from './utils.ts'

export interface SidebarFrameProps {
  /** Above the navigation: the product mark, a workspace menu, a search button. */
  header?: ReactNode
  /** The navigation itself, usually a `<nav>` of `NavGroup`s. */
  children: ReactNode
  /** Pinned to the bottom: settings, the signed-in person. */
  footer?: ReactNode
  className?: string
}

/**
 * The quiet column on the left of an app: a header, the navigation that scrolls, a footer that stays. Dimmer than the
 * page so the content stands out. Its width and its behaviour on a phone are the app's: it only draws the column.
 */
export function SidebarFrame({ header, children, footer, className }: SidebarFrameProps) {
  return (
    <aside
      className={cn(
        'flex h-full w-60 flex-col border-sidebar-border border-r bg-sidebar text-sidebar-foreground',
        className,
      )}
    >
      {header != null && <div className="flex flex-col gap-3 px-2.5 pt-3 pb-1">{header}</div>}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-1 [scrollbar-width:thin]">{children}</div>
      {footer != null && <div className="flex flex-col gap-0.5 px-2.5 pt-1 pb-3">{footer}</div>}
    </aside>
  )
}

export interface NavGroupProps {
  /** The group's name in sentence case; a group of one entry usually goes without. */
  label?: ReactNode
  children: ReactNode
  className?: string
}

/** A group of entries in the sidebar, under its quiet label. */
export function NavGroup({ label, children, className }: NavGroupProps) {
  return (
    <div className={cn('flex flex-col py-1', className)}>
      {label != null && <div className="flex h-6 items-center px-3 font-medium text-faint text-xs">{label}</div>}
      <ul className="m-0 flex list-none flex-col gap-px p-1.5 pt-0">{children}</ul>
    </div>
  )
}

export interface NavLinkProps {
  href: string
  className: string
  'aria-current'?: 'page'
  onClick?: () => void
  children: ReactNode
}

export interface NavItemProps {
  label: ReactNode
  href: string
  /** A 16 px icon before the label, faint until the entry is current. */
  icon?: ReactNode
  /** The page the reader is on: marked for the eye and for screen readers (`aria-current="page"`). */
  current?: boolean
  /** A keyboard shortcut, e.g. « G C », shown when the entry is hovered or focused. */
  shortcut?: string
  /** Renders the entry with the app's router link, e.g. `p => <Link to={p.href} {...rest} />`. */
  renderLink?: (props: NavLinkProps) => ReactNode
  /** On a phone, closing the sheet the sidebar sits in once an entry is chosen. */
  onClick?: () => void
}

const itemClass =
  'group/nav flex h-8 w-full items-center gap-2.5 rounded-md px-2 font-medium text-muted-foreground text-sm no-underline outline-none transition-colors duration-(--u-duration-fast) hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:bg-selected aria-[current=page]:text-foreground [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-faint aria-[current=page]:[&>svg]:text-brand'

/** One entry of the sidebar: icon, label and, on hover, its shortcut. */
export function NavItem({ label, href, icon, current = false, shortcut, renderLink, onClick }: NavItemProps) {
  const children = (
    <>
      {icon}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {shortcut != null && (
        <Kbd className="opacity-0 transition-opacity duration-(--u-duration-fast) group-hover/nav:opacity-100 group-focus-visible/nav:opacity-100">
          {shortcut}
        </Kbd>
      )}
    </>
  )
  const props: NavLinkProps = {
    href,
    className: itemClass,
    ...(current ? { 'aria-current': 'page' as const } : {}),
    ...(onClick ? { onClick } : {}),
    children,
  }
  return <li>{renderLink ? renderLink(props) : <a {...props} />}</li>
}
