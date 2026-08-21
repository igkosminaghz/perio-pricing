import type { CategoryId, ClinicType, CountryCode, MarketStats, Observation } from '../types'
import { clinics, clinicById } from '../data/clinics'
import { observations } from '../data/observations'

export function median(values: number[]): number | null {
  if (values.length === 0) return null
  const s = [...values].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 === 1 ? s[mid]! : Math.round(((s[mid - 1]! + s[mid]!) / 2) * 100) / 100
}

/** `p` in 0–1. Linear interpolation between order statistics. */
export function percentile(values: number[], p: number): number | null {
  if (values.length === 0) return null
  const s = [...values].sort((a, b) => a - b)
  if (s.length === 1) return s[0]!
  const clamped = Math.min(1, Math.max(0, p))
  const idx = clamped * (s.length - 1)
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  if (lo === hi) return s[lo]!
  const w = idx - lo
  return Math.round((s[lo]! * (1 - w) + s[hi]! * w) * 100) / 100
}

export interface ObservationFilter {
  countries?: CountryCode[]
  types?: ClinicType[]
  includeEstimated?: boolean
  includeBenchmarks?: boolean
}

export function filterObservations(
  list: Observation[],
  filter: ObservationFilter,
): Observation[] {
  return list.filter((o) => {
    const clinic = clinicById[o.clinicId]
    if (!clinic) return false
    if (!filter.includeBenchmarks && clinic.type === 'benchmark') return false
    if (!filter.includeEstimated && o.estimated) return false
    if (filter.countries?.length && !filter.countries.includes(clinic.country)) return false
    if (filter.types?.length && !filter.types.includes(clinic.type)) return false
    return true
  })
}

function specialistLike(type: ClinicType): boolean {
  return type === 'perio_oriented' || type === 'polyclinic'
}

export function statsForProcedure(
  procedureId: string,
  filter: ObservationFilter = { includeEstimated: true, includeBenchmarks: true },
): MarketStats {
  const rows = filterObservations(
    observations.filter((o) => o.procedureId === procedureId),
    filter,
  )
  const values = rows.map((o) => o.eur)
  const ordinary = rows
    .filter((o) => clinicById[o.clinicId]?.type === 'ordinary')
    .map((o) => o.eur)
  const specialist = rows
    .filter((o) => specialistLike(clinicById[o.clinicId]?.type ?? 'ordinary'))
    .map((o) => o.eur)

  const byCountry: MarketStats['byCountry'] = {}
  const countries = new Set(rows.map((o) => clinicById[o.clinicId]!.country))
  for (const c of countries) {
    const nums = rows.filter((o) => clinicById[o.clinicId]?.country === c).map((o) => o.eur)
    const m = median(nums)
    if (m != null) byCountry[c] = { count: nums.length, median: m }
  }

  return {
    count: values.length,
    min: values.length ? Math.min(...values) : 0,
    max: values.length ? Math.max(...values) : 0,
    median: median(values) ?? 0,
    ordinaryMedian: median(ordinary),
    specialistMedian: median(specialist),
    byCountry,
  }
}

export function countryMedianForProcedure(
  procedureId: string,
  country: CountryCode,
): number | null {
  const values = observations
    .filter((o) => o.procedureId === procedureId && clinicById[o.clinicId]?.country === country)
    .map((o) => o.eur)
  return median(values)
}

export const SPECIALIST_TYPES: ClinicType[] = ['perio_oriented', 'polyclinic']

export function clinicCountByCountry(): Record<CountryCode, number> {
  const acc = {} as Record<CountryCode, number>
  for (const c of clinics) {
    if (c.type === 'benchmark') continue
    acc[c.country] = (acc[c.country] ?? 0) + 1
  }
  return acc
}

export function observationsForProcedure(procedureId: string): Observation[] {
  return observations.filter((o) => o.procedureId === procedureId)
}

export const CATEGORY_IDS: CategoryId[] = [
  'diagnostics',
  'hygiene',
  'nonsurgical',
  'surgical',
  'regenerative',
  'mucogingival',
  'implants',
  'adjuncts',
]
