import type { ReactNode } from 'react'
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { chartContext, chartMuted, cn, seriesColor } from './utils.ts'

const axisTick = { fill: 'var(--color-faint)', fontSize: 11 }
const gridStroke = 'var(--color-chart-grid)'
const axisStroke = 'var(--color-chart-axis)'

interface TooltipRow {
  key: string
  label: string
  value: string
  color: string
  shape: 'line' | 'swatch'
}

/** Values lead, series names follow; each row keyed by a short line or swatch in the series colour. */
function TooltipPanel({ title, rows }: { title?: ReactNode; rows: TooltipRow[] }) {
  return (
    <div className="rounded-md bg-popover px-2.5 py-2 text-popover-foreground text-xs shadow-lg ring-1 ring-border">
      {title != null && <div className="mb-1 text-faint">{title}</div>}
      <ul className="flex flex-col gap-1">
        {rows.map((row) => (
          <li key={row.key} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={row.shape === 'line' ? 'h-0.5 w-3 rounded-full' : 'size-2 rounded-[2px]'}
              style={{ background: row.color }}
            />
            <span className="font-semibold text-foreground text-sm tabular-nums">{row.value}</span>
            <span className="text-muted-foreground">{row.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export interface LineSeries {
  key: string
  label: string
  /** Defaults to the categorical colour for its position (context series excepted). */
  color?: string
  /** A comparison series drawn in grey behind the others (e.g. the previous year). */
  context?: boolean
  /** Wash the area under the line at 10 % — for the single series the chart is about. */
  area?: boolean
}

export interface LineChartProps {
  data: Record<string, string | number | null>[]
  xKey: string
  series: LineSeries[]
  height?: number
  yDomain?: [number, number]
  yTicks?: number[]
  formatValue?: (value: number) => string
  formatX?: (value: string) => string
  /** Print the last value of the first highlighted series at the end of its line. */
  endLabel?: boolean
  /** Room for the y-axis labels, in px. */
  yAxisWidth?: number
  'aria-label': string
  className?: string
}

/** Trends over time: 2 px lines, solid hairline grid, a crosshair tooltip listing every series. */
export function LineChart({
  data,
  xKey,
  series,
  height = 220,
  yDomain,
  yTicks,
  formatValue = (v) => String(v),
  formatX,
  endLabel = true,
  yAxisWidth = 52,
  className,
  ...rest
}: LineChartProps) {
  const last = data.length - 1
  const colorOf = (s: LineSeries, i: number) => s.color ?? (s.context ? chartContext : seriesColor(i))
  const highlighted = series.findIndex((s) => !s.context)
  const ordered = [...series.map((s, i) => ({ s, i }))].sort((a, b) => Number(!a.s.context) - Number(!b.s.context))

  return (
    <div role="img" aria-label={rest['aria-label']} className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          data={data}
          margin={{ top: 10, right: endLabel ? 56 : 12, bottom: 0, left: 0 }}
          accessibilityLayer={false}
        >
          <CartesianGrid vertical={false} stroke={gridStroke} />
          <XAxis
            dataKey={xKey}
            tickLine={false}
            axisLine={{ stroke: axisStroke }}
            tick={axisTick}
            tickFormatter={formatX}
            interval="preserveStartEnd"
            minTickGap={18}
          />
          <YAxis
            width={yAxisWidth}
            tickLine={false}
            axisLine={false}
            tick={axisTick}
            tickFormatter={formatValue}
            domain={yDomain}
            ticks={yTicks}
          />
          <Tooltip
            cursor={{ stroke: 'var(--color-faint)', strokeWidth: 1 }}
            isAnimationActive={false}
            content={(props) => {
              if (!props.active || !props.payload?.length) return null
              const rows = series.flatMap((s, i) => {
                const entry = props.payload?.find((p) => p.dataKey === s.key && p.type !== 'none')
                if (entry?.value == null) return []
                return [
                  {
                    key: s.key,
                    label: s.label,
                    value: formatValue(Number(entry.value)),
                    color: colorOf(s, i),
                    shape: 'line' as const,
                  },
                ]
              })
              const title = formatX ? formatX(String(props.label)) : props.label
              return <TooltipPanel title={title} rows={rows} />
            }}
          />
          {ordered.map(({ s, i }) =>
            s.area && !s.context ? (
              <Area
                key={`${s.key}-area`}
                type="linear"
                dataKey={s.key}
                stroke="none"
                fill={colorOf(s, i)}
                fillOpacity={0.1}
                tooltipType="none"
                activeDot={false}
                animationDuration={600}
              />
            ) : null,
          )}
          {ordered.map(({ s, i }) => (
            <Line
              key={s.key}
              type="linear"
              dataKey={s.key}
              name={s.label}
              stroke={colorOf(s, i)}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              animationDuration={600}
              dot={(p: { cx?: number; cy?: number; index?: number }) =>
                i === highlighted && p.index === last && p.cx != null && p.cy != null ? (
                  <circle
                    key="end"
                    cx={p.cx}
                    cy={p.cy}
                    r={4.5}
                    fill={colorOf(s, i)}
                    stroke="var(--color-surface)"
                    strokeWidth={2}
                  />
                ) : (
                  <g key={p.index} />
                )
              }
              activeDot={{ r: 4.5, stroke: 'var(--color-surface)', strokeWidth: 2 }}
              label={
                endLabel
                  ? (p) =>
                      p.index === last && p.value != null ? (
                        <text
                          key="end-label"
                          x={Number(p.x) + 9}
                          y={Number(p.y) + 4}
                          fontSize={12}
                          fontWeight={i === highlighted ? 600 : 400}
                          fill={i === highlighted ? 'var(--color-foreground)' : 'var(--color-faint)'}
                        >
                          {formatValue(Number(p.value))}
                        </text>
                      ) : (
                        <g key={p.index} />
                      )
                  : false
              }
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

export interface ColumnDatum {
  key: string
  label: string
  value: number
  /** Long label for the tooltip, e.g. « septembre 2026 » when the axis shows « sept. ». */
  title?: string
}

export interface ColumnChartProps {
  data: ColumnDatum[]
  /** The period the chart is about, drawn in the accent; the rest is context. `none` colours every bar. */
  highlight?: 'last' | 'none' | number
  height?: number
  yTicks?: number[]
  formatValue?: (value: number) => string
  /** Tooltip value text; defaults to `formatValue`. */
  formatTooltip?: (value: number) => string
  /** Room for the y-axis labels, in px. */
  yAxisWidth?: number
  'aria-label': string
  className?: string
}

/** Magnitudes per period: thin columns (≤ 24 px), rounded data end, square on the baseline. */
export function ColumnChart({
  data,
  highlight = 'last',
  height = 200,
  yTicks,
  formatValue = (v) => String(v),
  formatTooltip,
  yAxisWidth = 40,
  className,
  ...rest
}: ColumnChartProps) {
  const emphasised = highlight === 'last' ? data.length - 1 : highlight === 'none' ? -1 : highlight
  const fillOf = (i: number) => (emphasised === -1 || i === emphasised ? seriesColor(0) : chartMuted)

  return (
    <div role="img" aria-label={rest['aria-label']} className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 10, right: 8, bottom: 0, left: 0 }} accessibilityLayer={false}>
          <CartesianGrid vertical={false} stroke={gridStroke} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={{ stroke: axisStroke }}
            tick={axisTick}
            interval="preserveStartEnd"
            minTickGap={8}
          />
          <YAxis
            width={yAxisWidth}
            tickLine={false}
            axisLine={false}
            tick={axisTick}
            tickFormatter={formatValue}
            ticks={yTicks}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: 'var(--color-hover)' }}
            isAnimationActive={false}
            content={(props) => {
              if (!props.active || !props.payload?.length) return null
              const datum = props.payload[0]?.payload as ColumnDatum | undefined
              if (!datum) return null
              const index = data.indexOf(datum)
              return (
                <TooltipPanel
                  title={datum.title ?? datum.label}
                  rows={[
                    {
                      key: datum.key,
                      label: '',
                      value: (formatTooltip ?? formatValue)(datum.value),
                      color: fillOf(index),
                      shape: 'swatch',
                    },
                  ]}
                />
              )
            }}
          />
          <Bar dataKey="value" maxBarSize={24} radius={[4, 4, 0, 0]} animationDuration={500}>
            {data.map((d, i) => (
              <Cell key={d.key} fill={fillOf(i)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
