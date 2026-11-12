/**
 * Unitae design tokens — the single source of truth.
 *
 * Every value here was validated during the 2026 rebrand: text pairs against WCAG AA, the
 * categorical chart palette against simulated colour-vision deficiency (protan/deutan), in both
 * modes. The tests in `test/` re-check the contrast and ramp rules on every change.
 *
 * Edit this file, never the generated CSS in `dist/`.
 */

export const colorNames = [
  // Surfaces
  'bg',
  'surface',
  'subtle',
  'hover',
  'selected',
  'border',
  'border-strong',
  'input',
  // Text
  'fg',
  'fg-muted',
  'fg-faint',
  // Brand
  'accent',
  'accent-text',
  'accent-soft',
  'primary',
  'primary-hover',
  'primary-fg',
  'ring',
  // Status — always paired with a shape or a label, never colour alone
  'success',
  'success-text',
  'success-soft',
  'warning',
  'warning-text',
  'warning-soft',
  'danger',
  'danger-text',
  'danger-soft',
  'danger-fg',
  // Charts — categorical order is the colour-blind safety mechanism: assign in order, never cycle
  'cat-1',
  'cat-2',
  'cat-3',
  'cat-4',
  'cat-5',
  'cat-6',
  'cat-7',
  'cat-8',
  'cat-other',
  'chart-muted',
  'chart-context',
  'chart-grid',
  'chart-axis',
  // Label ink inside a coloured chart fill, chosen by the fill's luminance
  'ink-on-cat-1',
  'ink-on-success',
  'ink-on-warning',
  'ink-on-other',
  // Sequential petrol ramp: one hue, "a little" → "a lot". Flips in dark mode.
  'seq-100',
  'seq-150',
  'seq-200',
  'seq-250',
  'seq-300',
  'seq-350',
  'seq-400',
  'seq-450',
  'seq-500',
  'seq-550',
  'seq-600',
  'seq-650',
  'seq-700',
  // Meeting programme sections (Vie et ministère workbook)
  'section-treasures',
  'section-ministry',
  'section-living',
  // Map: a quiet grey ground for the pins. Only the pins wear colour; labels sit on a halo of the ground.
  'map-ground',
  'map-building',
  'map-road',
  'map-road-casing',
  'map-landuse',
  'map-park',
  'map-water',
  'map-rail',
  'map-boundary',
  'map-label',
  'map-label-halo',
] as const

export type ColorName = (typeof colorNames)[number]
export type Mode = 'light' | 'dark'
export type ColorScale = Record<ColorName, string>

const light: ColorScale = {
  bg: 'oklch(0.985 0.002 265)',
  surface: 'oklch(1 0 0)',
  subtle: 'oklch(0.968 0.003 265)',
  hover: 'oklch(0.948 0.004 265)',
  selected: 'oklch(0.925 0.008 250)',
  border: 'oklch(0.912 0.004 265)',
  'border-strong': 'oklch(0.86 0.006 265)',
  input: 'oklch(0.88 0.005 265)',

  fg: 'oklch(0.23 0.012 265)',
  'fg-muted': 'oklch(0.44 0.012 265)',
  'fg-faint': 'oklch(0.52 0.01 265)',

  accent: 'oklch(0.5 0.085 222)',
  'accent-text': 'oklch(0.46 0.085 222)',
  'accent-soft': 'oklch(0.95 0.022 222)',
  primary: 'oklch(0.5 0.085 222)',
  'primary-hover': 'oklch(0.45 0.085 222)',
  'primary-fg': 'oklch(0.99 0 0)',
  ring: 'oklch(0.6 0.09 222)',

  success: 'oklch(0.58 0.13 158)',
  'success-text': 'oklch(0.47 0.12 158)',
  'success-soft': 'oklch(0.96 0.03 158)',
  warning: 'oklch(0.72 0.14 70)',
  'warning-text': 'oklch(0.5 0.11 65)',
  'warning-soft': 'oklch(0.96 0.04 75)',
  danger: 'oklch(0.56 0.19 27)',
  'danger-text': 'oklch(0.5 0.19 27)',
  'danger-soft': 'oklch(0.96 0.03 27)',
  'danger-fg': 'oklch(0.99 0 0)',

  'cat-1': '#0083a7',
  'cat-2': '#e06c23',
  'cat-3': '#23b189',
  'cat-4': '#e5a323',
  'cat-5': '#d76797',
  'cat-6': '#36822f',
  'cat-7': '#6a57c1',
  'cat-8': '#d33b36',
  'cat-other': '#cbd2d9',
  'chart-muted': 'oklch(0.84 0.03 222)',
  'chart-context': '#a7afb8',
  'chart-grid': '#e6e8eb',
  'chart-axis': '#c8cace',

  'ink-on-cat-1': '#ffffff',
  'ink-on-success': 'oklch(0.2 0 0)',
  'ink-on-warning': 'oklch(0.2 0 0)',
  'ink-on-other': 'oklch(0.2 0 0)',

  'seq-100': '#dff4fd',
  'seq-150': '#c7e9f7',
  'seq-200': '#acdbee',
  'seq-250': '#8dcae1',
  'seq-300': '#6db8d4',
  'seq-350': '#4ba7c7',
  'seq-400': '#2495b8',
  'seq-450': '#0083a7',
  'seq-500': '#007193',
  'seq-550': '#00607e',
  'seq-600': '#00516a',
  'seq-650': '#004257',
  'seq-700': '#003445',

  'section-treasures': '#5b6770',
  'section-ministry': '#c18626',
  'section-living': '#942926',

  'map-ground': '#eef1f4',
  'map-building': '#d9dee4',
  'map-road': '#ffffff',
  'map-road-casing': '#d3d9df',
  'map-landuse': '#e3e7eb',
  'map-park': '#e1ebe4',
  'map-water': '#d8e4ed',
  'map-rail': '#c3c9d0',
  'map-boundary': '#aab1ba',
  'map-label': '#5f6872',
  'map-label-halo': '#eef1f4',
}

const dark: ColorScale = {
  bg: '#0d0e11',
  surface: '#16171a',
  subtle: '#111315',
  hover: '#202226',
  selected: 'oklch(0.29 0.03 230)',
  border: '#282a2e',
  'border-strong': 'oklch(0.37 0.01 265)',
  input: 'oklch(0.34 0.01 265)',

  fg: '#eaebee',
  'fg-muted': '#aeb1b6',
  'fg-faint': '#8f9299',

  accent: '#52acc9',
  'accent-text': '#74c1db',
  'accent-soft': 'oklch(0.3 0.045 222)',
  primary: '#1e809c',
  'primary-hover': 'oklch(0.51 0.095 222)',
  'primary-fg': '#ffffff',
  ring: 'oklch(0.7 0.095 222)',

  success: '#42b079',
  'success-text': '#6bcb97',
  'success-soft': 'oklch(0.3 0.05 158)',
  warning: '#ebae51',
  'warning-text': '#f1bd73',
  'warning-soft': 'oklch(0.32 0.05 75)',
  danger: '#e86156',
  'danger-text': '#fa887d',
  'danger-soft': 'oklch(0.3 0.06 27)',
  'danger-fg': 'oklch(0.17 0.01 265)',

  'cat-1': '#0a80a3',
  'cat-2': '#d56326',
  'cat-3': '#3baa73',
  'cat-4': '#c38300',
  'cat-5': '#c65085',
  'cat-6': '#3c8836',
  'cat-7': '#8376d5',
  'cat-8': '#da534f',
  'cat-other': 'oklch(0.45 0.01 250)',
  'chart-muted': 'oklch(0.45 0.035 222)',
  'chart-context': '#656970',
  'chart-grid': '#24262a',
  'chart-axis': '#3a3d42',

  'ink-on-cat-1': '#ffffff',
  'ink-on-success': 'oklch(0.17 0.01 265)',
  'ink-on-warning': 'oklch(0.17 0.01 265)',
  'ink-on-other': '#ffffff',

  'seq-100': '#152a31',
  'seq-150': '#17353f',
  'seq-200': '#19404e',
  'seq-250': '#1c4f60',
  'seq-300': '#185e74',
  'seq-350': '#1b6d87',
  'seq-400': '#1d7d9a',
  'seq-450': '#298dac',
  'seq-500': '#3c9cbc',
  'seq-550': '#54abca',
  'seq-600': '#6ebad6',
  'seq-650': '#87c9e2',
  'seq-700': '#a4d7eb',

  'section-treasures': '#8d99a3',
  'section-ministry': '#d9a043',
  'section-living': '#cf5a55',

  'map-ground': '#1b1d21',
  'map-building': '#2a2d33',
  'map-road': '#2e3137',
  'map-road-casing': '#15171a',
  'map-landuse': '#222429',
  'map-park': '#1b2520',
  'map-water': '#17212a',
  'map-rail': '#3a3e45',
  'map-boundary': '#4d535b',
  'map-label': '#9aa1aa',
  'map-label-halo': '#1b1d21',
}

export const colors: Record<Mode, ColorScale> = { light, dark }

/** Categorical chart order, light then dark — the same eight hues stepped per surface. */
export const categorical: Record<Mode, readonly string[]> = {
  light: [
    light['cat-1'],
    light['cat-2'],
    light['cat-3'],
    light['cat-4'],
    light['cat-5'],
    light['cat-6'],
    light['cat-7'],
    light['cat-8'],
  ],
  dark: [
    dark['cat-1'],
    dark['cat-2'],
    dark['cat-3'],
    dark['cat-4'],
    dark['cat-5'],
    dark['cat-6'],
    dark['cat-7'],
    dark['cat-8'],
  ],
}

/** Ordinal 4-step ramp (ordered buckets such as "time since last worked"). */
export const ordinal = ['seq-350', 'seq-450', 'seq-550', 'seq-650'] as const satisfies readonly ColorName[]

export const shadows: Record<Mode, Record<'2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl', string>> = {
  light: {
    '2xs': '0 1px 1px oklch(0.25 0.02 265 / 0.04)',
    xs: '0 1px 2px oklch(0.25 0.02 265 / 0.05)',
    sm: '0 1px 2px oklch(0.25 0.02 265 / 0.06), 0 1px 3px oklch(0.25 0.02 265 / 0.04)',
    md: '0 4px 12px -4px oklch(0.25 0.02 265 / 0.14)',
    lg: '0 12px 32px -10px oklch(0.25 0.02 265 / 0.22)',
    xl: '0 20px 48px -12px oklch(0.25 0.02 265 / 0.28)',
    '2xl': '0 28px 64px -16px oklch(0.25 0.02 265 / 0.32)',
  },
  dark: {
    '2xs': '0 1px 1px oklch(0 0 0 / 0.3)',
    xs: '0 1px 2px oklch(0 0 0 / 0.35)',
    sm: '0 1px 2px oklch(0 0 0 / 0.4), 0 1px 3px oklch(0 0 0 / 0.3)',
    md: '0 4px 12px -4px oklch(0 0 0 / 0.5)',
    lg: '0 12px 32px -10px oklch(0 0 0 / 0.6)',
    xl: '0 20px 48px -12px oklch(0 0 0 / 0.7)',
    '2xl': '0 28px 64px -16px oklch(0 0 0 / 0.75)',
  },
}

export const fonts = {
  sans: '"IBM Plex Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
  mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
} as const

/**
 * One radius family: 6 px containers, 5 px controls.
 * The Tailwind scale is deliberately remapped (`rounded-xl` and `rounded-2xl` land at 6–8 px)
 * so existing markup adopts the new geometry without edits. Clean those classes up over time.
 */
export const radii = {
  base: '6px',
  xs: '3px',
  sm: '4px',
  md: '5px',
  lg: '6px',
  xl: '6px',
  '2xl': '8px',
  '3xl': '10px',
} as const

/** Motion: fast and keyboard-like. Respect `prefers-reduced-motion` (see base.css). */
export const motion = {
  fast: '120ms',
  slow: '240ms',
  ease: 'cubic-bezier(0.2, 0, 0, 1)',
} as const
