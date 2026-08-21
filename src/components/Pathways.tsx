import { useState } from 'react'
import type { ClinicState } from '../hooks/useClinicState'
import { bundleTotals, stackTotals } from '../hooks/useClinicState'
import { formatEur } from '../lib/format'
import type { BundleDef, ProcedureStack } from '../types'
import { Modal } from './Widgets'
import { RoiPanel, StackRoi } from './RoiPanel'
import { procedureName, useI18n } from '../i18n'

type State = ClinicState

export function Pathways({ app }: { app: State }) {
  const { locale, m } = useI18n()
  const [editing, setEditing] = useState<BundleDef | null>(null)
  const [creating, setCreating] = useState(false)

  const save = (bundle: BundleDef) => {
    const exists = app.state.bundles.some((b) => b.id === bundle.id)
    app.setBundles(exists ? app.state.bundles.map((b) => (b.id === bundle.id ? bundle : b)) : [...app.state.bundles, bundle])
    setEditing(null)
    setCreating(false)
  }

  const labelOf = (id: string) => {
    const proc = app.allProcedures.find((p) => p.id === id)
    return proc ? procedureName(proc, locale, m.procedures) : id
  }

  return (
    <>
      <section id="pathways" className="section">
        <header className="section-head">
          <p className="eyebrow">{m.pathways.eyebrow}</p>
          <h2>{m.pathways.title}</h2>
          <p>{m.pathways.intro}</p>
        </header>
        <p className="no-print">
          <button type="button" className="gold-btn" onClick={() => setCreating(true)}>
            {m.pathways.create}
          </button>
        </p>
        <div className="bundle-grid">
          {app.state.bundles.map((b) => {
            const t = bundleTotals(b, app.priceOf)
            const discountLabel =
              b.discountType === 'percent' ? `${b.discountValue}%` : formatEur(b.discountValue)
            const minutes = b.procedureIds.reduce((sum, id) => {
              const p = app.allProcedures.find((x) => x.id === id)
              return sum + (p?.timeMinutes ?? 0)
            }, 0)
            const materialsE = b.procedureIds.reduce((sum, id) => {
              const p = app.allProcedures.find((x) => x.id === id)
              return sum + (p?.materialEconomic ?? 0)
            }, 0)
            return (
              <article key={b.id} className="bundle-card">
                <p className="eyebrow">{b.pathway}</p>
                <h3>{b.name}</h3>
                <p>{b.description}</p>
                <ul className="bundle-lines">
                  {tally(b.procedureIds).map(([id, count]) => (
                    <li key={id}>
                      <span>
                        {count > 1 ? `${count} × ` : ''}
                        {labelOf(id)}
                      </span>
                      <span>
                        {formatEur(app.priceOf(id, 'economic') * count)}
                        <em> / {formatEur(app.priceOf(id, 'highend') * count)}</em>
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="bundle-totals">
                  <div>
                    <span>{m.pathways.economic}</span>
                    <strong>{formatEur(t.economicNet)}</strong>
                    <em>
                      {m.pathways.was} {formatEur(t.listE)} · {m.pathways.save} {discountLabel}
                    </em>
                  </div>
                  <div>
                    <span>{m.pathways.highend}</span>
                    <strong>{formatEur(t.highendNet)}</strong>
                    <em>
                      {m.pathways.was} {formatEur(t.listH)}
                    </em>
                  </div>
                </div>
                <RoiPanel minutes={minutes} price={t.economicNet} material={materialsE} compact />
                <div className="row-actions no-print">
                  <button type="button" className="text-btn" onClick={() => setEditing(b)}>
                    {m.pathways.edit}
                  </button>
                  {b.custom && (
                    <button
                      type="button"
                      className="text-btn danger"
                      onClick={() => app.setBundles(app.state.bundles.filter((x) => x.id !== b.id))}
                    >
                      {m.pathways.remove}
                    </button>
                  )}
                </div>
              </article>
            )
          })}
        </div>
        {(editing || creating) && (
          <BundleEditor
            initial={
              editing ?? {
                id: `bundle-${Date.now()}`,
                name: '',
                description: '',
                pathway: m.pathways.customPathway,
                procedureIds: [],
                discountType: 'percent',
                discountValue: 10,
                custom: true,
              }
            }
            procedures={app.allProcedures}
            onClose={() => {
              setEditing(null)
              setCreating(false)
            }}
            onSave={save}
          />
        )}
      </section>

      <section id="stacks" className="section">
        <header className="section-head">
          <p className="eyebrow">{m.nav.stacks}</p>
          <h2>{m.stack.savedTitle}</h2>
          <p>{m.stack.savedIntro}</p>
        </header>
        {app.state.stacks.length === 0 ? (
          <p className="lede">{m.stack.empty}</p>
        ) : (
          <div className="bundle-grid">
            {app.state.stacks.map((stack) => (
              <StackCard key={stack.id} stack={stack} app={app} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}

function StackCard({ stack, app }: { stack: ProcedureStack; app: State }) {
  const { locale, m } = useI18n()
  const e = stackTotals(stack, app.allProcedures, app.priceOf, 'economic')
  const h = stackTotals(stack, app.allProcedures, app.priceOf, 'highend')
  const discountLabel =
    stack.discountType === 'percent' ? `${stack.discountValue}%` : formatEur(stack.discountValue)

  return (
    <article className="bundle-card stack-card">
      <p className="eyebrow">{stack.kind === 'same-session' ? m.stack.kindSame : m.stack.kindSeq}</p>
      <h3>{stack.name}</h3>
      <ul className="bundle-lines">
        {tally(stack.procedureIds).map(([id, count]) => {
          const proc = app.allProcedures.find((p) => p.id === id)
          return (
            <li key={id}>
              <span>
                {count > 1 ? `${count} × ` : ''}
                {proc ? procedureName(proc, locale, m.procedures) : id}
              </span>
              <span>
                {formatEur(app.priceOf(id, 'economic') * count)}
                <em> / {formatEur(app.priceOf(id, 'highend') * count)}</em>
              </span>
            </li>
          )
        })}
      </ul>
      <div className="bundle-totals">
        <div>
          <span>{m.pathways.economic}</span>
          <strong>{formatEur(e.netPrice)}</strong>
          <em>
            {m.pathways.was} {formatEur(e.list)} · {m.pathways.save} {discountLabel}
          </em>
        </div>
        <div>
          <span>{m.pathways.highend}</span>
          <strong>{formatEur(h.netPrice)}</strong>
          <em>
            {m.pathways.was} {formatEur(h.list)}
          </em>
        </div>
      </div>
      <p className="card-note">{m.stack.vsAlone}</p>
      <StackRoi
        minutes={e.minutes}
        stackPerHour={e.perHour}
        alonePerHour={e.alonePerHour}
        strong={e.minutes >= 45 && e.perHour >= e.alonePerHour}
      />
      <div className="row-actions no-print">
        <button type="button" className="text-btn danger" onClick={() => app.removeStack(stack.id)}>
          {m.stack.remove}
        </button>
      </div>
    </article>
  )
}

function tally(ids: string[]): [string, number][] {
  const map = new Map<string, number>()
  for (const id of ids) map.set(id, (map.get(id) ?? 0) + 1)
  return [...map.entries()]
}

function BundleEditor({
  initial,
  procedures,
  onClose,
  onSave,
}: {
  initial: BundleDef
  procedures: State['allProcedures']
  onClose: () => void
  onSave: (b: BundleDef) => void
}) {
  const { locale, m } = useI18n()
  const [name, setName] = useState(initial.name)
  const [description, setDescription] = useState(initial.description)
  const [pathway, setPathway] = useState(initial.pathway)
  const [discountType, setDiscountType] = useState(initial.discountType)
  const [discountValue, setDiscountValue] = useState(initial.discountValue)
  const [selected, setSelected] = useState<string[]>(initial.procedureIds)

  const add = (id: string) => setSelected((s) => [...s, id])
  const removeOne = (index: number) => setSelected((s) => s.filter((_, i) => i !== index))

  return (
    <Modal title={initial.custom && !initial.name ? m.pathways.newTitle : m.pathways.editTitle} onClose={onClose}>
      <form
        className="form-grid"
        onSubmit={(e) => {
          e.preventDefault()
          if (!name.trim() || selected.length === 0) return
          onSave({
            ...initial,
            name: name.trim(),
            description: description.trim(),
            pathway: pathway.trim() || m.pathways.customPathway,
            procedureIds: selected,
            discountType,
            discountValue,
          })
        }}
      >
        <label className="wide">
          {m.pathways.name}
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          {m.pathways.pathway}
          <input value={pathway} onChange={(e) => setPathway(e.target.value)} />
        </label>
        <label>
          {m.pathways.discountType}
          <select value={discountType} onChange={(e) => setDiscountType(e.target.value as BundleDef['discountType'])}>
            <option value="percent">{m.pathways.percent}</option>
            <option value="fixed">{m.pathways.fixed}</option>
          </select>
        </label>
        <label>
          {m.pathways.discountValue}
          <input
            type="number"
            min={0}
            value={discountValue}
            onChange={(e) => setDiscountValue(Number(e.target.value))}
          />
        </label>
        <label className="wide">
          {m.pathways.description}
          <input value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <label className="wide">
          {m.pathways.addProc}
          <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) add(e.target.value)
              e.target.value = ''
            }}
          >
            <option value="">{m.pathways.choose}</option>
            {procedures.map((p) => (
              <option key={p.id} value={p.id}>
                {procedureName(p, locale, m.procedures)}
              </option>
            ))}
          </select>
        </label>
        <ul className="picked-list wide">
          {selected.map((id, i) => (
            <li key={`${id}-${i}`}>
              {procedureName(
                procedures.find((p) => p.id === id) ?? { id, name: id },
                locale,
                m.procedures,
              )}
              <button type="button" className="text-btn" onClick={() => removeOne(i)}>
                {m.pathways.remove}
              </button>
            </li>
          ))}
        </ul>
        <div className="form-actions">
          <button type="button" className="ghost-btn" onClick={onClose}>
            {m.actions.cancel}
          </button>
          <button type="submit" className="gold-btn">
            {m.pathways.saveCombo}
          </button>
        </div>
      </form>
    </Modal>
  )
}
