/**
 * The Unitae map style: Protomaps vector tiles painted with the map tokens, labels in IBM Plex.
 *
 * A quiet grey ground for our pins: no places, shops, transport, shields or one-way arrows, and no house numbers —
 * the pins already carry the numbers the lists show, and a second set of numbers would confuse. Nothing draws an
 * icon, so the style needs no sprite. Light and dark change colours, never layers.
 *
 * Needs the optional peer `@protomaps/basemaps`. Import it from `@unitae/tokens/map-style`.
 */
import { type Flavor, layers } from '@protomaps/basemaps'
import { hexColors } from './index.ts'
import type { Mode } from './tokens.ts'

/** The glyph font stacks the style asks for. The host serves them under the `glyphs` address. */
export const MAP_FONTS = {
  regular: 'IBM Plex Sans Regular',
  medium: 'IBM Plex Sans Medium',
  italic: 'IBM Plex Sans Italic',
} as const

/** Who must be credited wherever the map shows: the tiles and the data under them. */
export const MAP_ATTRIBUTION = [
  { label: 'Protomaps', href: 'https://protomaps.com' },
  { label: '© OpenStreetMap', href: 'https://www.openstreetmap.org/copyright' },
] as const

/** Layers the quiet ground leaves out. Everything else of the Protomaps style is kept. */
const LEFT_OUT = new Set(['pois', 'roads_shields', 'roads_oneway', 'address_label'])

export interface MapStyleOptions {
  mode: Mode
  /** Tile address template, e.g. `/tiles/2026-11/{z}/{x}/{y}.mvt`. */
  tiles: string
  /** Glyph address template, e.g. `/map-fonts/{fontstack}/{range}.pbf`. */
  glyphs: string
  /** Language of the place names, as an ISO 639-1 code (`fr`, `en`, `uk`…). */
  lang: string
  /** The deepest zoom the tiles hold; the map enlarges them past it. Protomaps builds stop at 15. */
  maxzoom?: number
}

export type MapLayer = ReturnType<typeof layers>[number]

export interface MapStyle {
  version: 8
  name: string
  glyphs: string
  sources: {
    protomaps: { type: 'vector'; tiles: string[]; maxzoom: number; attribution: string }
  }
  layers: MapLayer[]
}

/** The Protomaps flavor, every one of its colours taken from a map token. */
function flavor(mode: Mode): Flavor {
  const c = hexColors[mode]
  const ground = c['map-ground']
  const landuse = c['map-landuse']
  const park = c['map-park']
  const road = c['map-road']
  const casing = c['map-road-casing']
  const label = c['map-label']
  const halo = c['map-label-halo']
  return {
    background: ground,
    earth: ground,
    park_a: park,
    park_b: park,
    hospital: landuse,
    industrial: landuse,
    school: landuse,
    wood_a: park,
    wood_b: park,
    pedestrian: landuse,
    scrub_a: park,
    scrub_b: park,
    glacier: landuse,
    sand: landuse,
    beach: landuse,
    aerodrome: landuse,
    runway: road,
    water: c['map-water'],
    zoo: park,
    military: landuse,
    // Tunnels: the street, without the casing that would draw it above ground.
    tunnel_other_casing: ground,
    tunnel_minor_casing: ground,
    tunnel_link_casing: ground,
    tunnel_major_casing: ground,
    tunnel_highway_casing: ground,
    tunnel_other: road,
    tunnel_minor: road,
    tunnel_link: road,
    tunnel_major: road,
    tunnel_highway: road,
    pier: landuse,
    buildings: c['map-building'],
    // Streets have no border; the main roads do.
    minor_service_casing: road,
    minor_casing: road,
    link_casing: casing,
    major_casing_late: casing,
    highway_casing_late: casing,
    other: road,
    minor_service: road,
    minor_a: road,
    minor_b: road,
    link: road,
    major_casing_early: casing,
    major: road,
    highway_casing_early: casing,
    highway: road,
    railway: c['map-rail'],
    boundaries: c['map-boundary'],
    bridges_other_casing: casing,
    bridges_minor_casing: casing,
    bridges_link_casing: casing,
    bridges_major_casing: casing,
    bridges_highway_casing: casing,
    bridges_other: road,
    bridges_minor: road,
    bridges_link: road,
    bridges_major: road,
    bridges_highway: road,
    roads_label_minor: label,
    roads_label_minor_halo: halo,
    roads_label_major: label,
    roads_label_major_halo: halo,
    ocean_label: label,
    subplace_label: label,
    subplace_label_halo: halo,
    city_label: label,
    city_label_halo: halo,
    state_label: label,
    state_label_halo: halo,
    country_label: label,
    address_label: label,
    address_label_halo: halo,
    regular: MAP_FONTS.regular,
    bold: MAP_FONTS.medium,
    italic: MAP_FONTS.italic,
    landcover: {
      barren: ground,
      farmland: ground,
      forest: park,
      glacier: landuse,
      grassland: park,
      scrub: park,
      urban_area: ground,
    },
  }
}

/** Drops the icon a layer would draw (the town dots below zoom 8), keeping its label: no sprite needed. */
function withoutIcon(layer: MapLayer): MapLayer {
  if (layer.type !== 'symbol' || layer.layout == null || !('icon-image' in layer.layout)) return layer
  const layout = Object.fromEntries(Object.entries(layer.layout).filter(([key]) => !key.startsWith('icon-')))
  return { ...layer, layout } as MapLayer
}

/** The MapLibre style for one theme. Rebuild it when the theme changes: the map follows Unitae, not the device. */
export function mapStyle({ mode, tiles, glyphs, lang, maxzoom = 15 }: MapStyleOptions): MapStyle {
  return {
    version: 8,
    name: `Unitae ${mode}`,
    glyphs,
    sources: {
      protomaps: {
        type: 'vector',
        tiles: [tiles],
        maxzoom,
        attribution: MAP_ATTRIBUTION.map(({ label, href }) => `<a href="${href}">${label}</a>`).join(' '),
      },
    },
    layers: layers('protomaps', flavor(mode), { lang })
      .filter((layer) => !LEFT_OUT.has(layer.id))
      .map(withoutIcon),
  }
}
