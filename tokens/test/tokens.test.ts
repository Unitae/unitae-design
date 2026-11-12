import { createRequire } from 'node:module'
import { describe, expect, it } from 'vitest'
import { chroma, contrast, lightness } from '../src/color.ts'
import { baseCss, fontsCss, themeColors, themeCss, tokensCss } from '../src/css.ts'
import { hexColors } from '../src/index.ts'
import { type ColorName, colorNames, colors, type Mode, ordinal, typeScale } from '../src/tokens.ts'

const modes: Mode[] = ['light', 'dark']
const HEX = /^#[0-9a-f]{6}$/

function ratio(mode: Mode, fg: ColorName, bg: ColorName): number {
  return contrast(colors[mode][fg], colors[mode][bg])
}

describe('palette shape', () => {
  it('defines every token in both modes', () => {
    for (const mode of modes) {
      expect(Object.keys(colors[mode]).sort()).toEqual([...colorNames].sort())
    }
  })

  it('converts every token to a valid hex value', () => {
    for (const mode of modes) {
      for (const name of colorNames) expect(hexColors[mode][name]).toMatch(HEX)
    }
  })
})

describe('text contrast (WCAG AA, 4.5:1)', () => {
  const surfaces: ColorName[] = ['bg', 'surface', 'subtle']
  const texts: ColorName[] = [
    'fg',
    'fg-muted',
    'fg-faint',
    'accent-text',
    'success-text',
    'warning-text',
    'danger-text',
  ]

  for (const mode of modes) {
    for (const text of texts) {
      for (const surface of surfaces) {
        it(`${mode}: ${text} on ${surface}`, () => {
          expect(ratio(mode, text, surface)).toBeGreaterThanOrEqual(4.5)
        })
      }
    }

    it(`${mode}: primary button label on primary and on its hover`, () => {
      expect(ratio(mode, 'primary-fg', 'primary')).toBeGreaterThanOrEqual(4.5)
      expect(ratio(mode, 'primary-fg', 'primary-hover')).toBeGreaterThanOrEqual(4.5)
    })

    it(`${mode}: destructive button label on danger`, () => {
      expect(ratio(mode, 'danger-fg', 'danger')).toBeGreaterThanOrEqual(4.5)
    })
  }
})

describe('non-text contrast (3:1)', () => {
  for (const mode of modes) {
    it(`${mode}: focus ring is visible on surfaces`, () => {
      expect(ratio(mode, 'ring', 'surface')).toBeGreaterThanOrEqual(3)
      expect(ratio(mode, 'ring', 'bg')).toBeGreaterThanOrEqual(3)
    })

    it(`${mode}: success and danger marks stand out from the surface`, () => {
      expect(ratio(mode, 'success', 'surface')).toBeGreaterThanOrEqual(3)
      expect(ratio(mode, 'danger', 'surface')).toBeGreaterThanOrEqual(3)
    })
  }

  // Light aqua (cat-3) and yellow (cat-4) sit below 3:1 on white by design: any chart that uses
  // them must show direct labels or its table view. Warning is the same, mitigated by icon + label.
  const lightExceptions = new Set<ColorName>(['cat-3', 'cat-4'])
  const cats = colorNames.filter((n) => /^cat-\d$/.test(n))
  for (const mode of modes) {
    for (const cat of cats) {
      if (mode === 'light' && lightExceptions.has(cat)) continue
      it(`${mode}: ${cat} mark on surface`, () => {
        expect(ratio(mode, cat, 'surface')).toBeGreaterThanOrEqual(3)
      })
    }
  }
})

describe('map', () => {
  // The map is a quiet ground for our pins: its labels must read, its fills must be told apart, and
  // nothing in it may compete with the accent the pins wear.
  const fills: ColorName[] = ['map-building', 'map-road', 'map-landuse', 'map-park', 'map-water', 'map-rail']

  for (const mode of modes) {
    it(`${mode}: labels read on their halo and on the ground (4.5:1)`, () => {
      expect(ratio(mode, 'map-label', 'map-label-halo')).toBeGreaterThanOrEqual(4.5)
      expect(ratio(mode, 'map-label', 'map-ground')).toBeGreaterThanOrEqual(4.5)
    })

    it(`${mode}: the halo is the ground, so a label never draws a box`, () => {
      expect(hexColors[mode]['map-label-halo']).toBe(hexColors[mode]['map-ground'])
    })

    it(`${mode}: every fill differs from the ground`, () => {
      for (const fill of fills) expect(hexColors[mode][fill]).not.toBe(hexColors[mode]['map-ground'])
    })

    it(`${mode}: streets stand out from the ground`, () => {
      expect(ratio(mode, 'map-road', 'map-ground')).toBeGreaterThanOrEqual(1.1)
    })

    // A pin is primary inside a ring of the surface colour: whatever fill it lands on, its edge is that ring.
    it(`${mode}: a pin (primary, ringed with the surface) stands out from its ring and from the ground (3:1)`, () => {
      expect(ratio(mode, 'primary', 'surface')).toBeGreaterThanOrEqual(3)
      expect(ratio(mode, 'primary', 'map-ground')).toBeGreaterThanOrEqual(3)
    })

    it(`${mode}: a free entrance's dashed ring stands out from the ground (3:1)`, () => {
      // MapDot « free »: a dashed ring in the faint grey (light) or the muted grey (dark), over the map's ground.
      const ring = mode === 'light' ? colors.light['fg-faint'] : colors.dark['fg-muted']
      expect(contrast(ring, colors[mode]['map-ground'])).toBeGreaterThanOrEqual(3)
    })

    it(`${mode}: the map stays grey — no fill is more colourful than a hint`, () => {
      for (const fill of ['map-ground', ...fills] as ColorName[]) {
        expect(chroma(colors[mode][fill])).toBeLessThan(0.03)
      }
    })
  }
})

describe('labels inside chart fills', () => {
  const pairs: [ColorName, ColorName][] = [
    ['ink-on-cat-1', 'cat-1'],
    ['ink-on-success', 'success'],
    ['ink-on-warning', 'warning'],
    ['ink-on-other', 'cat-other'],
  ]
  for (const mode of modes) {
    for (const [ink, fill] of pairs) {
      it(`${mode}: ${ink} is the more readable of white / near-black on ${fill}`, () => {
        const chosen = ratio(mode, ink, fill)
        const white = contrast('#ffffff', colors[mode][fill])
        const black = contrast('#1a1b1e', colors[mode][fill])
        expect(chosen).toBeGreaterThanOrEqual(Math.max(white, black) - 0.15)
        expect(chosen).toBeGreaterThanOrEqual(3)
      })
    }
  }
})

describe('sequential and ordinal ramps', () => {
  const steps = colorNames.filter((n) => n.startsWith('seq-'))

  it('light ramp darkens step after step', () => {
    const ls = steps.map((s) => lightness(colors.light[s]))
    for (let i = 1; i < ls.length; i++) expect(ls[i]).toBeLessThan(ls[i - 1])
  })

  it('dark ramp lightens step after step (dark means "a little")', () => {
    const ls = steps.map((s) => lightness(colors.dark[s]))
    for (let i = 1; i < ls.length; i++) expect(ls[i]).toBeGreaterThan(ls[i - 1])
  })

  it('ordinal steps are far enough apart and the light end still reads on white', () => {
    const ls = ordinal.map((s) => lightness(colors.light[s]))
    for (let i = 1; i < ls.length; i++) expect(ls[i - 1] - ls[i]).toBeGreaterThanOrEqual(0.06)
    expect(ratio('light', ordinal[0], 'surface')).toBeGreaterThanOrEqual(2)
  })
})

describe('Tailwind theme', () => {
  // Every semantic utility name the apps use today must exist, or their markup loses its colour.
  const usedByApps = [
    'background',
    'foreground',
    'card',
    'card-foreground',
    'popover',
    'popover-foreground',
    'primary',
    'primary-foreground',
    'secondary',
    'secondary-foreground',
    'muted',
    'muted-foreground',
    'accent',
    'accent-foreground',
    'destructive',
    'destructive-foreground',
    'border',
    'input',
    'ring',
    'chart-1',
    'chart-2',
    'chart-3',
    'chart-4',
    'chart-5',
    'sidebar',
    'sidebar-foreground',
    'sidebar-primary',
    'sidebar-primary-foreground',
    'sidebar-accent',
    'sidebar-accent-foreground',
    'sidebar-border',
    'sidebar-ring',
    'section-treasures',
    'section-ministry',
    'section-living',
  ]

  it('maps every shadcn and app colour name the apps rely on', () => {
    for (const name of usedByApps) expect(themeColors).toHaveProperty(name)
  })

  it('maps secondary text to the readable grey, never the faint one', () => {
    expect(themeColors['muted-foreground']).toBe('fg-muted')
  })

  it('references only declared tokens', () => {
    for (const token of Object.values(themeColors)) expect(colorNames).toContain(token)
  })

  it('aliases the display font to the UI sans so legacy font-display markup follows the rebrand', () => {
    expect(themeCss('0.0.0')).toContain('--font-display: var(--u-font-sans);')
  })
})

describe('type scale', () => {
  // Round 1 set the density at a 14 px body; the canvas tokens of direction D draw a 24 px page title, 15 px section
  // titles and 26 px headline numbers. The apps' own text-xs / sm / base keep their Tailwind sizes.
  const px = (rem: string) => Number.parseFloat(rem) * 16

  it('sets the body at 14 px, the page title at 24, section titles at 15 and headline numbers at 26', () => {
    expect(px(typeScale.body.size)).toBe(14)
    expect(px(typeScale.h1.size)).toBe(24)
    expect(px(typeScale.h2.size)).toBe(15)
    expect(px(typeScale.metric.size)).toBe(26)
  })

  it('gives every step a line height at least as tall as its size', () => {
    for (const step of Object.values(typeScale)) expect(px(step.lineHeight)).toBeGreaterThanOrEqual(px(step.size))
  })

  it('maps each step onto a Tailwind text utility with its line height, and its weight where it has one', () => {
    const theme = themeCss('0.0.0')
    for (const [name, step] of Object.entries(typeScale)) {
      expect(theme).toContain(`--text-${name}: var(--u-text-${name});`)
      expect(theme).toContain(`--text-${name}--line-height: var(--u-text-${name}-line-height);`)
      if ('weight' in step) expect(theme).toContain(`--text-${name}--font-weight: var(--u-text-${name}-weight);`)
    }
  })

  it('leaves Tailwind’s own text sizes alone, so existing markup keeps its size', () => {
    const theme = themeCss('0.0.0')
    for (const name of ['xs', 'sm', 'base', 'lg', 'xl']) expect(theme).not.toContain(`--text-${name}:`)
  })

  it('sets the body size in the optional element defaults', () => {
    expect(baseCss('0.0.0')).toContain('font-size: var(--u-text-body);')
  })
})

describe('fonts', () => {
  it('imports only files that exist in @fontsource/ibm-plex-sans', () => {
    const require = createRequire(import.meta.url)
    const specifiers = [...fontsCss('0.0.0').matchAll(/@import "([^"]+)";/g)].map((m) => m[1])
    expect(specifiers.length).toBeGreaterThan(0)
    for (const specifier of specifiers) expect(() => require.resolve(specifier)).not.toThrow()
  })
})

describe('generated CSS', () => {
  it('tokens.css', () => {
    expect(tokensCss('0.0.0')).toMatchSnapshot()
  })
  it('theme.css', () => {
    expect(themeCss('0.0.0')).toMatchSnapshot()
  })
  it('base.css', () => {
    expect(baseCss('0.0.0')).toMatchSnapshot()
  })
})
