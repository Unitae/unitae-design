/**
 * Minimal colour math for the token pipeline: parse the two notations the tokens use
 * (`oklch(L C H [/ A])` and `#rrggbb`), convert to sRGB hex, and measure WCAG contrast.
 * No dependencies — the build and the tests both run on it.
 */

export interface Rgb {
  r: number
  g: number
  b: number
}

export interface Oklab {
  l: number
  a: number
  b: number
}

const OKLCH_PATTERN = /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*[\d.]+%?)?\s*\)$/
const HEX_PATTERN = /^#([0-9a-f]{6})$/i

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x))
}

function srgbEncode(x: number): number {
  const c = clamp01(x)
  return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055
}

function srgbDecode(x: number): number {
  return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
}

function oklabToLinearRgb({ l, a, b }: Oklab): Rgb {
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b
  const s_ = l - 0.0894841775 * a - 1.291485548 * b
  const l3 = l_ ** 3
  const m3 = m_ ** 3
  const s3 = s_ ** 3
  return {
    r: 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
    g: -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
    b: -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3,
  }
}

function linearRgbToOklab({ r, g, b }: Rgb): Oklab {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return {
    l: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  }
}

/** Gamma-encoded sRGB channels in [0, 1], gamut-clipped. */
export function toRgb(color: string): Rgb {
  const hex = HEX_PATTERN.exec(color.trim())
  if (hex) {
    const n = Number.parseInt(hex[1], 16)
    return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 }
  }
  const lch = OKLCH_PATTERN.exec(color.trim())
  if (lch) {
    const l = Number(lch[1]) / (lch[2] === '%' ? 100 : 1)
    const c = Number(lch[3])
    const h = (Number(lch[4]) * Math.PI) / 180
    const lin = oklabToLinearRgb({ l, a: c * Math.cos(h), b: c * Math.sin(h) })
    return { r: srgbEncode(lin.r), g: srgbEncode(lin.g), b: srgbEncode(lin.b) }
  }
  throw new Error(`Unsupported colour notation: ${color}`)
}

export function toHex(color: string): string {
  const { r, g, b } = toRgb(color)
  const byte = (x: number) =>
    Math.round(clamp01(x) * 255)
      .toString(16)
      .padStart(2, '0')
  return `#${byte(r)}${byte(g)}${byte(b)}`
}

/** Perceptual lightness (OKLab L, 0–1) of the colour as rendered in sRGB. */
export function lightness(color: string): number {
  const { r, g, b } = toRgb(color)
  return linearRgbToOklab({ r: srgbDecode(r), g: srgbDecode(g), b: srgbDecode(b) }).l
}

export function relativeLuminance(color: string): number {
  const { r, g, b } = toRgb(color)
  return 0.2126 * srgbDecode(r) + 0.7152 * srgbDecode(g) + 0.0722 * srgbDecode(b)
}

/** WCAG 2 contrast ratio between two colours (1–21). */
export function contrast(a: string, b: string): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}
