import { cn } from './utils.ts'

/** « Élodie MARTIN » → « ÉM », « Marc » → « M »: first letters of the first and last words. */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ''
  const first = Array.from(words[0])[0] ?? ''
  const last = words.length > 1 ? (Array.from(words[words.length - 1])[0] ?? '') : ''
  return `${first}${last}`.toLocaleUpperCase()
}

export interface AvatarProps {
  /** The person's name; the avatar shows its initials. */
  name: string
  size?: 'sm' | 'md'
  className?: string
}

/** A person's initials in a quiet disc. Decorative: the name next to it carries the meaning. */
export function Avatar({ name, size = 'sm', className }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center rounded-full bg-subtle font-semibold text-muted-foreground tracking-[0.02em]',
        size === 'sm' ? 'size-5 text-[9.5px]' : 'size-7 text-[11px]',
        className,
      )}
    >
      {initials(name)}
    </span>
  )
}
