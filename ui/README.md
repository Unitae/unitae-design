# @unitae/ui

Unitae's React components, built on [`@unitae/tokens`](../tokens): stat tiles, a chart kit where every chart has a
table twin, status marks, avatars, a selection bar, a segmented control, form sections, panels and the brand mark.

The library carries **no copy**: every label is a prop, so apps translate with their own i18n. It never imports a
router (links are passed in), so it works in React Router 7 and 8 apps alike.

## Install

```sh
pnpm add @unitae/ui @unitae/tokens recharts
```

`recharts` is an optional peer, needed only for `LineChart` and `ColumnChart`.

Tell Tailwind v4 to read the classes the components use, next to the tokens import:

```css
@import "tailwindcss";
@import "@unitae/tokens/fonts.css";
@import "@unitae/tokens/theme.css";
@source "../node_modules/@unitae/ui/dist";
```

## Components

| Component                 | Use it for                                                                                                                                                                                |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `StatTile`, `MetricStrip` | Headline numbers in one bordered strip, separated by hairlines                                                                                                                            |
| `ChartCard`               | A chart with title, legend and a Chart / Table switch (`table` + `viewLabels`)                                                                                                            |
| `LineChart`               | Trends over time; `area` for the series the chart is about, `context` for a grey comparison                                                                                               |
| `ColumnChart`             | Magnitudes per period; one highlighted period over muted context, `stack`, `goal`, gaps                                                                                                   |
| `BarList`                 | Ranked horizontal bars, one hue; `other` for the folded tail                                                                                                                              |
| `SegmentedBar`            | One whole split in ≤ 6 parts; values print inside where they fit                                                                                                                          |
| `Sparkline`               | Tiny decorative columns beside a number; `goal` line, gaps for future / missing periods                                                                                                   |
| `ProgressBar`             | A share of a whole as a thin bar; decorative unless it gets an `aria-label`                                                                                                               |
| `ProgressRing`            | A share in a list column (« 5/7 »): a thin arc over a track, success once complete                                                                                                        |
| `PeriodStepper`           | Previous / next period around the current label; `renderLink` for the app's router                                                                                                        |
| `Status`, `StatusIcon`    | A state as shape + label (`success`, `warning`, `danger`, `neutral`)                                                                                                                      |
| `Tag`, `Kbd`              | Quiet attribute labels, keyboard hints                                                                                                                                                    |
| `Avatar`                  | A person's initials in a quiet disc, next to their name (`initials(name)` is exported too)                                                                                                |
| `SelectionBar`            | Floating actions on a list selection; announces the count, Escape clears                                                                                                                  |
| `SegmentedControl`        | 2–5 exclusive choices with a sliding indicator and arrow-key navigation; `null` = no choice                                                                                               |
| `FactList`                | Facts as label / value pairs in a `<dl>`; empty values left out, or `emptyLabel` for them                                                                                                 |
| `DateChip`                | A day as a small tile, month over day, beside a row that says the full date                                                                                                               |
| `FormSection`             | One part of a long form: title, kicker and actions left, fields right (`col-span-full`)                                                                                                   |
| `SaveBar`                 | A form's save actions at the bottom, with the unsaved-changes dot and an announced label                                                                                                  |
| `Panel`                   | A bordered block of a page: title and actions, rows edge to edge or `padded` fields, footer                                                                                               |
| `SectionHeading`          | The line above a block: title, quiet count, tag, actions; `collapsible` shows and hides it                                                                                                |
| `SidePanel`               | Edits the selected item beside the main column; sticky, Escape closes, focus goes back; `walk` steps through the list (« 3 sur 12 »); `actions` puts the item's own buttons in the header |
| `Callout`                 | A notice in the page (refused save, offline, trial): soft tint + status shape, one action                                                                                                 |
| `DateField`               | A date written with its weekday, typed in the reader's order or picked in a month calendar; native picker on touch                                                                        |
| `MapPin`                  | A place on a map, numbered like the list beside it; a button with hovered / selected states                                                                                               |
| `MapDot`                  | An entrance's state in a map editor: on, free, elsewhere, to add, to remove                                                                                                               |
| `MapCluster`              | Places too close to tell apart: a quiet disc with their count, a button that zooms in                                                                                                     |
| `MapControls`             | Zoom and « Recentrer » over the map; `MapControlGroup` / `MapControlButton` for more                                                                                                      |
| `MapCaption`, `MapCard`   | A line about the map (top left); a picked place's card (corner, or full width below 1280)                                                                                                 |
| `MapAttribution`          | The data credit, always visible bottom right (pass `MAP_ATTRIBUTION` from the tokens)                                                                                                     |
| `MapStatus`               | Loading or failed tiles, in the middle of the map's frame                                                                                                                                 |
| `SidebarFrame`, `NavGroup`, `NavItem`| The quiet column on the left: header, groups under their labels, entries with an icon and a shortcut on hover; links through `renderLink`                                                 |
| `TopbarRow`, `Breadcrumb` | The 48 px bar at the top of a page: the trail ending with the page itself, the page’s actions on the right                                                                                |
| `PageTitle`               | The title row: the h1, its facts and the controls that change what the page shows                                                                                                         |
| `QuickViews`              | A list’s quick views with their counts: the segmented control from the tablet up, chips that scroll on a phone                                                                            |
| `FilterButton`, `FilterChipBar`| The one « Filtres » button with its count (the popover stays the app’s), and the active filters as chips                                                                                  |
| `PaginationBar`           | Under a long list: where the reader is, and previous / next                                                                                                                               |
| `EmptyState`              | A list with nothing in it: one plain sentence and, when the reader can act, the action                                                                                                    |
| `ErrorState`              | An error drawn where the page would have been: code, title, what to do, the ways on                                                                                                       |
| `AuthFrame`               | The bare page outside an app’s shell: one narrow column with an emblem, the action as title, a footer                                                                                     |
| `Mark`, `Lockup`          | The Unitae mark, alone or with the wordmark                                                                                                                                               |

Helpers: `seriesColor(i)` (categorical colours in order, folded past eight), `chartMuted`, `chartContext`,
`chartOther`, `cn`.

## Maps

The map pieces know nothing of the map engine: place them as MapLibre markers (or absolutely inside the map's
frame) and wire their callbacks to the map. Build the map itself with `mapStyle` from `@unitae/tokens/map-style`: a
quiet grey ground on which these pieces are the only coloured things. The pins and the controls grow to 44 px on a
touch screen (`pointer: coarse`); the card leaves the attribution visible.

## Chart rules baked in

Thin marks (columns ≤ 24 px, 4 px rounded data end), 2 px lines with an end marker, solid hairline grid, tooltips that
lead with the value, one emphasised period, and a table view for every chart that carries data. See the chart rules in
the tokens README for colour use.

## Licence

MIT. The Unitae name and logo are not covered by this licence.
