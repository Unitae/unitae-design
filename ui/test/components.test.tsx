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
  Panel,
  PeriodStepper,
  ProgressBar,
  SaveBar,
  SectionHeading,
  SegmentedBar,
  SegmentedControl,
  SelectionBar,
  SidePanel,
  Sparkline,
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

describe('Panel', () => {
  it('names the panel after its title and keeps the actions and the footer with it', () => {
    render(
      <Panel title="Services" actions={<button type="button">Ajouter un service</button>} footer="4 services">
        <div>Sonorisation</div>
      </Panel>,
    )
    const panel = screen.getByRole('region', { name: 'Services' })
    expect(within(panel).getByRole('button', { name: 'Ajouter un service' })).toBeTruthy()
    expect(within(panel).getByText('Sonorisation')).toBeTruthy()
    expect(within(panel).getByText('4 services')).toBeTruthy()
  })

  it('takes an accessible name when it has no title', () => {
    render(
      <Panel aria-label="Informations" padded>
        <input aria-label="Nom" />
      </Panel>,
    )
    expect(screen.getByRole('region', { name: 'Informations' })).toBeTruthy()
  })
})

function CollapsibleHost() {
  const [expanded, setExpanded] = useState(true)
  return (
    <>
      <SectionHeading
        title="Territoires"
        meta={2}
        badge={<span>2 non lus</span>}
        collapsible={{ expanded, onToggle: () => setExpanded((open) => !open), controls: 'docs' }}
      />
      <div id="docs" hidden={!expanded}>
        Plan du territoire
      </div>
    </>
  )
}

describe('SectionHeading', () => {
  it('heads a section with its title, a quiet count and its actions', () => {
    render(
      <section aria-labelledby="h">
        <SectionHeading id="h" title="À traiter" meta={4} actions={<a href="/x">Tout voir</a>} />
      </section>,
    )
    expect(screen.getByRole('heading', { level: 2, name: /À traiter/ })).toBeTruthy()
    expect(screen.getByRole('region', { name: /À traiter/ })).toBeTruthy()
    expect(screen.getByText('4')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Tout voir' })).toBeTruthy()
  })

  it('takes a lower level when the page needs one', () => {
    render(<SectionHeading as="h3" title="Salle B" />)
    expect(screen.getByRole('heading', { level: 3, name: 'Salle B' })).toBeTruthy()
  })

  it('shows and hides its content when collapsible, saying which way it is', () => {
    render(<CollapsibleHost />)
    const toggle = screen.getByRole('button', { name: /Territoires/ })
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
    expect(toggle.getAttribute('aria-controls')).toBe('docs')
    expect(within(toggle).getByText('2 non lus')).toBeTruthy()

    fireEvent.click(toggle)
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
  })
})

function PanelHost({ onClose = () => {} }: { onClose?: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Modifier
      </button>
      {open && (
        <SidePanel
          title="Partie de l’évènement"
          description="Modification ponctuelle"
          closeLabel="Fermer"
          onClose={() => {
            onClose()
            setOpen(false)
          }}
          footer={<button type="submit">Enregistrer</button>}
        >
          <input aria-label="Nom" />
        </SidePanel>
      )}
    </>
  )
}

function ReturnFocusHost() {
  const [open, setOpen] = useState(true)
  const [row, setRow] = useState<HTMLButtonElement | null>(null)
  return (
    <>
      <button type="button" ref={setRow}>
        Modifier Discours
      </button>
      {open && (
        <SidePanel title="Partie" closeLabel="Fermer" onClose={() => setOpen(false)} returnFocus={row}>
          <input aria-label="Nom" />
        </SidePanel>
      )}
    </>
  )
}

describe('SidePanel', () => {
  it('is a landmark named by its title and described by its line', () => {
    render(<PanelHost />)
    fireEvent.click(screen.getByRole('button', { name: 'Modifier' }))
    const panel = screen.getByRole('complementary', { name: 'Partie de l’évènement' })
    expect(panel.getAttribute('aria-describedby')).toBe(within(panel).getByText('Modification ponctuelle').id)
    expect(within(panel).getByRole('button', { name: 'Enregistrer' })).toBeTruthy()
  })

  it('fits the screen under its top, so its footer stays in view', () => {
    render(<PanelHost />)
    fireEvent.click(screen.getByRole('button', { name: 'Modifier' }))
    // jsdom lays nothing out: the panel sits at the top of the screen.
    expect(screen.getByRole('complementary').style.getPropertyValue('--side-panel-top')).toBe('0px')
  })

  it('takes focus when it opens and gives it back when it closes', () => {
    render(<PanelHost />)
    const opener = screen.getByRole('button', { name: 'Modifier' })
    opener.focus()
    fireEvent.click(opener)
    expect(document.activeElement).toBe(screen.getByRole('complementary'))
    fireEvent.click(screen.getByRole('button', { name: 'Fermer' }))
    expect(screen.queryByRole('complementary')).toBeNull()
    expect(document.activeElement).toBe(opener)
  })

  it('gives focus back to the element it is told to, when there is one', () => {
    render(<ReturnFocusHost />)
    fireEvent.click(screen.getByRole('button', { name: 'Fermer' }))
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Modifier Discours' }))
  })

  it('closes on Escape, but not when something inside handled the key first', () => {
    let closed = 0
    render(<PanelHost onClose={() => closed++} />)
    fireEvent.click(screen.getByRole('button', { name: 'Modifier' }))
    const field = screen.getByRole('textbox', { name: 'Nom' })
    field.addEventListener('keydown', (event) => event.preventDefault(), { once: true })
    fireEvent.keyDown(field, { key: 'Escape' })
    expect(closed).toBe(0)
    fireEvent.keyDown(field, { key: 'Escape' })
    expect(closed).toBe(1)
    expect(screen.queryByRole('complementary')).toBeNull()
  })
})

describe('StatTile meter', () => {
  it('draws its meter between the value and the foot', () => {
    render(
      <StatTile
        label="Rapports rendus"
        value="52"
        unit="sur 61"
        meter={<ProgressBar value={52} max={61} aria-label="Rapports rendus" />}
        foot="9 à relancer"
      />,
    )
    const bar = screen.getByRole('progressbar', { name: 'Rapports rendus' })
    const foot = screen.getByText('9 à relancer')
    expect(bar.compareDocumentPosition(foot) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})

describe('ProgressBar', () => {
  it('stays decorative without a name, so the text beside it is what gets read', () => {
    const { container } = render(<ProgressBar value={42} max={50} />)
    expect(screen.queryByRole('progressbar')).toBeNull()
    expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe('true')
  })

  it('announces its value once named, and stays full past the whole', () => {
    const { container } = render(<ProgressBar value={60} max={50} aria-label="Objectif" />)
    const bar = screen.getByRole('progressbar', { name: 'Objectif' })
    expect(bar.getAttribute('aria-valuenow')).toBe('60')
    expect(bar.getAttribute('aria-valuemax')).toBe('50')
    expect((container.querySelector('[role=progressbar] > div') as HTMLElement).style.width).toBe('100%')
  })
})

describe('PeriodStepper', () => {
  it('steps with buttons, and holds a step that leads nowhere', () => {
    let steps = 0
    render(
      <PeriodStepper
        label="octobre 2026"
        previous={{ label: 'Mois précédent', onClick: () => steps-- }}
        next={{ label: 'Mois suivant', disabled: true, onClick: () => steps++ }}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Mois précédent' }))
    fireEvent.click(screen.getByRole('button', { name: 'Mois suivant' }))
    expect(steps).toBe(-1)
    expect(screen.getByText('octobre 2026')).toBeTruthy()
  })

  it("renders a step with an address through the app's link", () => {
    render(
      <PeriodStepper
        label="2026–2027"
        previous={{ label: 'Année précédente', href: '?sy=2025' }}
        next={{ label: 'Année suivante', href: '?sy=2027' }}
        renderLink={({ href, children, ...props }) => (
          <a data-router="yes" href={`/pioneers${href}`} {...props}>
            {children}
          </a>
        )}
      />,
    )
    const previous = screen.getByRole('link', { name: 'Année précédente' })
    expect(previous.getAttribute('href')).toBe('/pioneers?sy=2025')
    expect(previous.dataset.router).toBe('yes')
  })
})

describe('Sparkline', () => {
  it('draws a column per value, a mark per gap and the goal as a line', () => {
    const { container } = render(<Sparkline values={['off', 40, 'missing', 52, 'future']} goal={50} />)
    const root = container.firstElementChild as HTMLElement
    expect(root.getAttribute('aria-hidden')).toBe('true')
    const marks = [...root.children] as HTMLElement[]
    expect(marks).toHaveLength(6)
    expect(marks.filter((m) => m.style.height !== '')).toHaveLength(2)
    expect(marks[2]?.className).toContain('bg-danger')
    // The last value takes the accent; the goal scales with the tallest of the values and itself.
    expect(marks[3]?.style.background).toBe('var(--color-chart-1)')
    expect(Number.parseFloat(marks[5]?.style.bottom ?? '')).toBeCloseTo((50 / 52) * 100, 2)
  })
})

describe('stacked columns and dashed lines', () => {
  it('render under their accessible name', () => {
    render(
      <>
        <ColumnChart
          aria-label="Heures par mois"
          seriesLabels={{ value: 'Rapportées', stack: 'Crédit' }}
          gapLabels={{ missing: 'Pas de rapport' }}
          goal={{ value: 50, label: '50 h' }}
          data={[
            { key: '2026-09', label: 'S', value: 40 },
            { key: '2026-10', label: 'O', value: 36, stack: 6 },
            { key: '2026-11', label: 'N', value: 'missing' },
            { key: '2026-12', label: 'D', value: 'future' },
          ]}
        />
        <LineChart
          aria-label="Cumul de l'année"
          xKey="month"
          data={[
            { month: 'S', done: 40, goal: 50, projection: null },
            { month: 'O', done: 82, goal: 100, projection: 82 },
            { month: 'N', done: null, goal: 150, projection: 120 },
          ]}
          series={[
            { key: 'goal', label: 'Objectif', context: true },
            { key: 'done', label: 'Heures', area: true },
            { key: 'projection', label: 'Projection', dashed: true },
          ]}
        />
      </>,
    )
    expect(screen.getByRole('img', { name: 'Heures par mois' })).toBeTruthy()
    expect(screen.getByRole('img', { name: "Cumul de l'année" })).toBeTruthy()
  })
})
