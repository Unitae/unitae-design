import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import {
  Avatar,
  BarList,
  ChartCard,
  ColumnChart,
  FormSection,
  LineChart,
  Mark,
  MetricStrip,
  SaveBar,
  SegmentedBar,
  SegmentedControl,
  SelectionBar,
  StatTile,
  Status,
  seriesColor,
} from '../src/index.ts'

describe('seriesColor', () => {
  it('assigns the categorical colours in order and folds anything past eight into "other"', () => {
    expect(seriesColor(0)).toBe('var(--color-chart-1)')
    expect(seriesColor(7)).toBe('var(--color-chart-8)')
    expect(seriesColor(8)).toBe('var(--color-chart-other)')
  })
})

describe('Status', () => {
  it('shows its label next to a decorative shape', () => {
    const { container } = render(<Status tone="warning">En attente</Status>)
    expect(screen.getByText('En attente')).toBeTruthy()
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
  })
})

describe('Mark', () => {
  it('is decorative by default and named when given a title', () => {
    const { rerender, container } = render(<Mark />)
    expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe('true')
    rerender(<Mark title="Unitae" />)
    expect(screen.getByRole('img', { name: 'Unitae' })).toBeTruthy()
  })
})

describe('MetricStrip', () => {
  it('groups stat tiles under an accessible name', () => {
    render(
      <MetricStrip aria-label="Indicateurs">
        <StatTile label="Proclamateurs" value="86" foot="+2 depuis septembre" tone="positive" />
        <StatTile label="Territoires sortis" value="34" unit="/ 52" />
      </MetricStrip>,
    )
    const strip = screen.getByRole('region', { name: 'Indicateurs' })
    expect(within(strip).getByText('86')).toBeTruthy()
    expect(within(strip).getByText('/ 52')).toBeTruthy()
  })
})

function ControlledSegments({ initial = 'month' }: { initial?: 'week' | 'month' | 'year' | null }) {
  const [value, setValue] = useState<'week' | 'month' | 'year' | null>(initial)
  return (
    <SegmentedControl
      aria-label="Période"
      value={value}
      onValueChange={setValue}
      options={[
        { value: 'week', label: 'Semaine' },
        { value: 'month', label: 'Mois' },
        { value: 'year', label: 'Année' },
      ]}
    />
  )
}

describe('SegmentedControl', () => {
  it('marks the selected option and changes on click', () => {
    render(<ControlledSegments />)
    expect(screen.getByRole('button', { name: 'Mois' }).getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(screen.getByRole('button', { name: 'Année' }))
    expect(screen.getByRole('button', { name: 'Année' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('button', { name: 'Mois' }).getAttribute('aria-pressed')).toBe('false')
  })

  it('moves the selection with the arrow keys and wraps around', () => {
    render(<ControlledSegments />)
    fireEvent.keyDown(screen.getByRole('button', { name: 'Mois' }), { key: 'ArrowRight' })
    expect(screen.getByRole('button', { name: 'Année' }).getAttribute('aria-pressed')).toBe('true')
    fireEvent.keyDown(screen.getByRole('button', { name: 'Année' }), { key: 'ArrowRight' })
    expect(screen.getByRole('button', { name: 'Semaine' }).getAttribute('aria-pressed')).toBe('true')
  })

  it('can start with nothing chosen, still reachable by keyboard', () => {
    render(<ControlledSegments initial={null} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.map((button) => button.getAttribute('aria-pressed'))).toEqual(['false', 'false', 'false'])
    expect(buttons.map((button) => button.tabIndex)).toEqual([0, -1, -1])
    fireEvent.click(screen.getByRole('button', { name: 'Mois' }))
    expect(screen.getByRole('button', { name: 'Mois' }).getAttribute('aria-pressed')).toBe('true')
  })
})

describe('FormSection', () => {
  it('names the section after its title and keeps the kicker, description and actions beside the fields', () => {
    render(
      <FormSection
        kicker="Porte à porte"
        title="Entrée résidentielle"
        description="Comment entrer et combien de foyers visiter."
        actions={<button type="button">Supprimer cette entrée</button>}
      >
        <label>
          Nombre de logements
          <input />
        </label>
      </FormSection>,
    )
    const section = screen.getByRole('region', { name: 'Entrée résidentielle' })
    expect(within(section).getByRole('heading', { level: 2 }).textContent).toBe('Entrée résidentielle')
    expect(within(section).getByText('Porte à porte')).toBeTruthy()
    expect(within(section).getByText('Comment entrer et combien de foyers visiter.')).toBeTruthy()
    expect(within(section).getByRole('button', { name: 'Supprimer cette entrée' })).toBeTruthy()
    expect(within(section).getByRole('textbox', { name: 'Nombre de logements' })).toBeTruthy()
  })
})

describe('SaveBar', () => {
  it('names itself, announces what is unsaved and holds the actions', () => {
    render(
      <SaveBar aria-label="Enregistrement" label="3 modifications non enregistrées">
        <button type="button">Annuler</button>
        <button type="submit">Mettre à jour</button>
      </SaveBar>,
    )
    const bar = screen.getByRole('region', { name: 'Enregistrement' })
    expect(within(bar).getByText('3 modifications non enregistrées').getAttribute('aria-live')).toBe('polite')
    expect(within(bar).getByRole('button', { name: 'Annuler' })).toBeTruthy()
    expect(within(bar).getByRole('button', { name: 'Mettre à jour' })).toBeTruthy()
  })
})

describe('Avatar', () => {
  it('shows the first letters of the first and last names, accents kept, and stays decorative', () => {
    const { container, rerender } = render(<Avatar name="Élodie MARTIN" />)
    expect(container.textContent).toBe('ÉM')
    expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe('true')
    rerender(<Avatar name="  Marc  " />)
    expect(container.textContent).toBe('M')
  })
})

describe('SelectionBar', () => {
  it('names the toolbar, announces the count and clears from its button or Escape', () => {
    let cleared = 0
    render(
      <SelectionBar
        aria-label="Actions sur la sélection"
        label="2 sélectionnés"
        clearLabel="Vider la sélection"
        onClear={() => cleared++}
      >
        <button type="button">Changer de groupe</button>
      </SelectionBar>,
    )
    const toolbar = screen.getByRole('toolbar', { name: 'Actions sur la sélection' })
    expect(within(toolbar).getByText('2 sélectionnés').getAttribute('aria-live')).toBe('polite')
    fireEvent.click(within(toolbar).getByRole('button', { name: 'Vider la sélection' }))
    fireEvent.keyDown(within(toolbar).getByRole('button', { name: 'Changer de groupe' }), { key: 'Escape' })
    expect(cleared).toBe(2)
  })
})

describe('ChartCard', () => {
  const table = {
    columns: [
      { key: 'month', label: 'Mois' },
      { key: 'count', label: 'Attributions', numeric: true },
    ],
    rows: [
      { month: 'septembre', count: 14 },
      { month: 'octobre', count: 18 },
    ],
  }
  const viewLabels = { chart: 'Graphique', table: 'Tableau', group: 'Affichage' }

  it('switches between the chart and its table twin', () => {
    render(
      <ChartCard title="Attributions par mois" table={table} viewLabels={viewLabels}>
        <div>le graphique</div>
      </ChartCard>,
    )
    expect(screen.getByText('le graphique')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Tableau' }))
    expect(screen.queryByText('le graphique')).toBeNull()
    expect(screen.getByRole('table')).toBeTruthy()
    expect(screen.getByRole('cell', { name: '18' })).toBeTruthy()
  })

  it('offers no switch without a table', () => {
    render(
      <ChartCard title="Couverture">
        <div>le graphique</div>
      </ChartCard>,
    )
    expect(screen.queryByRole('group', { name: 'Affichage' })).toBeNull()
  })
})

describe('BarList', () => {
  it('lists every item with its value, the folded tail in the neutral colour', () => {
    render(
      <BarList
        aria-label="Commerces"
        items={[
          { key: 'food', label: 'Alimentaire', value: 38 },
          { key: 'rest', label: 'Autres commerces', value: 11, other: true },
        ]}
      />,
    )
    const list = screen.getByRole('list', { name: 'Commerces' })
    expect(within(list).getAllByRole('listitem')).toHaveLength(2)
    expect(within(list).getByText('38')).toBeTruthy()
    const tail = within(list).getByText('Autres commerces').parentElement?.querySelector('span > span')
    expect((tail as HTMLElement | null)?.style.background).toBe('var(--color-chart-other)')
  })
})

describe('SegmentedBar', () => {
  const parts = [
    { key: 'free', label: 'Disponible', value: 11, color: 'var(--color-success)' },
    { key: 'out', label: 'Sorti', value: 38, color: 'var(--color-chart-1)' },
    { key: 'late', label: 'En retard', value: 2, color: 'var(--color-warning)' },
  ]

  it('describes every part in its accessible name', () => {
    render(<SegmentedBar aria-label="État du territoire" parts={parts} />)
    expect(screen.getByRole('img', { name: 'État du territoire : Disponible 11, Sorti 38, En retard 2' })).toBeTruthy()
  })

  it('prints values only inside parts wide enough to hold them', () => {
    render(<SegmentedBar aria-label="État" parts={parts} showLegend={false} />)
    const bar = screen.getByRole('img')
    expect(within(bar).getByText('38')).toBeTruthy()
    expect(within(bar).queryByText('2')).toBeNull()
  })
})

describe('charts', () => {
  it('render under their accessible name', () => {
    render(
      <>
        <LineChart
          aria-label="Couverture cumulée"
          xKey="month"
          data={[
            { month: 'sept.', cur: 6 },
            { month: 'oct.', cur: 14 },
          ]}
          series={[{ key: 'cur', label: '2025/2026', area: true }]}
        />
        <ColumnChart
          aria-label="Attributions par mois"
          data={[
            { key: '2026-09', label: 'sept.', value: 14 },
            { key: '2026-10', label: 'oct.', value: 18 },
          ]}
        />
      </>,
    )
    expect(screen.getByRole('img', { name: 'Couverture cumulée' })).toBeTruthy()
    expect(screen.getByRole('img', { name: 'Attributions par mois' })).toBeTruthy()
  })
})

describe('package boundaries', () => {
  it('never imports a router, so React Router 7 and 8 apps can both use it', () => {
    const dir = join(import.meta.dirname, '..', 'src')
    for (const file of readdirSync(dir)) {
      expect(readFileSync(join(dir, file), 'utf8')).not.toMatch(/from ['"]react-router/)
    }
  })
})
