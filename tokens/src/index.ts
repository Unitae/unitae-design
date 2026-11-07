import { toHex } from './color.ts'
import { type ColorName, type ColorScale, colorNames, colors, type Mode } from './tokens.ts'

export { contrast, lightness, toHex } from './color.ts'
export type { ColorName, ColorScale, Mode } from './tokens.ts'
export { categorical, colorNames, colors, fonts, motion, ordinal, radii, shadows } from './tokens.ts'

function toHexScale(scale: ColorScale): ColorScale {
  const out = {} as ColorScale
  for (const name of colorNames) out[name] = toHex(scale[name])
  return out
}

/**
 * The same palette as sRGB hex, for consumers that cannot read CSS variables:
 * react-pdf documents, e-mails, canvas, chart libraries configured in JS.
 */
export const hexColors: Record<Mode, ColorScale> = {
  light: toHexScale(colors.light),
  dark: toHexScale(colors.dark),
}

/** A CSS reference to a token, e.g. `cssVar('accent')` → `var(--u-accent)`. Follows light/dark automatically. */
export function cssVar(name: ColorName): string {
  return `var(--u-${name})`
}
