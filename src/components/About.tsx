import { clinics } from '../data/clinics'
import { procedures } from '../data/procedures'
import { FX_NOTES } from '../lib/format'
import type { ClinicState } from '../hooks/useClinicState'
import { bundleTotals } from '../hooks/useClinicState'
import { formatEur } from '../lib/format'
import { CATEGORIES } from '../data/procedures'
import { procedureName, useI18n } from '../i18n'

export function AboutModel() {
  const { m } = useI18n()
  return (
    <section id="model" className="section">
      <header className="section-head">
        <p className="eyebrow">{m.about.eyebrow}</p>
        <h2>{m.about.title}</h2>
      </header>
      <div className="prose-grid">
        <article className="card">
          <h3>{m.about.posTitle}</h3>
          <p>{m.about.pos1}</p>
          <p>{m.about.pos2}</p>
          <p>{m.about.pos3}</p>
        </article>
        <article className="card">
          <h3>{m.about.ohTitle}</h3>
          <ul className="plain">
            <li>{m.about.oh1}</li>
            <li>{m.about.oh2}</li>
            <li>{m.about.oh3}</li>
            <li>{m.about.oh4}</li>
            <li>{m.about.oh5}</li>
            <li>{m.about.oh6}</li>
          </ul>
        </article>
        <article className="card">
          <h3>{m.about.notTitle}</h3>
          <p>{m.about.not1}</p>
          <p>
            FX: {FX_NOTES.HUF} {FX_NOTES.BAM} {FX_NOTES.RSD} Date of research: {FX_NOTES.asOf}.
          </p>
        </article>
      </div>
    </section>
  )
}

export function Sources() {
  const { m } = useI18n()
  return (
    <section id="sources" className="section">
      <header className="section-head">
        <p className="eyebrow">{m.sources.eyebrow}</p>
        <h2>{m.sources.title}</h2>
        <p>{m.sources.intro}</p>
      </header>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>{m.sources.thClinic}</th>
              <th>{m.sources.thCity}</th>
              <th>{m.sources.thCountry}</th>
              <th>{m.sources.thType}</th>
              <th>{m.sources.thAccessed}</th>
              <th>{m.sources.thNotes}</th>
            </tr>
          </thead>
          <tbody>
            {clinics.map((c) => (
              <tr key={c.id}>
                <td>
                  <a href={c.url} target="_blank" rel="noreferrer">
                    {c.name}
                  </a>
                </td>
                <td>{c.city}</td>
                <td>{m.countries[c.country]}</td>
                <td>{m.types[c.type]}</td>
                <td>{c.accessed}</td>
                <td>{c.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export function PrintSheet({ app }: { app: ClinicState }) {
  const { locale, m } = useI18n()
  const date = new Date().toLocaleDateString(locale === 'hr' ? 'hr-HR' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return (
    <section className="print-sheet" aria-label={m.print.pricelist}>
      <header className="print-hero">
        <p className="eyebrow">{app.state.identity.city}</p>
        <h1>{app.state.identity.name}</h1>
        <p>{app.state.identity.tagline}</p>
        <p className="print-date">
          {m.print.pricelist} · {date} · {m.print.feesInEuro}
        </p>
      </header>
      <div className="print-legend">
        <span>{m.print.legendE}</span>
        <span>{m.print.legendH}</span>
      </div>
      {CATEGORIES.map((cat) => {
        const items = app.allProcedures.filter((p) => p.category === cat.id)
        if (!items.length) return null
        return (
          <div key={cat.id} className="print-cat">
            <h2>{m.categories[cat.id].label}</h2>
            <table>
              <thead>
                <tr>
                  <th>{m.print.procedure}</th>
                  <th>{m.print.unit}</th>
                  <th>{m.print.economic}</th>
                  <th>{m.print.highend}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id}>
                    <td>
                      {procedureName(p, locale, m.procedures)}
                      <small>{p.description}</small>
                    </td>
                    <td>{p.unit}</td>
                    <td>{formatEur(app.priceOf(p.id, 'economic'))}</td>
                    <td>{formatEur(app.priceOf(p.id, 'highend'))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      })}
      <div className="print-cat">
        <h2>{m.print.pathways}</h2>
        <table>
          <thead>
            <tr>
              <th>{m.print.pathway}</th>
              <th>{m.print.includes}</th>
              <th>{m.print.economic}</th>
              <th>{m.print.highend}</th>
            </tr>
          </thead>
          <tbody>
            {app.state.bundles.map((b) => {
              const t = bundleTotals(b, app.priceOf)
              return (
                <tr key={b.id}>
                  <td>
                    {b.name}
                    <small>{b.description}</small>
                  </td>
                  <td>
                    {m.print.items(b.procedureIds.length)}
                    {b.discountType === 'percent'
                      ? ` · ${b.discountValue}% ${m.print.bundle}`
                      : ` · ${formatEur(b.discountValue)} ${m.print.off}`}
                  </td>
                  <td>{formatEur(t.economicNet)}</td>
                  <td>{formatEur(t.highendNet)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <footer className="print-foot">
        <p>
          {m.print.foot(procedures.length)} {m.disclaimer}
        </p>
      </footer>
    </section>
  )
}

export function Footer() {
  const { m } = useI18n()
  return (
    <footer className="site-footer no-print">
      <p>{m.footer}</p>
      <p className="disclaimer-foot">{m.disclaimer}</p>
    </footer>
  )
}
