import { type ReactNode, useState } from 'react'
import { SegmentedControl } from './segmented-control.tsx'
import { cn } from './utils.ts'

export interface LegendItem {
  label: ReactNode
  /** CSS colour of the mark, e.g. `seriesColor(0)`. */
  color: string
  /** `line` for line series, `swatch` (default) for bars and areas — the legend mirrors the mark. */
  shape?: 'swatch' | 'line'
}

export function ChartLegend({ items, className }: { items: LegendItem[]; className?: string }) {
  return (
    <ul className={cn('flex flex-wrap gap-x-3.5 gap-y-1.5 text-muted-foreground text-sm', className)}>
      {items.map((item, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: legend order is the series order
        <li key={i} className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className={item.shape === 'line' ? 'h-0.5 w-3.5 rounded-full' : 'size-2.5 rounded-[2px]'}
            style={{ background: item.color }}
          />
          {item.label}
        </li>
      ))}
    </ul>
  )
}

export interface ChartTableColumn {
  key: string
  label: ReactNode
  /** Right-aligned, tabular figures. */
  numeric?: boolean
}

export interface ChartTableData {
  columns: ChartTableColumn[]
  rows: Record<string, ReactNode>[]
}

/** The accessible twin of a chart: every value readable without hovering. */
export function ChartTable({ columns, rows, className }: ChartTableData & { className?: string }) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={cn(
                  'h-8 border-border border-b px-2 font-medium text-faint',
                  c.numeric ? 'text-right' : 'text-left',
                )}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: rows follow the chart's data order
            <tr key={i}>
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={cn(
                    'h-8 whitespace-nowrap border-border border-b px-2',
                    c.numeric ? 'text-right tabular-nums' : 'text-left',
                  )}
                >
                  {row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export interface ChartCardProps {
  title: ReactNode
  subtitle?: ReactNode
  legend?: LegendItem[]
  /** When given, a Chart / Table switch appears and the table renders this data. */
  table?: ChartTableData
  /** Labels for the switch — required with `table` (the library ships no copy). */
  viewLabels?: { chart: string; table: string; group: string }
  /** Extra controls in the header, right-aligned. */
  actions?: ReactNode
  children: ReactNode
  className?: string
}

/** A chart in its card: title, optional legend, the chart, and its table view. */
export function ChartCard({
  title,
  subtitle,
  legend,
  table,
  viewLabels,
  actions,
  children,
  className,
}: ChartCardProps) {
  const [view, setView] = useState<'chart' | 'table'>('chart')
  const canToggle = table != null && viewLabels != null

  return (
    <section className={cn('flex min-w-0 flex-col gap-3.5 rounded-lg border border-border bg-card p-4', className)}>
      <header className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-base text-foreground leading-snug">{title}</h3>
          {subtitle != null && <p className="mt-0.5 text-faint text-sm">{subtitle}</p>}
        </div>
        {actions}
        {canToggle && (
          <SegmentedControl
            size="sm"
            aria-label={viewLabels.group}
            value={view}
            onValueChange={setView}
            options={[
              { value: 'chart', label: viewLabels.chart },
              { value: 'table', label: viewLabels.table },
            ]}
          />
        )}
      </header>
      {legend && legend.length > 0 && view === 'chart' && <ChartLegend items={legend} />}
      {view === 'table' && canToggle ? <ChartTable {...table} /> : children}
    </section>
  )
}

/** Shown in place of a chart when there is nothing to plot. */
export function ChartEmpty({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex min-h-32 items-center justify-center px-4 text-center text-faint text-sm', className)}>
      {children}
    </div>
  )
}
