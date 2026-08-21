import { formatEur } from '../lib/format'
import { useI18n } from '../i18n'
import { roiBreakdown } from '../lib/roi'

/** Adapter over sibling `lib/roi.ts` (price − material) / (minutes / 60). */
export function computeRoi(price: number, material: number, minutes: number): {
  net: number
  minutes: number
  hours: number
  perHour: number
} {
  const b = roiBreakdown(price, material, minutes)
  return { net: b.net, minutes: b.timeMinutes, hours: b.chairHours, perHour: b.eurPerHour }
}

export function median(values: number[]): number {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

export function RoiPanel({
  minutes,
  price,
  material,
  strong,
  compact,
  comparePerHour,
}: {
  minutes: number
  price: number
  material: number
  strong?: boolean
  compact?: boolean
  comparePerHour?: number
}) {
  const { m } = useI18n()
  const roi = computeRoi(price, material, minutes)

  return (
    <aside className={`roi-panel ${compact ? 'is-compact' : ''} ${strong ? 'is-strong' : ''}`}>
      <p className="roi-kicker">
        {m.roi.title}
        {strong && <span className="tag gold">{m.roi.strong}</span>}
      </p>
      <dl>
        <div>
          <dt>{m.roi.minutes}</dt>
          <dd>{minutes > 0 ? `${minutes}` : '—'}</dd>
        </div>
        <div>
          <dt>{m.roi.net}</dt>
          <dd>{formatEur(roi.net)}</dd>
        </div>
        <div>
          <dt>{m.roi.perHour}</dt>
          <dd>{minutes > 0 ? formatEur(roi.perHour) : '—'}</dd>
        </div>
        {comparePerHour != null && minutes > 0 && (
          <div>
            <dt>{m.roi.vsAlone}</dt>
            <dd>{formatEur(comparePerHour)}</dd>
          </div>
        )}
      </dl>
      <p className="roi-note">{m.roi.planning}</p>
    </aside>
  )
}

export function StackRoi({
  minutes,
  stackPerHour,
  alonePerHour,
  strong,
}: {
  minutes: number
  stackPerHour: number
  alonePerHour: number
  strong?: boolean
}) {
  const { m } = useI18n()
  return (
    <aside className={`roi-panel is-compact ${strong ? 'is-strong' : ''}`}>
      <p className="roi-kicker">
        {m.roi.title}
        {strong && <span className="tag gold">{m.roi.strong}</span>}
      </p>
      <dl>
        <div>
          <dt>{m.roi.minutes}</dt>
          <dd>{minutes > 0 ? `${minutes}` : '—'}</dd>
        </div>
        <div>
          <dt>{m.roi.stackHour}</dt>
          <dd>{minutes > 0 ? formatEur(stackPerHour) : '—'}</dd>
        </div>
        <div>
          <dt>{m.roi.itemsHour}</dt>
          <dd>{minutes > 0 ? formatEur(alonePerHour) : '—'}</dd>
        </div>
      </dl>
      <p className="roi-note">{m.roi.planning}</p>
    </aside>
  )
}
