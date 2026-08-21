import { useMemo, useState } from 'react'
import { CATEGORIES } from '../data/procedures'
import type { ClinicState } from '../hooks/useClinicState'
import { stackTotals } from '../hooks/useClinicState'
import { formatEur } from '../lib/format'
import { statsForProcedure } from '../lib/stats'
import type { CategoryId, Procedure, ProcedureStack, StackKind } from '../types'
import { Modal, RangeBar } from './Widgets'
import { RoiPanel } from './RoiPanel'
import { StackRoi } from './RoiPanel'
import { compareChairHourRoi } from '../lib/roi'
import { procedureName, useI18n } from '../i18n'

type State = ClinicState

export function Pricelist({ app }: { app: State }) {
  const { locale, m } = useI18n()
  const [query, setQuery] = useState('')
  const [adding, setAdding] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent')
  const [discountValue, setDiscountValue] = useState(10)
  const [stackName, setStackName] = useState('')

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase()
    return CATEGORIES.map((cat) => {
      const items = app.allProcedures.filter((p) => {
        if (p.category !== cat.id) return false
        if (!q) return true
        const hrName = procedureName(p, locale, m.procedures)
        return (
          p.name.toLowerCase().includes(q) ||
          hrName.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.unit.toLowerCase().includes(q)
        )
      })
      return { cat, items }
    }).filter((g) => g.items.length > 0)
  }, [app.allProcedures, query, locale, m.procedures])

  const sumE = app.allProcedures.reduce((s, p) => s + app.priceOf(p.id, 'economic'), 0)
  const sumH = app.allProcedures.reduce((s, p) => s + app.priceOf(p.id, 'highend'), 0)
  const edited = app.allProcedures.filter((p) => app.isEdited(p.id)).length

  const strongIds = useMemo(() => {
    const ranked = compareChairHourRoi(
      app.allProcedures.map((p) => ({
        id: p.id,
        name: p.name,
        price: app.priceOf(p.id, 'economic'),
        material: p.materialEconomic,
        timeMinutes: p.timeMinutes,
      })),
    )
    return new Set(ranked.filter((r) => r.longVisitHighYield).map((r) => r.id))
  }, [app.allProcedures, app.priceOf])

  const draftStack: ProcedureStack = {
    id: 'draft',
    name: stackName,
    kind: 'same-session',
    procedureIds: selected,
    discountType,
    discountValue,
  }
  const liveE = selected.length ? stackTotals(draftStack, app.allProcedures, app.priceOf, 'economic') : null
  const liveH = selected.length ? stackTotals(draftStack, app.allProcedures, app.priceOf, 'highend') : null

  const toggleSelect = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  const saveStack = (kind: StackKind) => {
    if (!selected.length) return
    const defaultName = kind === 'same-session' ? m.stack.nameSame : m.stack.nameSeq
    app.addStack({
      id: `stack-${Date.now()}`,
      name: stackName.trim() || defaultName,
      kind,
      procedureIds: [...selected],
      discountType,
      discountValue: kind === 'sequential' && discountValue === 10 ? 0 : discountValue,
    })
    setSelected([])
    setStackName('')
  }

  return (
    <section id="pricelist" className="section">
      <header className="section-head">
        <p className="eyebrow">{m.pricelist.eyebrow}</p>
        <h2>{m.pricelist.title}</h2>
        <p>{m.pricelist.intro}</p>
      </header>

      <div className="identity-card no-print">
        <label>
          {m.pricelist.clinicName}
          <input
            value={app.state.identity.name}
            onChange={(e) => app.setIdentity({ name: e.target.value })}
          />
        </label>
        <label>
          {m.pricelist.city}
          <input
            value={app.state.identity.city}
            onChange={(e) => app.setIdentity({ city: e.target.value })}
          />
        </label>
        <label className="grow">
          {m.pricelist.tagline}
          <input
            value={app.state.identity.tagline}
            onChange={(e) => app.setIdentity({ tagline: e.target.value })}
          />
        </label>
      </div>

      <div className="pricelist-toolbar no-print">
        <input
          className="search"
          placeholder={m.pricelist.search}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="button" className="ghost-btn" onClick={() => setAdding(true)}>
          {m.pricelist.add}
        </button>
        <label className="toggle">
          <input type="checkbox" checked={showNotes} onChange={(e) => setShowNotes(e.target.checked)} />
          {m.pricelist.showNotes}
        </label>
        <div className="running-total">
          <span>
            {m.pricelist.listTotal} <strong>{formatEur(sumE)}</strong>
          </span>
          <span>
            {m.pricelist.highend} <strong>{formatEur(sumH)}</strong>
          </span>
          <span>{m.pricelist.edited(edited)}</span>
        </div>
      </div>

      <div className="col-legend">
        <span className="legend-econ">{m.pricelist.legendEcon}</span>
        <span className="legend-high">{m.pricelist.legendHigh}</span>
      </div>

      {grouped.map(({ cat, items }) => {
        const collapsed = app.state.collapsed[cat.id]
        const labels = m.categories[cat.id]
        return (
          <div key={cat.id} className="cat-block">
            <button
              type="button"
              className="cat-toggle"
              onClick={() => app.toggleCollapsed(cat.id)}
              aria-expanded={!collapsed}
            >
              <span>
                {labels.label}
                <em>{labels.blurb}</em>
              </span>
              <span className="chevron">{collapsed ? '+' : '–'}</span>
            </button>
            {!collapsed &&
              items.map((p) => (
                <ProcedureRow
                  key={p.id}
                  proc={p}
                  app={app}
                  showNotes={showNotes}
                  selected={selected.includes(p.id)}
                  onToggle={() => toggleSelect(p.id)}
                  strong={strongIds.has(p.id)}
                />
              ))}
          </div>
        )
      })}

      {selected.length > 0 && liveE && liveH && (
        <div className="stack-dock no-print">
          <div className="stack-dock-copy">
            <p className="eyebrow">{m.stack.selected(selected.length)}</p>
            <label>
              {m.stack.name}
              <input
                value={stackName}
                onChange={(e) => setStackName(e.target.value)}
                placeholder={m.stack.nameSame}
              />
            </label>
          </div>
          <div className="stack-dock-math">
            <p>
              {m.stack.liveTotal}
              <strong>
                {formatEur(liveE.netPrice)} / {formatEur(liveH.netPrice)}
              </strong>
            </p>
            <p>
              {m.stack.timeSum} <strong>{liveE.minutes} min</strong>
            </p>
            <StackRoi
              minutes={liveE.minutes}
              stackPerHour={liveE.perHour}
              alonePerHour={liveE.alonePerHour}
              strong={liveE.minutes >= 45 && liveE.perHour > liveE.alonePerHour}
            />
          </div>
          <div className="stack-dock-actions">
            <label>
              {m.stack.discount}
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as 'percent' | 'fixed')}
              >
                <option value="percent">{m.stack.percent}</option>
                <option value="fixed">{m.stack.fixed}</option>
              </select>
            </label>
            <label>
              {discountType === 'percent' ? '%' : '€'}
              <input
                type="number"
                min={0}
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
              />
            </label>
            <button type="button" className="gold-btn" onClick={() => saveStack('same-session')}>
              {m.stack.saveSame}
            </button>
            <button type="button" className="ghost-btn" onClick={() => saveStack('sequential')}>
              {m.stack.saveSeq}
            </button>
            <button type="button" className="text-btn" onClick={() => setSelected([])}>
              {m.actions.cancel}
            </button>
          </div>
        </div>
      )}

      {adding && (
        <AddProcedureForm
          onClose={() => setAdding(false)}
          onSave={(p) => {
            app.addProcedure(p)
            setAdding(false)
          }}
        />
      )}
    </section>
  )
}

function ProcedureRow({
  proc,
  app,
  showNotes,
  selected,
  onToggle,
  strong,
}: {
  proc: Procedure
  app: State
  showNotes: boolean
  selected: boolean
  onToggle: () => void
  strong: boolean
}) {
  const { locale, m } = useI18n()
  const stats = statsForProcedure(proc.id)
  const economic = app.priceOf(proc.id, 'economic')
  const highend = app.priceOf(proc.id, 'highend')
  const edited = app.isEdited(proc.id)

  return (
    <article className={`proc-row ${edited ? 'is-edited' : ''} ${strong ? 'is-roi-strong' : ''} ${selected ? 'is-picked' : ''}`}>
      <label className="stack-check no-print">
        <input type="checkbox" checked={selected} onChange={onToggle} aria-label={m.pricelist.select} />
      </label>
      <div className="proc-copy">
        <h3>
          {procedureName(proc, locale, m.procedures)}
          {proc.modernGap && <span className="tag gold">{m.pricelist.modernGap}</span>}
          {proc.cuttingEdge && <span className="tag gold">{m.pricelist.cuttingEdge}</span>}
          {proc.notDoneInRegion && <span className="tag">{m.pricelist.notDoneInRegion}</span>}
          {proc.estimatedRecommend && <span className="tag">{m.pricelist.estimatedFee}</span>}
          {proc.custom && <span className="tag">{m.pricelist.custom}</span>}
        </h3>
        <p className="unit">
          {proc.unit}
          {proc.timeMinutes > 0 && <> · {m.pricelist.minutes(proc.timeMinutes)}</>}
        </p>
        {showNotes && <p className="proc-note">{proc.description}</p>}
        <RangeBar stats={stats} economic={economic} highend={highend} />
        <div className="roi-pair">
          <RoiPanel
            minutes={proc.timeMinutes}
            price={economic}
            material={proc.materialEconomic}
            strong={strong}
            compact
          />
          <RoiPanel
            minutes={proc.timeMinutes}
            price={highend}
            material={proc.materialHighend}
            strong={strong}
            compact
          />
        </div>
      </div>
      <label className="price-field econ">
        <span>{m.pricelist.economic}</span>
        <span className="prefix">€</span>
        <input
          type="number"
          min={0}
          step={5}
          value={economic}
          onChange={(e) => app.setPrice(proc.id, 'economic', Number(e.target.value))}
        />
      </label>
      <label className="price-field high">
        <span>{m.pricelist.highend}</span>
        <span className="prefix">€</span>
        <input
          type="number"
          min={0}
          step={5}
          value={highend}
          onChange={(e) => app.setPrice(proc.id, 'highend', Number(e.target.value))}
        />
      </label>
      <div className="row-actions no-print">
        <button type="button" className="text-btn" onClick={() => app.resetPrice(proc.id)} disabled={!edited}>
          {m.pricelist.reset}
        </button>
        {proc.custom && (
          <button type="button" className="text-btn danger" onClick={() => app.removeProcedure(proc.id)}>
            {m.pricelist.remove}
          </button>
        )}
      </div>
    </article>
  )
}

function AddProcedureForm({
  onClose,
  onSave,
}: {
  onClose: () => void
  onSave: (p: Procedure) => void
}) {
  const { m } = useI18n()
  const [name, setName] = useState('')
  const [unit, setUnit] = useState('session')
  const [category, setCategory] = useState<CategoryId>('nonsurgical')
  const [description, setDescription] = useState('')
  const [economic, setEconomic] = useState(100)
  const [highend, setHighend] = useState(150)
  const [minutes, setMinutes] = useState(45)
  const [matE, setMatE] = useState(10)
  const [matH, setMatH] = useState(15)

  return (
    <Modal title={m.pricelist.addTitle} onClose={onClose}>
      <form
        className="form-grid"
        onSubmit={(e) => {
          e.preventDefault()
          if (!name.trim()) return
          onSave({
            id: `custom-${Date.now()}`,
            name: name.trim(),
            category,
            unit: unit.trim() || 'session',
            description: description.trim() || name.trim(),
            modernGap: false,
            estimatedRecommend: false,
            timeMinutes: minutes,
            materialEconomic: matE,
            materialHighend: matH,
            recommendedEconomic: economic,
            recommendedHighend: highend,
            custom: true,
          })
        }}
      >
        <label>
          {m.pricelist.name}
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          {m.pricelist.unit}
          <input value={unit} onChange={(e) => setUnit(e.target.value)} />
        </label>
        <label>
          {m.pricelist.category}
          <select value={category} onChange={(e) => setCategory(e.target.value as CategoryId)}>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {m.categories[c.id].label}
              </option>
            ))}
          </select>
        </label>
        <label>
          {m.pricelist.minutesLabel}
          <input type="number" min={0} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} />
        </label>
        <label className="wide">
          {m.pricelist.description}
          <input value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <label>
          {m.pricelist.economicEur}
          <input type="number" min={0} value={economic} onChange={(e) => setEconomic(Number(e.target.value))} />
        </label>
        <label>
          {m.pricelist.highendEur}
          <input type="number" min={0} value={highend} onChange={(e) => setHighend(Number(e.target.value))} />
        </label>
        <label>
          {m.pricelist.materialE}
          <input type="number" min={0} value={matE} onChange={(e) => setMatE(Number(e.target.value))} />
        </label>
        <label>
          {m.pricelist.materialH}
          <input type="number" min={0} value={matH} onChange={(e) => setMatH(Number(e.target.value))} />
        </label>
        <div className="form-actions">
          <button type="button" className="ghost-btn" onClick={onClose}>
            {m.actions.cancel}
          </button>
          <button type="submit" className="gold-btn">
            {m.pricelist.addToList}
          </button>
        </div>
      </form>
    </Modal>
  )
}
