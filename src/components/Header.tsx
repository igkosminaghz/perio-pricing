import { clinics } from '../data/clinics'
import { observations } from '../data/observations'
import { procedures } from '../data/procedures'
import { useI18n } from '../i18n'
import type { AppMode, Locale } from '../types'

export function Header({
  onPrint,
  onExport,
  onImport,
  onReset,
  mode,
  setMode,
}: {
  onPrint: () => void
  onExport: () => void
  onImport: (file: File) => void
  onReset: () => void
  mode: AppMode
  setMode: (mode: AppMode) => void
}) {
  const { locale, setLocale, m } = useI18n()

  return (
    <header className="site-header no-print">
      <a className="brand" href="#top">
        <span className="brand-mark" aria-hidden="true" />
        <span>
          <strong>{m.brand.title}</strong>
          <em>{m.brand.tag}</em>
        </span>
      </a>

      <div className="header-toggles">
        <div className="seg mode-seg" role="tablist" aria-label={m.modes.atlas}>
          {(
            [
              ['atlas', m.modes.atlas],
              ['planner', m.modes.planner],
              ['membership', m.modes.membership],
            ] as [AppMode, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={mode === id}
              className={mode === id ? 'is-on' : ''}
              onClick={() => setMode(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="seg lang-seg" role="group" aria-label={m.lang.label}>
          {(['hr', 'en'] as Locale[]).map((code) => (
            <button
              key={code}
              type="button"
              className={locale === code ? 'is-on' : ''}
              onClick={() => setLocale(code)}
            >
              {m.lang[code]}
            </button>
          ))}
        </div>
      </div>

      {mode === 'atlas' ? (
        <nav className="site-nav">
          <a href="#market">{m.nav.market}</a>
          <a href="#pricelist">{m.nav.pricelist}</a>
          <a href="#pathways">{m.nav.pathways}</a>
          <a href="#stacks">{m.nav.stacks}</a>
          <a href="#model">{m.nav.model}</a>
          <a href="#sources">{m.nav.sources}</a>
        </nav>
      ) : (
        <nav className="site-nav site-nav-quiet" aria-hidden="true" />
      )}

      <div className="header-actions">
        <label className="ghost-btn">
          {m.actions.importJson}
          <input
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onImport(file)
              e.target.value = ''
            }}
          />
        </label>
        <button type="button" className="ghost-btn" onClick={onExport}>
          {m.actions.exportJson}
        </button>
        <button type="button" className="ghost-btn" onClick={onReset}>
          {m.actions.reset}
        </button>
        <button type="button" className="gold-btn" onClick={onPrint}>
          {m.actions.print}
        </button>
      </div>
      <p className="source-count">
        {m.sourceCount(
          clinics.filter((c) => c.type !== 'benchmark').length,
          observations.length,
          procedures.length,
        )}
        <span className="disclaimer-inline"> · {m.disclaimer}</span>
      </p>
    </header>
  )
}

export function Hero() {
  const { m } = useI18n()
  return (
    <section className="hero" id="top">
      <p className="eyebrow">{m.hero.eyebrow}</p>
      <h1>
        {m.hero.titleBefore}
        <em>{m.hero.titleEm}</em>
      </h1>
      <p className="lede">{m.hero.lede}</p>
      <div className="hero-pills">
        <span>{m.hero.pillEdit}</span>
        <span>{m.hero.pillStack}</span>
        <span>{m.hero.pillPrint}</span>
        <span>{m.hero.pillSaved}</span>
      </div>
    </section>
  )
}
