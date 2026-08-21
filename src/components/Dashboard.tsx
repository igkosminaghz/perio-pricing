import { useMemo, useState } from 'react'
import { clinics } from '../data/clinics'
import { procedures } from '../data/procedures'
import { formatEur } from '../lib/format'
import {
  countryMedianForProcedure,
  filterObservations,
  observationsForProcedure,
  statsForProcedure,
} from '../lib/stats'
import type { ClinicType, CountryCode } from '../types'
import { CountryPills } from './Widgets'
import { RoiPanel, computeRoi } from './RoiPanel'
import { procedureName, useI18n } from '../i18n'
import type { Tier } from '../hooks/useClinicState'

const COUNTRIES: CountryCode[] = ['HR', 'SI', 'IT', 'HU', 'TR', 'AT', 'BA', 'RS']
const TYPES: ClinicType[] = ['ordinary', 'polyclinic', 'perio_oriented', 'benchmark']

export function Dashboard({ priceOf }: { priceOf: (id: string, tier: Tier) => number }) {
  const { locale, m } = useI18n()
  const [countries, setCountries] = useState<CountryCode[]>(COUNTRIES)
  const [types, setTypes] = useState<ClinicType[]>(TYPES)
  const [focusId, setFocusId] = useState('srp-quad')
  const [showOriginal, setShowOriginal] = useState(false)

  const toggle = <T,>(list: T[], value: T, setter: (next: T[]) => void) => {
    setter(list.includes(value) ? list.filter((x) => x !== value) : [...list, value])
  }

  const filter = useMemo(
    () => ({
      countries,
      types,
      includeEstimated: true,
      includeBenchmarks: types.includes('benchmark'),
    }),
    [countries, types],
  )

  const stats = statsForProcedure(focusId, filter)
  const rows = filterObservations(observationsForProcedure(focusId), filter)
  const focus = procedures.find((p) => p.id === focusId)

  const srpByCountry = COUNTRIES.map((c) => ({
    country: c,
    median: countryMedianForProcedure('srp-quad', c),
  })).filter((d) => d.median != null) as { country: CountryCode; median: number }[]
  const chartMax = Math.max(...srpByCountry.map((d) => d.median), 1)

  const ordinaryClinics = clinics.filter((c) => c.type === 'ordinary').length
  const specialistClinics = clinics.filter((c) => c.type === 'perio_oriented').length
  const polyClinics = clinics.filter((c) => c.type === 'polyclinic').length

  const focusPrice = focus ? priceOf(focus.id, 'economic') : 0
  const focusRoi = focus
    ? computeRoi(focusPrice, focus.materialEconomic, focus.timeMinutes)
    : null

  return (
    <section id="market" className="section">
      <header className="section-head">
        <p className="eyebrow">{m.dashboard.eyebrow}</p>
        <h2>{m.dashboard.title}</h2>
        <p>{m.dashboard.intro}</p>
      </header>

      <div className="kpi-grid">
        <article className="kpi">
          <span>{m.dashboard.kpiClinics}</span>
          <strong>{clinics.filter((c) => c.type !== 'benchmark').length}</strong>
          <em>{m.dashboard.kpiClinicsMeta(ordinaryClinics, polyClinics, specialistClinics)}</em>
        </article>
        <article className="kpi">
          <span>{m.dashboard.kpiSrp}</span>
          <strong>{formatEur(statsForProcedure('srp-quad').median)}</strong>
          <em>
            {m.dashboard.kpiSrpMeta(
              formatEur(statsForProcedure('srp-quad').ordinaryMedian ?? 0),
              formatEur(statsForProcedure('srp-quad').specialistMedian ?? 0),
            )}
          </em>
        </article>
        <article className="kpi">
          <span>{m.dashboard.kpiFlap}</span>
          <strong>{formatEur(statsForProcedure('ofd-quad').median)}</strong>
          <em>{m.dashboard.kpiFlapMeta}</em>
        </article>
        <article className="kpi">
          <span>{m.dashboard.kpiGaps}</span>
          <strong>{procedures.filter((p) => p.modernGap).length}</strong>
          <em>{m.dashboard.kpiGapsMeta}</em>
        </article>
      </div>

      <div className="filter-bar no-print">
        <fieldset>
          <legend>{m.dashboard.country}</legend>
          {COUNTRIES.map((c) => (
            <label key={c}>
              <input
                type="checkbox"
                checked={countries.includes(c)}
                onChange={() => toggle(countries, c, setCountries)}
              />
              {m.countries[c]}
            </label>
          ))}
        </fieldset>
        <fieldset>
          <legend>{m.dashboard.clinicType}</legend>
          {TYPES.map((t) => (
            <label key={t}>
              <input type="checkbox" checked={types.includes(t)} onChange={() => toggle(types, t, setTypes)} />
              {m.types[t]}
            </label>
          ))}
        </fieldset>
        <label className="focus-select">
          {m.dashboard.focus}
          <select value={focusId} onChange={(e) => setFocusId(e.target.value)}>
            {procedures.map((p) => (
              <option key={p.id} value={p.id}>
                {procedureName(p, locale, m.procedures)}
              </option>
            ))}
          </select>
        </label>
        <label className="toggle">
          <input type="checkbox" checked={showOriginal} onChange={(e) => setShowOriginal(e.target.checked)} />
          {m.dashboard.showOriginal}
        </label>
      </div>

      <div className="split">
        <article className="card">
          <h3>{m.dashboard.chartTitle}</h3>
          <p className="card-note">{m.dashboard.chartNote}</p>
          <ul className="bar-chart">
            {srpByCountry
              .sort((a, b) => b.median - a.median)
              .map((d) => (
                <li key={d.country}>
                  <span>{m.countries[d.country]}</span>
                  <div className="bar-track">
                    <div className="bar" style={{ width: `${(d.median / chartMax) * 100}%` }} />
                  </div>
                  <strong>{formatEur(d.median)}</strong>
                </li>
              ))}
          </ul>
        </article>
        <article className="card">
          <h3>{focus ? procedureName(focus, locale, m.procedures) : ''}</h3>
          <p className="card-note">{focus?.description}</p>
          <p className="stat-line">
            {stats.count === 0 ? (
              m.dashboard.noObs
            ) : (
              m.dashboard.rangeLine(formatEur(stats.min), formatEur(stats.max), formatEur(stats.median), stats.count)
            )}
          </p>
          <CountryPills stats={stats} />
          {focus && focusRoi && (
            <RoiPanel
              minutes={focus.timeMinutes}
              price={focusPrice}
              material={focus.materialEconomic}
              strong={focus.timeMinutes >= 45 && focusRoi.perHour >= 150}
              compact
            />
          )}
        </article>
      </div>

      <div className="insights">
        <h3>{m.dashboard.insightsTitle}</h3>
        <ul>
          <li>
            <strong>{m.dashboard.insight1Title}</strong> {m.dashboard.insight1}
          </li>
          <li>
            <strong>{m.dashboard.insight2Title}</strong> {m.dashboard.insight2}
          </li>
          <li>
            <strong>{m.dashboard.insight3Title}</strong> {m.dashboard.insight3}
          </li>
          <li>
            <strong>{m.dashboard.insight4Title}</strong> {m.dashboard.insight4}
          </li>
        </ul>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>{m.dashboard.thClinic}</th>
              <th>{m.dashboard.thCity}</th>
              <th>{m.dashboard.thType}</th>
              <th>{m.dashboard.thEur}</th>
              {showOriginal && <th>{m.dashboard.thOriginal}</th>}
              <th>{m.dashboard.thNote}</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={showOriginal ? 6 : 5}>{m.dashboard.noRows}</td>
              </tr>
            )}
            {rows.map((o) => {
              const c = clinics.find((x) => x.id === o.clinicId)
              if (!c) return null
              return (
                <tr key={o.id}>
                  <td>
                    <a href={c.url} target="_blank" rel="noreferrer">
                      {c.name}
                    </a>
                    {o.estimated && <span className="tag">{m.dashboard.estimated}</span>}
                  </td>
                  <td>
                    {c.city}, {m.countries[c.country]}
                  </td>
                  <td>{m.types[c.type]}</td>
                  <td className="num">
                    {formatEur(o.eur)}
                    {o.rangeHighEur != null && o.rangeHighEur !== o.eur && (
                      <span className="muted"> – {formatEur(o.rangeHighEur)}</span>
                    )}
                  </td>
                  {showOriginal && (
                    <td className="num">
                      {o.originalAmount.toLocaleString(locale === 'hr' ? 'hr-HR' : 'de-AT')} {o.originalCurrency}
                    </td>
                  )}
                  <td>{o.note ?? '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
