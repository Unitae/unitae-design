import { describe, expect, it } from 'vitest'
import { hexColors } from '../src/index.ts'
import { MAP_ATTRIBUTION, MAP_FONTS, mapStyle } from '../src/map-style.ts'
import type { Mode } from '../src/tokens.ts'

const modes: Mode[] = ['light', 'dark']
const HEX = /#[0-9a-f]{6}\b/gi

const style = (mode: Mode, lang = 'fr') =>
  mapStyle({ mode, lang, tiles: '/tiles/2026-11/{z}/{x}/{y}.mvt', glyphs: '/map-fonts/{fontstack}/{range}.pbf' })

/** Every hex colour written anywhere in the layers' paint, expressions included. */
function paintColours(mode: Mode): Set<string> {
  const found = new Set<string>()
  for (const layer of style(mode).layers) {
    const paint = JSON.stringify('paint' in layer ? layer.paint : {})
    for (const hex of paint.match(HEX) ?? []) found.add(hex.toLowerCase())
  }
  return found
}

describe('mapStyle', () => {
  it('reads the tiles and the glyphs from the addresses it is given', () => {
    const s = style('light')
    expect(s.version).toBe(8)
    expect(s.glyphs).toBe('/map-fonts/{fontstack}/{range}.pbf')
    expect(Object.keys(s.sources)).toEqual(['protomaps'])
    expect(s.sources.protomaps).toMatchObject({
      type: 'vector',
      tiles: ['/tiles/2026-11/{z}/{x}/{y}.mvt'],
      maxzoom: 15,
    })
  })

  it('credits Protomaps and OpenStreetMap in the source', () => {
    const credit = style('light').sources.protomaps.attribution
    for (const { label, href } of MAP_ATTRIBUTION) {
      expect(credit).toContain(label)
      expect(credit).toContain(href)
    }
  })

  for (const mode of modes) {
    it(`${mode}: paints the ground with the map ground token`, () => {
      const background = style(mode).layers.find((layer) => layer.id === 'background')
      expect(background && 'paint' in background ? background.paint : null).toEqual({
        'background-color': hexColors[mode]['map-ground'],
      })
    })

    it(`${mode}: uses only the map tokens — no colour of its own`, () => {
      const allowed = new Set(
        Object.entries(hexColors[mode])
          .filter(([name]) => name.startsWith('map-'))
          .map(([, hex]) => hex),
      )
      for (const hex of paintColours(mode)) expect(allowed).toContain(hex)
    })
  }

  it('needs no sprite: no layer draws an icon', () => {
    const s = style('light')
    expect('sprite' in s).toBe(false)
    for (const layer of s.layers) {
      expect(JSON.stringify('layout' in layer ? layer.layout : {})).not.toContain('icon-image')
    }
  })

  it('leaves out places, shields, one-way arrows and house numbers: only our pins carry numbers', () => {
    const ids = style('light').layers.map((layer) => layer.id)
    for (const id of ['pois', 'roads_shields', 'roads_oneway', 'address_label']) expect(ids).not.toContain(id)
    expect(ids).toContain('roads_labels_minor')
    expect(ids).toContain('buildings')
  })

  it('sets every label in IBM Plex (Devanagari names keep the Noto face Protomaps asks for)', () => {
    const allowed = new Set([...Object.values(MAP_FONTS), 'Noto Sans Devanagari Regular v1'])
    const fonts = style('light')
      .layers.filter((layer) => layer.type === 'symbol')
      .flatMap((layer) => {
        const layout = 'layout' in layer && layer.layout ? layer.layout : {}
        const text = JSON.stringify([
          ('text-font' in layout && layout['text-font']) || [],
          'text-field' in layout ? layout['text-field'] : [],
        ])
        return text.match(/"[^"]*Sans[^"]*"/g) ?? []
      })
      .map((quoted) => JSON.parse(quoted) as string)
    expect(fonts).toContain(MAP_FONTS.regular)
    for (const font of fonts) expect(allowed).toContain(font)
  })

  it('names places in the language it is asked for', () => {
    expect(JSON.stringify(style('light', 'fr').layers)).toContain('name:fr')
    expect(JSON.stringify(style('light', 'uk').layers)).toContain('name:uk')
  })

  it('changes colours, not layers, between light and dark', () => {
    expect(style('dark').layers.map((layer) => layer.id)).toEqual(style('light').layers.map((layer) => layer.id))
    expect(paintColours('dark')).not.toEqual(paintColours('light'))
  })
})
