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

| Component                 | Use it for                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------- |
| `StatTile`, `MetricStrip` | Headline numbers in one bordered strip, separated by hairlines                              |
| `ChartCard`               | A chart with title, legend and a Chart / Table switch (`table` + `viewLabels`)              |
| `LineChart`               | Trends over time; `area` for the series the chart is about, `context` for a grey comparison |
| `ColumnChart`             | Magnitudes per period; one highlighted period over muted context                            |
| `BarList`                 | Ranked horizontal bars, one hue; `other` for the folded tail                                |
| `SegmentedBar`            | One whole split in ≤ 6 parts; values print inside where they fit                            |
| `Status`, `StatusIcon`    | A state as shape + label (`success`, `warning`, `danger`, `neutral`)                        |
| `Tag`, `Kbd`              | Quiet attribute labels, keyboard hints                                                      |
| `Avatar`                  | A person's initials in a quiet disc, next to their name (`initials(name)` is exported too)  |
| `SelectionBar`            | Floating actions on a list selection; announces the count, Escape clears                    |
| `SegmentedControl`        | 2–5 exclusive choices with a sliding indicator and arrow-key navigation; `null` = no choice |
| `FormSection`             | One part of a long form: title, kicker and actions left, fields right (`col-span-full`)     |
| `SaveBar`                 | A form's save actions at the bottom, with the unsaved-changes dot and an announced label    |
| `Panel`                   | A bordered block of a page: title and actions, rows edge to edge or `padded` fields, footer |
| `SidePanel`               | Edits the selected item beside the main column; sticky, Escape closes, focus goes back      |
| `Mark`, `Lockup`          | The Unitae mark, alone or with the wordmark                                                 |

Helpers: `seriesColor(i)` (categorical colours in order, folded past eight), `chartMuted`, `chartContext`,
`chartOther`, `cn`.

## Chart rules baked in

Thin marks (columns ≤ 24 px, 4 px rounded data end), 2 px lines with an end marker, solid hairline grid, tooltips that
lead with the value, one emphasised period, and a table view for every chart that carries data. See the chart rules in
the tokens README for colour use.

## Licence

MIT. The Unitae name and logo are not covered by this licence.
