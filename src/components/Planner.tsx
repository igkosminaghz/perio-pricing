import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { procedureById } from '../data/procedures'
import {
  buildProtocol,
  euroPerChairHour,
  gapLabel,
  procedureLabel,
  weekLabel,
  type ChartingInput,
  type ChartingMode,
  type Extent,
  type Grade,
  type ProtocolInput,
  type SrpPattern,
  type Stage,
} from '../data/protocols'
import { formatEur } from '../lib/format'
import styles from './Planner.module.css'

export type PlannerProps = {
  locale: 'en' | 'hr'
  t?: (key: string) => string
  economic: boolean
  getPrice: (procedureId: string, tier: 'economic' | 'highend') => number
  getProcedure?: (id: string) =>
    | {
        id: string
        name: string
        timeMinutes: number
        materialEconomic: number
        materialHighend: number
      }
    | undefined
}

type Tier = 'economic' | 'highend'

const UI = {
  en: {
    eyebrow: 'Clinical planning',
    title: 'Exact visit walkthrough',
    lede:
      'Enter severity (and a chart if you have one). The clinic sequence is decided for you — chair time, healing gaps, calendar week, cost and € per chair-hour.',
    extent: 'Extent',
    localised: 'Localised',
    generalised: 'Generalised',
    stage: 'Stage (EFP 2018)',
    grade: 'Grade',
    charting: 'Charting',
    estimate: 'I don’t have a chart — estimate from severity',
    haveChart: 'I have probing / BOP numbers',
    host: 'Host & context',
    smoker: 'Smoker',
    diabetes: 'Diabetes',
    implants: 'Implants present',
    furcation: 'Furcation involved',
    mobility: 'Pathologic mobility',
    bop: 'BOP %',
    pd: 'Deepest PD (mm)',
    sites56: 'Sites 5–6 mm',
    sites7: 'Sites ≥ 7 mm',
    teeth: 'Number of teeth',
    srp: 'SRP pattern',
    srpAuto: 'Auto (EFP-style staging)',
    srpQuad: 'One quadrant per visit',
    srpHalf: 'Half-mouth, 7-day gap',
    srpFmd: 'FMD protocol (24 h)',
    estimateHint:
      'Pockets, furcation and tooth count are inferred from Stage/Grade until a real chart exists. Host boxes still override the estimate.',
    chartHint: 'Leave a field blank to keep the severity estimate for that item only.',
    economic: 'Economic',
    highend: 'High-end',
    print: 'Print this plan',
    totalCost: 'Total plan cost',
    activeCost: 'Active therapy (ex-SPT)',
    chairHours: 'Total chair hours',
    blended: 'Blended € / chair-hour',
    flagged: 'Longer, higher €/h',
    flaggedNone: 'None flagged',
    week: 'Calendar',
    chair: 'Chair',
    cost: 'Fee',
    roi: '€ / chair-hour',
    materials: 'materials',
    flagNote: 'Longer sitting and above-plan €/hour',
    min: 'min',
    printTitle: 'Periodontal treatment walkthrough',
    printLegendE: 'Economic column',
    printLegendH: 'High-end column',
    printFoot:
      'EFP S3 spirit, not a prescription. Confirm the chart at visit 1. Regeneration is not promised in Grade C or smokers. Implant fixtures exclude abutment and crown.',
    qty: '×',
    resolved: 'Numbers used for this plan',
    estimated: 'estimated',
  },
  hr: {
    eyebrow: 'Kliničko planiranje',
    title: 'Točan hodogram posjeta',
    lede:
      'Unesite težinu bolesti (i karticu ako je imate). Niz zahvata određuje aplikacija — vrijeme u stolici, razmaci cijeljenja, kalendarski tjedan, cijena i € po satu stolice.',
    extent: 'Zahvaćenost',
    localised: 'Lokalizirani',
    generalised: 'Generalizirani',
    stage: 'Stadij (EFP 2018)',
    grade: 'Stupanj',
    charting: 'Kartica',
    estimate: 'Nemam karticu — procijeni iz težine',
    haveChart: 'Imam sondiranje / BOP',
    host: 'Domaćin i kontekst',
    smoker: 'Pušač',
    diabetes: 'Dijabetes',
    implants: 'Prisutni implantati',
    furcation: 'Furkacija',
    mobility: 'Patološka pokretljivost',
    bop: 'BOP %',
    pd: 'Najdublji PD (mm)',
    sites56: 'Mjesta 5–6 mm',
    sites7: 'Mjesta ≥ 7 mm',
    teeth: 'Broj zuba',
    srp: 'Obrazac SRP',
    srpAuto: 'Automatski (EFP stupnjevanje)',
    srpQuad: 'Jedan kvadrant po posjetu',
    srpHalf: 'Polovica usta, razmak 7 dana',
    srpFmd: 'FMD protokol (24 h)',
    estimateHint:
      'Džepovi, furkacija i broj zuba proizlaze iz stadija/stupnja dok ne postoji prava kartica. Kućice domaćina i dalje nadjačavaju procjenu.',
    chartHint: 'Prazno polje zadržava procjenu samo za tu stavku.',
    economic: 'Ekonomski',
    highend: 'High-end',
    print: 'Ispiši ovaj plan',
    totalCost: 'Ukupna cijena plana',
    activeCost: 'Aktivna terapija (bez SPT)',
    chairHours: 'Ukupni sati stolice',
    blended: 'Mješovito € / sat stolice',
    flagged: 'Dulje, viši €/h',
    flaggedNone: 'Nema takvih posjeta',
    week: 'Kalendar',
    chair: 'Stolica',
    cost: 'Naknada',
    roi: '€ / sat stolice',
    materials: 'materijal',
    flagNote: 'Dulja sjednica i iznadprosječni €/sat plana',
    min: 'min',
    printTitle: 'Hodogram parodontološkog liječenja',
    printLegendE: 'Ekonomski stupac',
    printLegendH: 'High-end stupac',
    printFoot:
      'Duh EFP S3, nije recept. Karticu potvrditi na 1. posjetu. Regeneracija se ne obećava kod stupnja C ni pušača. Implantat ne uključuje abatment i krunu.',
    qty: '×',
    resolved: 'Brojke korištene za ovaj plan',
    estimated: 'procjena',
  },
} as const

type UiKey = keyof typeof UI.en

export function Planner(props: PlannerProps) {
  const { locale, t, economic, getPrice, getProcedure } = props
  const [extent, setExtent] = useState<Extent>('generalised')
  const [stage, setStage] = useState<Stage>(3)
  const [grade, setGrade] = useState<Grade>('B')
  const [chartingMode, setChartingMode] = useState<ChartingMode>('estimate')
  const [srpPattern, setSrpPattern] = useState<SrpPattern>('auto')
  const [tierOverride, setTierOverride] = useState<Tier | null>(null)
  const [chartDraft, setChartDraft] = useState({
    bopPercent: '',
    deepestPd: '',
    sites56: '',
    sites7plus: '',
    toothCount: '',
    furcation: true,
    mobility: false,
    smoker: false,
    diabetes: false,
    implants: false,
  })

  const tier: Tier = tierOverride ?? (economic ? 'economic' : 'highend')

  const applyEstimateHost = (next: { extent: Extent; stage: Stage; grade: Grade }) => {
    setChartDraft((c) => ({
      ...c,
      furcation: next.stage === 4 || (next.stage === 3 && next.extent === 'generalised'),
      mobility: next.stage === 4,
      smoker: next.grade === 'C' ? true : c.smoker,
    }))
  }

  const tx = (key: UiKey) => {
    const fromApp = t?.(key)
    if (fromApp && fromApp !== key) return fromApp
    return UI[locale][key]
  }

  const protocolInput: ProtocolInput = useMemo(() => {
    const charting: ChartingInput = {
      furcation: chartDraft.furcation,
      mobility: chartDraft.mobility,
      smoker: chartDraft.smoker,
      diabetes: chartDraft.diabetes,
      implants: chartDraft.implants,
    }
    const num = (raw: string): number | undefined => {
      if (raw.trim() === '') return undefined
      const n = Number(raw)
      return Number.isFinite(n) ? n : undefined
    }
    if (chartingMode === 'chart') {
      charting.bopPercent = num(chartDraft.bopPercent)
      charting.deepestPd = num(chartDraft.deepestPd)
      charting.sites56 = num(chartDraft.sites56)
      charting.sites7plus = num(chartDraft.sites7plus)
      charting.toothCount = num(chartDraft.toothCount)
    }
    return { extent, stage, grade, chartingMode, charting, srpPattern }
  }, [extent, stage, grade, chartingMode, srpPattern, chartDraft])

  const plan = useMemo(() => buildProtocol(protocolInput), [protocolInput])

  const priced = useMemo(() => {
    const visits = plan.visits.map((visit) => {
      let price = 0
      let materials = 0
      let minutes = 0
      const lines = visit.lines.map((line) => {
        const meta = procedureMeta(line.procedureId, getProcedure)
        const unitPrice = getPrice(line.procedureId, tier)
        const unitMat = tier === 'economic' ? meta.materialEconomic : meta.materialHighend
        const linePrice = unitPrice * line.quantity
        const lineMat = unitMat * line.quantity
        const lineMin = meta.timeMinutes * line.quantity
        price += linePrice
        materials += lineMat
        minutes += lineMin
        return {
          ...line,
          name: procedureLabel(line.procedureId, locale, meta.name),
          minutes: lineMin,
          price: linePrice,
        }
      })
      const roi = euroPerChairHour(price, materials, minutes)
      return { ...visit, lines, price, materials, minutes, roi }
    })

    const totalPrice = visits.reduce((s, v) => s + v.price, 0)
    const totalMat = visits.reduce((s, v) => s + v.materials, 0)
    const totalMin = visits.reduce((s, v) => s + v.minutes, 0)
    const active = visits.filter((v) => v.phase !== 'spt')
    const activePrice = active.reduce((s, v) => s + v.price, 0)
    const blended = euroPerChairHour(totalPrice, totalMat, totalMin)
    const avgMin = visits.length ? totalMin / visits.length : 0
    const flagged = visits.map((v) => {
      const longHigh =
        v.minutes > Math.max(60, avgMin) && v.roi != null && blended != null && v.roi > blended
      return { ...v, longHigh }
    })
    return {
      visits: flagged,
      totalPrice,
      activePrice,
      totalMin,
      blended,
      flaggedCount: flagged.filter((v) => v.longHigh).length,
    }
  }, [plan, getPrice, getProcedure, tier, locale])

  const onPrint = () => {
    document.body.classList.add('planner-print-active')
    window.print()
    window.setTimeout(() => document.body.classList.remove('planner-print-active'), 400)
  }

  const printNode =
    typeof document !== 'undefined'
      ? createPortal(
          <div id="planner-print-sheet" className="print-sheet">
            <header className="print-hero">
              <p className="eyebrow">{tx('eyebrow')}</p>
              <h1>{tx('printTitle')}</h1>
              <p className="print-date">{plan.diagnosis[locale]}</p>
              <p className="print-legend">
                <span>{plan.pathway[locale]}</span>
                <span>
                  {tier === 'economic' ? tx('printLegendE') : tx('printLegendH')} · {tx('economic')}/
                  {tx('highend')} {formatEur(priced.totalPrice)}
                </span>
              </p>
            </header>
            <section className="print-cat">
              <h2>
                {tx('totalCost')} {formatEur(priced.totalPrice)}
              </h2>
              <p>
                {tx('activeCost')} {formatEur(priced.activePrice)} · {tx('chairHours')}{' '}
                {(priced.totalMin / 60).toFixed(1)} · {tx('blended')}{' '}
                {priced.blended == null ? '—' : formatEur(priced.blended)}
              </p>
            </section>
            {priced.visits.map((v) => (
              <section key={v.id} className="print-cat">
                <h2>
                  {v.visitNumber}. {v.title[locale]}
                </h2>
                <p>
                  {weekLabel(v.week, locale)} · {gapLabel(v.gapDaysAfterPrevious, locale)} · {v.minutes}{' '}
                  {tx('min')} · {formatEur(v.price)}
                  {v.roi != null ? ` · ${formatEur(v.roi)}/h` : ''}
                </p>
                <p>{v.note[locale]}</p>
                <ul>
                  {v.lines.map((l) => (
                    <li key={`${v.id}-${l.procedureId}`}>
                      {l.quantity > 1 ? `${l.quantity} ${tx('qty')} ` : ''}
                      {l.name} — {l.minutes} {tx('min')} — {formatEur(l.price)}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            <p className="print-foot">{tx('printFoot')}</p>
          </div>,
          document.body,
        )
      : null

  return (
    <section id="planner" className="section">
      <header className="section-head">
        <p className="eyebrow">{tx('eyebrow')}</p>
        <h2>{tx('title')}</h2>
        <p>{tx('lede')}</p>
      </header>

      <div className={`${styles.formCard} no-print`}>
        <div className={styles.formGrid}>
          <fieldset className={styles.seg}>
            <legend>{tx('extent')}</legend>
            <div className={styles.chips}>
              <Chip
                pressed={extent === 'localised'}
                onClick={() => {
                  setExtent('localised')
                  if (chartingMode === 'estimate') applyEstimateHost({ extent: 'localised', stage, grade })
                }}
              >
                {tx('localised')}
              </Chip>
              <Chip
                pressed={extent === 'generalised'}
                onClick={() => {
                  setExtent('generalised')
                  if (chartingMode === 'estimate') applyEstimateHost({ extent: 'generalised', stage, grade })
                }}
              >
                {tx('generalised')}
              </Chip>
            </div>
          </fieldset>

          <fieldset className={styles.seg}>
            <legend>{tx('stage')}</legend>
            <div className={styles.chips}>
              {([1, 2, 3, 4] as Stage[]).map((s) => (
                <Chip
                  key={s}
                  pressed={stage === s}
                  onClick={() => {
                    setStage(s)
                    if (chartingMode === 'estimate') applyEstimateHost({ extent, stage: s, grade })
                  }}
                >
                  {['I', 'II', 'III', 'IV'][s - 1]}
                </Chip>
              ))}
            </div>
          </fieldset>

          <fieldset className={styles.seg}>
            <legend>{tx('grade')}</legend>
            <div className={styles.chips}>
              {(['A', 'B', 'C'] as Grade[]).map((g) => (
                <Chip
                  key={g}
                  pressed={grade === g}
                  onClick={() => {
                    setGrade(g)
                    if (chartingMode === 'estimate') applyEstimateHost({ extent, stage, grade: g })
                  }}
                >
                  {g}
                </Chip>
              ))}
            </div>
          </fieldset>

          <fieldset className={`${styles.seg} ${styles.spanAll}`}>
            <legend>{tx('charting')}</legend>
            <div className={styles.chips}>
              <Chip
                pressed={chartingMode === 'estimate'}
                onClick={() => {
                  setChartingMode('estimate')
                  applyEstimateHost({ extent, stage, grade })
                }}
              >
                {tx('estimate')}
              </Chip>
              <Chip pressed={chartingMode === 'chart'} onClick={() => setChartingMode('chart')}>
                {tx('haveChart')}
              </Chip>
            </div>
            <p className={styles.hint}>{chartingMode === 'estimate' ? tx('estimateHint') : tx('chartHint')}</p>
          </fieldset>

          <fieldset className={`${styles.seg} ${styles.spanAll}`}>
            <legend>{tx('host')}</legend>
            <div className={styles.hostRow}>
              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={chartDraft.smoker}
                  onChange={(e) => setChartDraft((c) => ({ ...c, smoker: e.target.checked }))}
                />
                {tx('smoker')}
              </label>
              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={chartDraft.diabetes}
                  onChange={(e) => setChartDraft((c) => ({ ...c, diabetes: e.target.checked }))}
                />
                {tx('diabetes')}
              </label>
              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={chartDraft.implants}
                  onChange={(e) => setChartDraft((c) => ({ ...c, implants: e.target.checked }))}
                />
                {tx('implants')}
              </label>
              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={chartDraft.furcation}
                  onChange={(e) => setChartDraft((c) => ({ ...c, furcation: e.target.checked }))}
                />
                {tx('furcation')}
              </label>
              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={chartDraft.mobility}
                  onChange={(e) => setChartDraft((c) => ({ ...c, mobility: e.target.checked }))}
                />
                {tx('mobility')}
              </label>
            </div>
          </fieldset>

          {chartingMode === 'chart' && (
            <div className={`${styles.chartGrid} ${styles.spanAll}`}>
              <NumField
                label={tx('bop')}
                value={chartDraft.bopPercent}
                min={0}
                max={100}
                onChange={(v) => setChartDraft((c) => ({ ...c, bopPercent: v }))}
              />
              <NumField
                label={tx('pd')}
                value={chartDraft.deepestPd}
                min={1}
                max={15}
                onChange={(v) => setChartDraft((c) => ({ ...c, deepestPd: v }))}
              />
              <NumField
                label={tx('sites56')}
                value={chartDraft.sites56}
                min={0}
                max={192}
                onChange={(v) => setChartDraft((c) => ({ ...c, sites56: v }))}
              />
              <NumField
                label={tx('sites7')}
                value={chartDraft.sites7plus}
                min={0}
                max={192}
                onChange={(v) => setChartDraft((c) => ({ ...c, sites7plus: v }))}
              />
              <NumField
                label={tx('teeth')}
                value={chartDraft.toothCount}
                min={1}
                max={32}
                onChange={(v) => setChartDraft((c) => ({ ...c, toothCount: v }))}
              />
            </div>
          )}

          <label className={styles.field}>
            <span className={styles.fieldLabel}>{tx('srp')}</span>
            <select
              className={styles.select}
              value={srpPattern}
              onChange={(e) => setSrpPattern(e.target.value as SrpPattern)}
            >
              <option value="auto">{tx('srpAuto')}</option>
              <option value="quadrant">{tx('srpQuad')}</option>
              <option value="halfmouth">{tx('srpHalf')}</option>
              <option value="fmd">{tx('srpFmd')}</option>
            </select>
          </label>
        </div>

        <div className={styles.diagnosis}>
          <strong>{plan.diagnosis[locale]}</strong>
          <span>{plan.pathway[locale]}</span>
        </div>
        <p className={styles.chartSummary}>
          {tx('resolved')}: BOP {Math.round(plan.chart.bopPercent)}% · PD {plan.chart.deepestPd} mm · 5–6 mm{' '}
          {plan.chart.sites56} · ≥7 mm {plan.chart.sites7plus} · {plan.chart.toothCount}{' '}
          {locale === 'hr' ? 'zuba' : 'teeth'}
          {plan.chart.estimatedFields.length > 0 ? ` · ${tx('estimated')}` : ''}
        </p>
      </div>

      {plan.notes.length > 0 && (
        <ul className={styles.notes}>
          {plan.notes.map((n, i) => (
            <li key={i} className={n.kind === 'caution' ? styles.caution : n.kind === 'host' ? styles.host : undefined}>
              {n[locale]}
            </li>
          ))}
        </ul>
      )}

      <div className={`${styles.toolbar} no-print`}>
        <div className={styles.chips} role="group" aria-label={tx('cost')}>
          <Chip pressed={tier === 'economic'} onClick={() => setTierOverride('economic')}>
            {tx('economic')}
          </Chip>
          <Chip pressed={tier === 'highend'} onClick={() => setTierOverride('highend')}>
            {tx('highend')}
          </Chip>
        </div>
        <button type="button" className="gold-btn" onClick={onPrint}>
          {tx('print')}
        </button>
      </div>

      <div className={`kpi-grid ${styles.kpis}`}>
        <article className="kpi">
          <span>{tx('totalCost')}</span>
          <strong>{formatEur(priced.totalPrice)}</strong>
          <em>
            {tx('economic')} / {tx('highend')} · {tier === 'economic' ? tx('economic') : tx('highend')}
          </em>
        </article>
        <article className="kpi">
          <span>{tx('activeCost')}</span>
          <strong>{formatEur(priced.activePrice)}</strong>
          <em>SPT {formatEur(priced.totalPrice - priced.activePrice)}</em>
        </article>
        <article className="kpi">
          <span>{tx('chairHours')}</span>
          <strong>{(priced.totalMin / 60).toFixed(1)}</strong>
          <em>
            {priced.totalMin} {tx('min')}
          </em>
        </article>
        <article className={`kpi ${priced.flaggedCount ? styles.flagKpi : ''}`}>
          <span>{tx('blended')}</span>
          <strong>{priced.blended == null ? '—' : formatEur(priced.blended)}</strong>
          <em>
            {priced.flaggedCount
              ? `${priced.flaggedCount} × ${tx('flagged').toLowerCase()}`
              : tx('flaggedNone')}
          </em>
        </article>
      </div>

      <div className={styles.timelineCard}>
        <ol className={styles.timeline}>
          {priced.visits.map((v) => (
            <li key={v.id} className={styles.visit}>
              <span className={`${styles.rail} ${phaseClass[v.phase]}`} aria-hidden="true">
                {v.visitNumber}
              </span>
              <div className={styles.body}>
                <p className={styles.gap}>
                  {gapLabel(v.gapDaysAfterPrevious, locale)} · {weekLabel(v.week, locale)}
                  {v.elapsedDays > 0
                    ? ` · ${locale === 'hr' ? `dan ${v.elapsedDays}` : `day ${v.elapsedDays}`}`
                    : ''}
                </p>
                <div className={styles.head}>
                  <h3>{v.title[locale]}</h3>
                  <div className={styles.meta}>
                    <span className={styles.pill}>
                      {v.minutes} {tx('min')}
                    </span>
                    {v.longHigh && <span className={`${styles.pill} ${styles.pillGold}`}>{tx('flagNote')}</span>}
                  </div>
                </div>
                <p className={styles.note}>{v.note[locale]}</p>
                <ul className={styles.lines}>
                  {v.lines.map((line) => (
                    <li key={`${v.id}-${line.procedureId}-${line.quantity}`}>
                      <span>
                        {line.quantity > 1 ? `${line.quantity} ${tx('qty')} ` : ''}
                        {line.name}
                      </span>
                      <span className={styles.mins}>
                        {line.minutes} {tx('min')}
                      </span>
                      <em>{formatEur(line.price)}</em>
                    </li>
                  ))}
                </ul>
                <div className={styles.foot}>
                  <span>
                    {tx('cost')} <strong>{formatEur(v.price)}</strong>
                  </span>
                  <span>
                    {tx('roi')} <strong>{v.roi == null ? '—' : formatEur(v.roi)}</strong>
                    <span className={styles.mins}>
                      {' '}
                      ({tx('materials')} {formatEur(v.materials)})
                    </span>
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
      {printNode}
    </section>
  )
}

const phaseClass = {
  diagnostics: styles['phase-diagnostics'],
  hygiene: styles['phase-hygiene'],
  nonsurgical: styles['phase-nonsurgical'],
  reeval: styles['phase-reeval'],
  surgical: styles['phase-surgical'],
  reconstructive: styles['phase-reconstructive'],
  spt: styles['phase-spt'],
}

function Chip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean
  onClick: () => void
  children: string
}) {
  return (
    <button type="button" className={styles.chip} aria-pressed={pressed} onClick={onClick}>
      {children}
    </button>
  )
}

function NumField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: string
  min: number
  max: number
  onChange: (v: string) => void
}) {
  return (
    <label className={styles.field}>
      {label}
      <input
        className={styles.num}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}

function procedureMeta(
  id: string,
  getProcedure: PlannerProps['getProcedure'],
): {
  name: string
  timeMinutes: number
  materialEconomic: number
  materialHighend: number
} {
  const fromApp = getProcedure?.(id)
  const fb = procedureById[id]
  return {
    name: fromApp?.name ?? fb?.name ?? id,
    timeMinutes: fromApp?.timeMinutes ?? fb?.timeMinutes ?? 0,
    materialEconomic: fromApp?.materialEconomic ?? fb?.materialEconomic ?? 0,
    materialHighend: fromApp?.materialHighend ?? fb?.materialHighend ?? 0,
  }
}
