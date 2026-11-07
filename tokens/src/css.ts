import { type ColorName, colorNames, colors, fonts, motion, radii, shadows } from './tokens.ts'

/**
 * Tailwind / shadcn colour names → Unitae tokens. These are the exact names the apps' components
 * already use (`bg-muted`, `text-muted-foreground`, `border-input`…), which is why importing
 * `theme.css` restyles existing markup without touching it.
 *
 * Traps worth remembering: shadcn's `accent` is the hover fill (not the brand colour) and
 * `muted-foreground` is secondary text, so it maps to the readable `fg-muted`, never `fg-faint`.
 */
export const themeColors: Record<string, ColorName> = {
  background: 'bg',
  foreground: 'fg',
  card: 'surface',
  'card-foreground': 'fg',
  popover: 'surface',
  'popover-foreground': 'fg',
  primary: 'primary',
  'primary-foreground': 'primary-fg',
  secondary: 'hover',
  'secondary-foreground': 'fg',
  muted: 'hover',
  'muted-foreground': 'fg-muted',
  accent: 'hover',
  'accent-foreground': 'fg',
  destructive: 'danger',
  'destructive-foreground': 'danger-fg',
  border: 'border',
  input: 'input',
  ring: 'ring',
  'chart-1': 'cat-1',
  'chart-2': 'cat-2',
  'chart-3': 'cat-3',
  'chart-4': 'cat-4',
  'chart-5': 'cat-5',
  'chart-6': 'cat-6',
  'chart-7': 'cat-7',
  'chart-8': 'cat-8',
  sidebar: 'subtle',
  'sidebar-foreground': 'fg',
  'sidebar-primary': 'primary',
  'sidebar-primary-foreground': 'primary-fg',
  'sidebar-accent': 'selected',
  'sidebar-accent-foreground': 'fg',
  'sidebar-border': 'border',
  'sidebar-ring': 'ring',
  // Unitae additions
  surface: 'surface',
  subtle: 'subtle',
  hover: 'hover',
  selected: 'selected',
  'border-strong': 'border-strong',
  faint: 'fg-faint',
  brand: 'accent',
  'brand-text': 'accent-text',
  'brand-soft': 'accent-soft',
  success: 'success',
  'success-text': 'success-text',
  'success-soft': 'success-soft',
  warning: 'warning',
  'warning-text': 'warning-text',
  'warning-soft': 'warning-soft',
  danger: 'danger',
  'danger-text': 'danger-text',
  'danger-soft': 'danger-soft',
  'chart-other': 'cat-other',
  'chart-muted': 'chart-muted',
  'chart-context': 'chart-context',
  'chart-grid': 'chart-grid',
  'chart-axis': 'chart-axis',
  'ink-on-chart-1': 'ink-on-cat-1',
  'ink-on-success': 'ink-on-success',
  'ink-on-warning': 'ink-on-warning',
  'ink-on-chart-other': 'ink-on-other',
  'seq-100': 'seq-100',
  'seq-150': 'seq-150',
  'seq-200': 'seq-200',
  'seq-250': 'seq-250',
  'seq-300': 'seq-300',
  'seq-350': 'seq-350',
  'seq-400': 'seq-400',
  'seq-450': 'seq-450',
  'seq-500': 'seq-500',
  'seq-550': 'seq-550',
  'seq-600': 'seq-600',
  'seq-650': 'seq-650',
  'seq-700': 'seq-700',
  'section-treasures': 'section-treasures',
  'section-ministry': 'section-ministry',
  'section-living': 'section-living',
}

function header(version: string, what: string): string {
  return `/* @unitae/tokens ${version} — ${what}\n   Generated from src/tokens.ts. Do not edit by hand. */\n`
}

function declarations(entries: [string, string][], indent = '  '): string {
  return entries.map(([name, value]) => `${indent}${name}: ${value};`).join('\n')
}

/** Raw tokens as `--u-*` custom properties: light on `:root`, dark on `.dark` / `[data-theme="dark"]`. */
export function tokensCss(version: string): string {
  const lightColors = colorNames.map((n): [string, string] => [`--u-${n}`, colors.light[n]])
  const darkColors = colorNames.map((n): [string, string] => [`--u-${n}`, colors.dark[n]])
  const lightShadows = Object.entries(shadows.light).map(([k, v]): [string, string] => [`--u-shadow-${k}`, v])
  const darkShadows = Object.entries(shadows.dark).map(([k, v]): [string, string] => [`--u-shadow-${k}`, v])
  const shared: [string, string][] = [
    ['--u-font-sans', fonts.sans],
    ['--u-font-mono', fonts.mono],
    ...Object.entries(radii).map(([k, v]): [string, string] => [k === 'base' ? '--u-radius' : `--u-radius-${k}`, v]),
    ['--u-duration-fast', motion.fast],
    ['--u-duration-slow', motion.slow],
    ['--u-ease', motion.ease],
  ]
  return `${header(version, 'raw tokens')}
:root {
  color-scheme: light;
${declarations([...lightColors, ...lightShadows, ...shared])}
}

.dark,
[data-theme="dark"] {
  color-scheme: dark;
${declarations([...darkColors, ...darkShadows])}
}
`
}

/** Tailwind v4 theme: maps the raw tokens onto utility names. `inline` keeps `.dark` switching working. */
export function themeCss(version: string): string {
  const colorEntries = Object.entries(themeColors).map(([name, token]): [string, string] => [
    `--color-${name}`,
    `var(--u-${token})`,
  ])
  const radiusEntries = Object.keys(radii).map((k): [string, string] =>
    k === 'base' ? ['--radius', 'var(--u-radius)'] : [`--radius-${k}`, `var(--u-radius-${k})`],
  )
  const shadowEntries = Object.keys(shadows.light).map((k): [string, string] => [
    `--shadow-${k}`,
    `var(--u-shadow-${k})`,
  ])
  return `${header(version, 'Tailwind v4 theme')}
@import "./tokens.css";

@theme inline {
${declarations([
  ...colorEntries,
  ['--font-sans', 'var(--u-font-sans)'],
  ['--font-display', 'var(--u-font-sans)'],
  ['--font-mono', 'var(--u-font-mono)'],
  ...radiusEntries,
  ...shadowEntries,
  ['--ease-standard', 'var(--u-ease)'],
  ['--default-transition-duration', 'var(--u-duration-fast)'],
  ['--default-transition-timing-function', 'var(--u-ease)'],
])}
}
`
}

/** Optional element defaults: border colour, page colours, font smoothing, reduced motion. */
export function baseCss(version: string): string {
  return `${header(version, 'base element styles (optional)')}
@layer base {
  *,
  ::after,
  ::before,
  ::backdrop,
  ::file-selector-button {
    border-color: var(--u-border);
  }

  html {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    background-color: var(--u-bg);
    color: var(--u-fg);
    font-family: var(--u-font-sans);
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  ::before,
  ::after,
  ::backdrop {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
`
}

const fontWeights = ['400', '400-italic', '500', '600', '700'] as const

/** Self-hosted IBM Plex Sans (latin + latin-ext covers French) via the `@fontsource/ibm-plex-sans` peer. */
export function fontsCss(version: string): string {
  const imports = fontWeights.flatMap((w) => [
    `@import "@fontsource/ibm-plex-sans/latin-${w}.css";`,
    `@import "@fontsource/ibm-plex-sans/latin-ext-${w}.css";`,
  ])
  return `${header(version, 'IBM Plex Sans, self-hosted')}
${imports.join('\n')}
`
}
