# @unitae/tokens

The Unitae design tokens: colours (light and dark), type, radius, motion and chart palettes. Shipped as CSS
custom properties, a Tailwind v4 theme and a small JS API.

Every colour pair is checked in the test suite (WCAG AA for text, 3:1 for marks and focus rings), and the
categorical chart palette was validated against simulated colour-vision deficiency in both modes.

## Install

```sh
pnpm add @unitae/tokens @fontsource/ibm-plex-sans
```

`@fontsource/ibm-plex-sans` is an optional peer: add it if you use `fonts.css` (self-hosted IBM Plex Sans,
no third-party font CDN).

## Use with Tailwind v4

```css
@import "tailwindcss";
@import "@unitae/tokens/fonts.css";
@import "@unitae/tokens/theme.css";
@import "@unitae/tokens/base.css"; /* optional element defaults */

@custom-variant dark (&:is(.dark *));
```

Dark mode follows a `.dark` class (or `data-theme="dark"`) on an ancestor, usually `<html>`.

`theme.css` maps the tokens onto the colour names shadcn components already use (`bg-background`,
`text-muted-foreground`, `bg-accent`, `border-input`, `ring-ring`, `bg-sidebar-accent`, `chart-1`…), so
existing markup takes the Unitae look without edits.

### What the theme adds

| Utilities                                                                                        | Purpose                                     |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------- |
| `bg-surface`, `bg-subtle`, `bg-hover`, `bg-selected`, `border-border-strong`                     | Surfaces and states                         |
| `text-faint`                                                                                     | Tertiary text (still ≥ 4.5:1)               |
| `text-brand`, `text-brand-text`, `bg-brand-soft`                                                 | Petrol accent for icons, links, tints       |
| `bg-success` / `text-success-text` / `bg-success-soft` (also `warning`, `danger`)                | Status — always with an icon or a label     |
| `chart-1` … `chart-8`, `chart-other`, `chart-muted`, `chart-context`, `chart-grid`, `chart-axis` | Charts                                      |
| `seq-100` … `seq-700`                                                                            | Sequential petrol ramp (flips in dark mode) |
| `section-treasures`, `section-ministry`, `section-living`                                        | Meeting programme sections                  |

Also set by the theme:

- **Fonts** — `font-sans` is IBM Plex Sans; `font-display` is aliased to it so legacy display markup follows.
- **Radius** — one family: 6 px containers, 5 px controls. The Tailwind scale is deliberately remapped
  (`rounded-xl` → 6 px, `rounded-2xl` → 8 px) so existing markup adopts the new geometry; prefer
  `rounded-lg` / `rounded-md` in new code.
- **Motion** — every `transition` utility defaults to 120 ms with `cubic-bezier(0.2, 0, 0, 1)`;
  `ease-standard` is available, and `base.css` honours `prefers-reduced-motion`.
- **Shadows** — light by design: separate with borders, keep elevation for floating surfaces.

### Raw variables

Every token is also a `--u-*` custom property (`--u-accent`, `--u-cat-3`, `--u-duration-fast`…) for hand-written
CSS. They switch with dark mode automatically.

## Chart rules

- Assign `chart-1` … `chart-8` **in order** and never cycle: the order is what keeps neighbours distinguishable
  for colour-blind readers. Past eight series, fold the rest into `chart-other` or split the chart.
- Maps, scatter plots and small multiples: **three** categorical colours at most.
- In light mode `chart-3` (aqua) and `chart-4` (yellow) are below 3:1 on white — a chart using them must show
  direct labels or a table view.
- One series → one colour (`chart-1`), with `chart-muted` for context bars and `chart-1` for the highlighted period.
- Magnitude → the `seq-*` ramp; ordered buckets → `seq-350`, `seq-450`, `seq-550`, `seq-650`.
- Status colours mean good / warning / bad; never use them as "series 4".
- Labels inside a coloured fill use the matching `ink-on-*` colour; other text uses text colours, never the series colour.

## Map

The map is a quiet grey ground for the app's pins. Its colours are tokens like the others (`--u-map-ground`,
`hexColors.dark['map-label']`…), and `@unitae/tokens/map-style` turns them into a MapLibre style for
[Protomaps](https://protomaps.com) vector tiles:

```sh
pnpm add @protomaps/basemaps   # optional peer, needed only by map-style
```

```ts
import { MAP_ATTRIBUTION, MAP_FONTS, mapStyle } from '@unitae/tokens/map-style'

const style = mapStyle({
  mode: 'light', // rebuild it when the theme changes: the map follows the app, not the device
  tiles: '/tiles/2026-11/{z}/{x}/{y}.mvt', // your tile endpoint
  glyphs: '/map-fonts/{fontstack}/{range}.pbf', // where you serve the MAP_FONTS glyphs
  lang: 'fr',
})
```

- Only the pins wear colour: no places, shops, transport, shields, one-way arrows or house numbers (the pins
  already carry the numbers the lists show).
- Labels use the `MAP_FONTS` glyph stacks (IBM Plex Sans Regular, Medium, Italic); names written in Devanagari ask
  for `Noto Sans Devanagari Regular v1`, as Protomaps does.
- Nothing draws an icon, so the style needs no sprite.
- Credit `MAP_ATTRIBUTION` wherever the map shows: OpenStreetMap's licence wants it visible.
- The tests check, in both modes, that labels reach 4.5:1 on their halo (the ground), that a pin — primary in a
  ring of the surface — reaches 3:1, and that no map fill is more than a hint of colour.

## JS API

```ts
import { hexColors, cssVar, categorical, colors, contrast } from '@unitae/tokens'

hexColors.light.accent // '#186e86' — for react-pdf, e-mails, canvas
cssVar('cat-2') // 'var(--u-cat-2)' — follows light/dark in the DOM
categorical.dark // the eight chart colours stepped for dark surfaces
```

## Changing a token

Edit `src/tokens.ts` — never the generated CSS. Then:

```sh
pnpm test      # contrast and ramp rules; update snapshots with `pnpm vitest run -u` when the change is intended
pnpm build     # writes dist/
```

## Licence

MIT. The Unitae name and logo are not covered by this licence.
