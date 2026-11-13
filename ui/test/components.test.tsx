import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import {
  AuthFrame,
  Avatar,
  BarList,
  Breadcrumb,
  Callout,
  ChartCard,
  ColumnChart,
  DateChip,
  DateField,
  EmptyState,
  ErrorState,
  FactList,
  FilterButton,
  FilterChipBar,
  FormSection,
  LineChart,
  MapAttribution,
  MapCard,
  MapCluster,
  MapControls,
  MapDot,
  MapPin,
  MapStatus,
  Mark,
  MetricStrip,
  NavGroup,
  NavItem,
  PageTitle,
  PaginationBar,
  Panel,
  PeriodStepper,
  ProgressBar,
  ProgressRing,
  QuickViews,
  SaveBar,
  SectionHeading,
  SegmentedBar,
  SegmentedControl,
  SelectionBar,
  SidebarFrame,
  SidePanel,
  Sparkline,
  StatTile,
  Status,
  seriesColor,
  TopbarRow,
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

describe('FactList', () => {
  it('pairs each label with its value in a description list, the hint under the value', () => {
    render(
      <FactList
        facts={[
          { label: 'Téléphone', value: '06 12 34 56 78' },
          { label: 'Naissance', value: '14 mai 1981', hint: '45 ans' },
        ]}
      />,
    )
    const terms = screen.getAllByRole('term').map((term) => term.textContent)
    const definitions = screen.getAllByRole('definition').map((definition) => definition.textContent)
    expect(terms).toEqual(['Téléphone', 'Naissance'])
    expect(definitions).toEqual(['06 12 34 56 78', '14 mai 198145 ans'])
    expect(screen.getByText('45 ans')).toBeTruthy()
  })

  it('leaves out a fact without a value', () => {
    render(
      <FactList
        facts={[
          { label: 'Téléphone', value: null },
          { label: 'Adresse', value: '' },
          { label: 'E-mail', value: 'p.fontaine@exemple.fr' },
        ]}
      />,
    )
    expect(screen.getAllByRole('term').map((term) => term.textContent)).toEqual(['E-mail'])
  })

  it('says a value is missing when it is given the words for it', () => {
    render(<FactList emptyLabel="Non renseigné" facts={[{ label: 'Téléphone', value: undefined }]} />)
    expect(screen.getByRole('definition').textContent).toBe('Non renseigné')
  })

  it('draws nothing when no fact is left', () => {
    const { container } = render(<FactList facts={[{ label: 'Téléphone', value: null }]} />)
    expect(container.querySelector('dl')).toBeNull()
  })
})

describe('DateChip', () => {
  it('stacks the month over the day and stays decorative, the row saying the full date', () => {
    const { container } = render(<DateChip month="mars" day="19" />)
    const chip = container.firstElementChild as HTMLElement
    expect(chip.getAttribute('aria-hidden')).toBe('true')
    expect(chip.textContent).toBe('mars19')
  })
})

describe('map pieces', () => {
  it('a pin is a button named after its place, pressed once picked, reporting hover and focus', () => {
    const seen: string[] = []
    const { rerender } = render(
      <MapPin
        label="4 allée des Peupliers · 68 foyers"
        onSelect={() => seen.push('select')}
        onHover={(on) => seen.push(on ? 'in' : 'out')}
      >
        4
      </MapPin>,
    )
    const pin = screen.getByRole('button', { name: '4 allée des Peupliers · 68 foyers' })
    expect(pin.textContent).toBe('4')
    expect(pin.getAttribute('aria-pressed')).toBe('false')
    fireEvent.mouseEnter(pin)
    fireEvent.click(pin)
    fireEvent.mouseLeave(pin)
    fireEvent.focus(pin)
    expect(seen).toEqual(['in', 'select', 'out', 'in'])
    rerender(
      <MapPin label="4 allée des Peupliers · 68 foyers" state="selected">
        4
      </MapPin>,
    )
    expect(screen.getByRole('button').getAttribute('aria-pressed')).toBe('true')
  })

  it('an editor dot shows its state by shape, and stays out of the accessibility tree', () => {
    const { container } = render(
      <>
        <MapDot state="in" />
        <MapDot state="free" />
        <MapDot state="remove" size="small" />
      </>,
    )
    const dots = container.querySelectorAll('[data-state]')
    expect([...dots].map((dot) => dot.getAttribute('data-state'))).toEqual(['in', 'free', 'remove'])
    for (const dot of dots) expect(dot.getAttribute('aria-hidden')).toBe('true')
    // A check for « in », nothing for « free », a cross for « remove »
    expect([...dots].map((dot) => dot.querySelectorAll('path').length)).toEqual([1, 0, 1])
  })

  it('a cluster names how many places it holds, and zooms in when it can', () => {
    let zoomed = 0
    const { rerender } = render(<MapCluster count={24} label="24 entrées" />)
    expect(screen.getByRole('img', { name: '24 entrées' }).textContent).toBe('24')
    rerender(<MapCluster count={24} label="24 entrées" onSelect={() => zoomed++} />)
    fireEvent.click(screen.getByRole('button', { name: '24 entrées' }))
    expect(zoomed).toBe(1)
  })

  it('the controls zoom and recentre with the labels they are given', () => {
    const calls: string[] = []
    render(
      <MapControls
        labels={{ zoomIn: 'Zoomer', zoomOut: 'Dézoomer', recenter: 'Recentrer sur le territoire' }}
        onZoomIn={() => calls.push('in')}
        onZoomOut={() => calls.push('out')}
        onRecenter={() => calls.push('recenter')}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Zoomer' }))
    fireEvent.click(screen.getByRole('button', { name: 'Dézoomer' }))
    fireEvent.click(screen.getByRole('button', { name: 'Recentrer sur le territoire' }))
    expect(calls).toEqual(['in', 'out', 'recenter'])
  })

  it('the attribution links each source in a new tab', () => {
    render(
      <MapAttribution
        sources={[
          { label: 'Protomaps', href: 'https://protomaps.com' },
          { label: '© OpenStreetMap', href: 'https://www.openstreetmap.org/copyright' },
        ]}
      />,
    )
    const osm = screen.getByRole('link', { name: '© OpenStreetMap' })
    expect(osm.getAttribute('href')).toBe('https://www.openstreetmap.org/copyright')
    expect(osm.getAttribute('target')).toBe('_blank')
    expect(screen.getByRole('link', { name: 'Protomaps' })).toBeTruthy()
  })

  it('a card is named after its place and closes on its button or on Escape, unless the key was handled', () => {
    let closed = 0
    render(
      <MapCard
        title="4, 6, 8 allée des Peupliers"
        meta="68 foyers"
        closeLabel="Fermer la fiche"
        onClose={() => closed++}
      >
        <input aria-label="Note" />
      </MapCard>,
    )
    const card = screen.getByRole('region', { name: '4, 6, 8 allée des Peupliers' })
    expect(within(card).getByText('68 foyers')).toBeTruthy()
    fireEvent.click(within(card).getByRole('button', { name: 'Fermer la fiche' }))
    expect(closed).toBe(1)
    const field = within(card).getByRole('textbox', { name: 'Note' })
    field.addEventListener('keydown', (event) => event.preventDefault(), { once: true })
    fireEvent.keyDown(field, { key: 'Escape' })
    expect(closed).toBe(1)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(closed).toBe(2)
  })

  it('the status announces itself and carries its action', () => {
    render(
      <MapStatus tone="error" action={<button type="button">Réessayer</button>}>
        Le fond de carte ne répond pas.
      </MapStatus>,
    )
    const status = screen.getByRole('status')
    expect(status.textContent).toContain('Le fond de carte ne répond pas.')
    expect(within(status).getByRole('button', { name: 'Réessayer' })).toBeTruthy()
  })
})

describe('ProgressRing', () => {
  it('is decorative without a name, and a progress bar with one', () => {
    const { container, rerender } = render(<ProgressRing value={5} max={7} />)
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
    rerender(<ProgressRing value={5} max={7} aria-label="Parties attribuées" />)
    const ring = screen.getByRole('progressbar', { name: 'Parties attribuées' })
    expect(ring.getAttribute('aria-valuenow')).toBe('5')
    expect(ring.getAttribute('aria-valuemax')).toBe('7')
  })

  it('draws an arc in proportion to the share, over a solid track', () => {
    const { container } = render(<ProgressRing value={1} max={4} />)
    const [track, arc] = container.querySelectorAll('circle')
    expect(track.getAttribute('stroke-dasharray')).toBeNull()
    const [drawn, rest] = (arc.getAttribute('stroke-dasharray') ?? '').split(' ').map(Number)
    expect(drawn / (drawn + rest)).toBeCloseTo(0.25, 2)
  })

  it('draws no arc at zero, a full one in the success tone once complete, and stays full past it', () => {
    const { container, rerender } = render(<ProgressRing value={0} max={3} />)
    expect(container.querySelectorAll('circle')).toHaveLength(1)
    rerender(<ProgressRing value={4} max={3} />)
    const arc = container.querySelectorAll('circle')[1]
    expect(arc.getAttribute('style')).toContain('--u-success')
    const [drawn, rest] = (arc.getAttribute('stroke-dasharray') ?? '').split(' ').map(Number)
    expect(rest).toBeCloseTo(0, 5)
    expect(drawn).toBeGreaterThan(0)
  })
})

describe('Callout', () => {
  it('shows the tone as a shape, then the title, the body and the action', () => {
    render(
      <Callout tone="danger" title="Impossible d’enregistrer" action={<button type="button">Réessayer</button>}>
        Ce numéro est déjà pris.
      </Callout>,
    )
    const callout = screen.getByText('Impossible d’enregistrer').closest('[data-callout]')
    expect(callout?.getAttribute('data-tone')).toBe('danger')
    expect(callout?.querySelector('svg[aria-hidden="true"]')).not.toBeNull()
    expect(screen.getByText('Ce numéro est déjà pris.')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Réessayer' })).toBeTruthy()
  })

  it('announces itself only when asked to', () => {
    const { rerender } = render(<Callout tone="warning">Hors ligne</Callout>)
    expect(screen.queryByRole('alert')).toBeNull()
    rerender(
      <Callout tone="danger" role="alert">
        Échec
      </Callout>,
    )
    expect(screen.getByRole('alert').textContent).toContain('Échec')
  })
})

const DATE_LABELS = { openCalendar: 'Choisir une date', previousMonth: 'Mois précédent', nextMonth: 'Mois suivant' }

function ControlledDateField({ initial = '2026-11-10', min }: { initial?: string | null; min?: string }) {
  const [value, setValue] = useState<string | null>(initial)
  return (
    <>
      <label htmlFor="from">Du</label>
      <DateField
        id="from"
        name="from"
        locale="fr-FR"
        labels={DATE_LABELS}
        value={value}
        onChange={setValue}
        min={min}
      />
      <output data-testid="value">{value ?? ''}</output>
    </>
  )
}

describe('DateField', () => {
  it('writes the date out with its weekday, and submits it as YYYY-MM-DD', () => {
    const { container } = render(<ControlledDateField />)
    const field = screen.getByLabelText('Du') as HTMLInputElement
    expect(field.value).toBe('mar. 10 novembre 2026')
    expect((container.querySelector('input[type="hidden"][name="from"]') as HTMLInputElement).value).toBe('2026-11-10')
  })

  it('takes a typed date in the reader’s order, and shows it numerically while typing', () => {
    render(<ControlledDateField />)
    const field = screen.getByLabelText('Du') as HTMLInputElement
    fireEvent.focus(field)
    expect(field.value).toBe('10/11/2026')
    fireEvent.change(field, { target: { value: '3/12/26' } })
    fireEvent.blur(field)
    expect(screen.getByTestId('value').textContent).toBe('2026-12-03')
    expect(field.value).toBe('jeu. 3 décembre 2026')
  })

  it('keeps the date when what was typed is not one', () => {
    render(<ControlledDateField />)
    const field = screen.getByLabelText('Du') as HTMLInputElement
    fireEvent.focus(field)
    fireEvent.change(field, { target: { value: '31/02/2026' } })
    fireEvent.blur(field)
    expect(screen.getByTestId('value').textContent).toBe('2026-11-10')
  })

  it('opens a month calendar on the date, and a day picked there becomes the value', () => {
    render(<ControlledDateField />)
    fireEvent.click(screen.getByRole('button', { name: 'Choisir une date' }))
    const grid = screen.getByRole('grid', { name: 'novembre 2026' })
    expect(within(grid).getByRole('button', { name: /10 novembre 2026/, pressed: true })).toBeTruthy()
    fireEvent.click(within(grid).getByRole('button', { name: /^vendredi 13 novembre 2026/ }))
    expect(screen.getByTestId('value').textContent).toBe('2026-11-13')
    expect(screen.queryByRole('grid')).toBeNull()
  })

  it('walks the calendar by keyboard and closes on Escape', () => {
    render(<ControlledDateField />)
    fireEvent.click(screen.getByRole('button', { name: 'Choisir une date' }))
    const grid = screen.getByRole('grid')
    fireEvent.keyDown(grid, { key: 'ArrowRight' })
    fireEvent.keyDown(grid, { key: 'ArrowDown' })
    expect((document.activeElement as HTMLElement).getAttribute('aria-label')).toMatch(/18 novembre 2026/)
    fireEvent.keyDown(grid, { key: 'PageDown' })
    expect(screen.getByRole('grid', { name: 'décembre 2026' })).toBeTruthy()
    fireEvent.keyDown(grid, { key: 'Escape' })
    expect(screen.queryByRole('grid')).toBeNull()
    expect(screen.getByTestId('value').textContent).toBe('2026-11-10')
  })

  it('leaves days before `min` out of reach', () => {
    render(<ControlledDateField min="2026-11-05" />)
    fireEvent.click(screen.getByRole('button', { name: 'Choisir une date' }))
    expect((screen.getByRole('button', { name: /^mercredi 4 novembre 2026/ }) as HTMLButtonElement).disabled).toBe(true)
  })

  it('moves between months with its arrows', () => {
    render(<ControlledDateField />)
    fireEvent.click(screen.getByRole('button', { name: 'Choisir une date' }))
    fireEvent.click(screen.getByRole('button', { name: 'Mois suivant' }))
    expect(screen.getByRole('grid', { name: 'décembre 2026' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Mois précédent' }))
    fireEvent.click(screen.getByRole('button', { name: 'Mois précédent' }))
    expect(screen.getByRole('grid', { name: 'octobre 2026' })).toBeTruthy()
  })
})

describe('SidePanel walk', () => {
  it('shows where the item sits and steps to the previous and next ones', () => {
    const calls: string[] = []
    render(
      <SidePanel
        title="T03"
        onClose={() => {}}
        closeLabel="Fermer"
        walk={{
          position: '3 sur 12',
          previousLabel: 'Précédent',
          nextLabel: 'Suivant',
          onPrevious: () => calls.push('previous'),
          onNext: () => calls.push('next'),
        }}
      >
        <p>Contenu</p>
      </SidePanel>,
    )
    expect(screen.getByText('3 sur 12')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Précédent' }))
    fireEvent.click(screen.getByRole('button', { name: 'Suivant' }))
    expect(calls).toEqual(['previous', 'next'])
  })

  it('puts its actions in the header, before the walk and the close button', () => {
    render(
      <SidePanel
        title="Benoit CARINCI"
        onClose={() => {}}
        closeLabel="Fermer"
        actions={<button type="button">Modifier</button>}
        walk={{ position: '1 sur 2', previousLabel: 'Précédent', nextLabel: 'Suivant', onNext: () => {} }}
      >
        <p>Contenu</p>
      </SidePanel>,
    )
    const buttons = within(screen.getByRole('complementary'))
      .getAllByRole('button')
      .map((button) => button.textContent || button.getAttribute('aria-label'))
    expect(buttons).toEqual(['Modifier', 'Précédent', 'Suivant', 'Fermer'])
  })

  it('disables a step that has nowhere to go', () => {
    render(
      <SidePanel
        title="T01"
        onClose={() => {}}
        closeLabel="Fermer"
        walk={{ position: '1 sur 12', previousLabel: 'Précédent', nextLabel: 'Suivant', onNext: () => {} }}
      >
        <p>Contenu</p>
      </SidePanel>,
    )
    expect((screen.getByRole('button', { name: 'Précédent' }) as HTMLButtonElement).disabled).toBe(true)
  })
})

describe('sidebar navigation', () => {
  it('marks the current entry and renders entries through the app link', () => {
    render(
      <SidebarFrame header={<span>unitae</span>} footer={<span>admin@exemple.fr</span>}>
        <nav aria-label="Navigation">
          <NavGroup label="Clients">
            <NavItem
              label="Congrégations"
              href="/congregations"
              current
              shortcut="G C"
              renderLink={({ href, children, ...props }) => (
                <a data-router="yes" href={href} {...props}>
                  {children}
                </a>
              )}
            />
            <NavItem label="Journal d’audit" href="/audit-logs" />
          </NavGroup>
        </nav>
      </SidebarFrame>,
    )
    const current = screen.getByRole('link', { name: /Congrégations/ })
    expect(current.getAttribute('aria-current')).toBe('page')
    expect(current.dataset.router).toBe('yes')
    expect(within(current).getByText('G C')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Journal d’audit' }).getAttribute('aria-current')).toBeNull()
    expect(screen.getByText('Clients')).toBeTruthy()
  })
})

describe('TopbarRow and Breadcrumb', () => {
  it('ends the trail with the page itself and links the crumbs before it', () => {
    render(
      <TopbarRow
        trail={
          <Breadcrumb
            aria-label="Fil d’Ariane"
            items={[{ label: 'Congrégations', href: '/congregations' }, { label: 'Lyon Confluence' }]}
            renderLink={({ href, children, className }) => (
              <a data-router="yes" href={href} className={className}>
                {children}
              </a>
            )}
          />
        }
        actions={<button type="button">Suspendre…</button>}
      />,
    )
    const trail = screen.getByRole('navigation', { name: 'Fil d’Ariane' })
    expect(within(trail).getByRole('link', { name: 'Congrégations' }).dataset.router).toBe('yes')
    expect(within(trail).getByText('Lyon Confluence').getAttribute('aria-current')).toBe('page')
    expect(screen.getByRole('button', { name: 'Suspendre…' })).toBeTruthy()
  })
})

describe('PageTitle', () => {
  it('draws the title, its facts and the controls on the same row', () => {
    render(
      <PageTitle
        title="Lyon Confluence"
        meta={<span>Créée le 26 oct. 2026</span>}
        controls={<button type="button">30 jours</button>}
      />,
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Lyon Confluence' })).toBeTruthy()
    expect(screen.getByText('Créée le 26 oct. 2026')).toBeTruthy()
    expect(screen.getByRole('button', { name: '30 jours' })).toBeTruthy()
  })
})

function QuickViewsHarness() {
  const [view, setView] = useState<'all' | 'trial'>('all')
  return (
    <>
      <QuickViews
        label="Congrégations"
        value={view}
        onChoose={setView}
        views={[
          { value: 'all', label: 'Toutes', count: 42 },
          { value: 'trial', label: 'En essai', count: 11 },
        ]}
      />
      <output>{view}</output>
    </>
  )
}

describe('QuickViews', () => {
  it('chooses a view from the phone chips as from the segmented control', () => {
    render(<QuickViewsHarness />)
    // Both renderings sit in the DOM (the CSS picks one per width): take the phone's chips.
    const chips = screen
      .getAllByRole('group', { name: 'Congrégations' })
      .find((el) => el.tagName === 'FIELDSET') as HTMLElement
    fireEvent.click(within(chips).getByRole('button', { name: /En essai/ }))
    expect(screen.getByRole('status').textContent).toBe('trial')
    expect(
      within(chips)
        .getByRole('button', { name: /En essai/ })
        .getAttribute('aria-pressed'),
    ).toBe('true')
  })
})

describe('EmptyState', () => {
  it('says one plain sentence and offers the action', () => {
    render(<EmptyState title="Aucune congrégation à risque." action={<button type="button">Voir tout</button>} />)
    expect(screen.getByText('Aucune congrégation à risque.')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Voir tout' })).toBeTruthy()
  })
})

describe('PaginationBar', () => {
  it('holds the way back on the first page and links the next one', () => {
    render(
      <PaginationBar
        label="1–25 sur 42"
        previous={{ label: 'Page précédente', disabled: true }}
        next={{ label: 'Page suivante', href: '?page=2' }}
      />,
    )
    expect((screen.getByRole('button', { name: 'Page précédente' }) as HTMLButtonElement).disabled).toBe(true)
    expect(screen.getByRole('link', { name: 'Page suivante' }).getAttribute('href')).toBe('?page=2')
    expect(screen.getByText('1–25 sur 42')).toBeTruthy()
  })
})

describe('filters', () => {
  it('says how many filters are on, and passes trigger props through', () => {
    let opened = false
    render(<FilterButton label="Filtres" count={2} activeLabel="Filtres, 2 actifs" onClick={() => (opened = true)} />)
    const button = screen.getByRole('button', { name: 'Filtres, 2 actifs' })
    fireEvent.click(button)
    expect(opened).toBe(true)
    expect(within(button).getByText('2')).toBeTruthy()
  })

  it('shows nothing without a filter, and removes one chip at a time', () => {
    const { container } = render(
      <FilterChipBar chips={[]} aria-label="Filtres actifs" removeLabel={() => ''} clearLabel="Effacer les filtres" />,
    )
    expect(container.innerHTML).toBe('')

    const removed: string[] = []
    render(
      <FilterChipBar
        aria-label="Filtres actifs"
        chips={[
          { key: 'trial', label: 'Essai', value: 'se termine dans 7 jours', onRemove: () => removed.push('trial') },
        ]}
        removeLabel={(chip) => `Retirer ${chip.label} : ${chip.value}`}
        clearLabel="Effacer les filtres"
        clearHref="/congregations"
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Retirer Essai : se termine dans 7 jours' }))
    expect(removed).toEqual(['trial'])
    expect(screen.getByRole('link', { name: 'Effacer les filtres' }).getAttribute('href')).toBe('/congregations')
  })
})

describe('ErrorState', () => {
  it('names the error and offers the ways on', () => {
    render(
      <ErrorState
        code="Erreur 404"
        title="Cette congrégation n’existe pas"
        description="Elle a peut-être été supprimée définitivement."
        actions={<a href="/congregations">Voir les congrégations</a>}
      />,
    )
    expect(screen.getByText('Erreur 404')).toBeTruthy()
    expect(screen.getByRole('heading', { level: 1, name: 'Cette congrégation n’existe pas' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Voir les congrégations' })).toBeTruthy()
  })
})

describe('AuthFrame', () => {
  it('frames one column: the emblem, the action as title, the page’s footer', () => {
    render(
      <AuthFrame
        emblem={<Mark />}
        eyebrow="Plateforme"
        title="Se connecter"
        footer={<a href="/privacy">Confidentialité</a>}
      >
        <form aria-label="Connexion" />
      </AuthFrame>,
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Se connecter' })).toBeTruthy()
    expect(screen.getByText('Plateforme')).toBeTruthy()
    expect(screen.getByRole('form', { name: 'Connexion' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Confidentialité' })).toBeTruthy()
  })
})
