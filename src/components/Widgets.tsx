import type { ReactNode } from 'react'
import { formatEur } from '../lib/format'
import type { MarketStats } from '../types'
import { useI18n } from '../i18n'

export function RangeBar({ stats, economic, highend }: { stats: MarketStats; economic: number; highend: number }) {
  const { m } = useI18n()
  if (stats.count === 0) {
    return <p className="range-empty">{m.widgets.noComps}</p>
  }
  const min = stats.min
  const max = Math.max(stats.max, economic, highend, 1)
  const span = max - min || 1
  const pos = (v: number) => `${((Math.min(max, Math.max(min, v)) - min) / span) * 100}%`

  return (
    <div className="range">
      <div className="range-track" aria-hidden="true">
        <span className="range-fill" style={{ left: pos(min), width: `calc(${pos(max)} - ${pos(min)})` }} />
        <span className="range-median" style={{ left: pos(stats.median) }} title={`${m.widgets.median} ${formatEur(stats.median)}`} />
        <span className="range-dot econ" style={{ left: pos(economic) }} title={`${m.pricelist.economic} ${formatEur(economic)}`} />
        <span className="range-dot high" style={{ left: pos(highend) }} title={`${m.pricelist.highend} ${formatEur(highend)}`} />
      </div>
      <p className="range-meta">
        {m.widgets.market} {formatEur(stats.min)}–{formatEur(stats.max)}
        <span>
          {' '}
          · {m.widgets.median} {formatEur(stats.median)}
        </span>
        {stats.ordinaryMedian != null && (
          <span>
            {' '}
            · {m.widgets.ordinary} {formatEur(stats.ordinaryMedian)}
          </span>
        )}
        {stats.specialistMedian != null && (
          <span>
            {' '}
            · {m.widgets.specialist} {formatEur(stats.specialistMedian)}
          </span>
        )}
        <span> · n={stats.count}</span>
      </p>
    </div>
  )
}

export function CountryPills({ stats }: { stats: MarketStats }) {
  const { m } = useI18n()
  const entries = Object.entries(stats.byCountry) as [keyof typeof m.countries, { count: number; median: number }][]
  if (!entries.length) return null
  return (
    <ul className="country-pills">
      {entries
        .sort((a, b) => a[1].median - b[1].median)
        .map(([code, v]) => (
          <li key={code}>
            <span>{m.countries[code]}</span>
            <strong>{formatEur(v.median)}</strong>
          </li>
        ))}
    </ul>
  )
}

export function Modal({
  title,
  children,
  onClose,
}: {
  title: string
  children: ReactNode
  onClose: () => void
}) {
  const { m } = useI18n()
  return (
    <div className="modal-back" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h3 id="modal-title">{title}</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label={m.actions.close}>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
