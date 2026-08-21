/**
 * Recommended Economic / High-end fees for a high-end SPECIALIST periodontal
 * clinic in Croatia: widest modern catalogue, premium quality, not luxury-max.
 *
 * Numbers stay USER-EDITABLE in the UI (localStorage overrides). This module
 * only sets the recommended defaults.
 *
 * ---------------------------------------------------------------------------
 * Assumptions (buying power / PPP) — documented for audit
 * ---------------------------------------------------------------------------
 * Eurostat AIC per capita in PPS, 2024 (EU-27 = 100), DZS NR-2025-2-3:
 *   HR 79, SI 86, IT 98, HU 73, TR 71, AT 114.
 * Eurostat / SSB price-level indices, household consumption 2025 (EU-27 = 100):
 *   HR 78.4, SI 89.3, IT 97.1, HU 77.5, TR 59.6, AT 113.0.
 * Croatian SILC 2025 (DZS ZUDP-2026-1-1): at-risk-of-poverty threshold for a
 *   one-person household = €9,034 = 60% of median equivalised disposable income
 *   → national median ≈ €15,057. Mean equivalised disposable income €16,097.
 *
 * Relative material welfare vs Italy (AIC): 79/98 ≈ 0.81. We therefore convert
 * Italian (and other richer-market) specialist fees into HR-equivalent by
 * multiplying by min(1, AIC_HR / AIC_country) so Croatian patients are not
 * quoted Milan prices. We never inflate cheaper markets (HU/TR) up to HR.
 *
 * Positioning:
 *   High-end ≈ 70th percentile of HR-equivalent regional specialist fees
 *   (periodontally oriented + high-end polyclinics), then a light 0.97 dampener
 *   vs Italy so we sit in the 65th–75th band — premium, not the regional max.
 *   Economic ≈ 52nd percentile of quality HR+SI specialist fees (45th–60th
 *   band), still above ordinary Croatian “kiretaža” and above a cost-plus floor.
 *
 * Shrinkage: empirical-Bayes / Gaussian-Gaussian posterior mean toward the
 * specialist median prior. Prior strength k = 5 pseudo-observations: small n
 * hugs the prior; many sourced fees follow the sample percentile.
 *
 * Cost-plus floor (profitable, honest time):
 *   Economic net ≈ €135 / chair-hour; high-end ≈ €205 / chair-hour after materials.
 *   Material-only lines (timeMinutes = 0) use a modest markup, not Swiss multiples.
 */

import type { CountryCode, Procedure } from '../types'
import { clinicById } from '../data/clinics'
import { observations } from '../data/observations'
import { USER_SURGICAL_PRIORS, USER_WEAK_PRICE_PRIORS } from '../data/userOptimum'
import { median, percentile } from './stats'

/** Eurostat AIC per capita PPS 2024, EU-27 = 100. */
export const AIC_2024: Record<CountryCode, number> = {
  HR: 79,
  SI: 86,
  IT: 98,
  HU: 73,
  TR: 71,
  AT: 114,
  BA: 42,
  RS: 56,
}

/** Household consumption price-level index 2025, EU-27 = 100 (SSB / Eurostat). */
export const PLI_2025: Record<CountryCode, number> = {
  HR: 78.4,
  SI: 89.3,
  IT: 97.1,
  HU: 77.5,
  TR: 59.6,
  AT: 113.0,
  BA: 59.2,
  RS: 68.0,
}

export const HR_MEDIAN_EQUIVALISED_EUR = 15057
export const PRIOR_STRENGTH_K = 3
export const HIGHEND_PERCENTILE = 0.7
export const ECONOMIC_PERCENTILE = 0.52
/** Extra dampener after PPP conversion so we do not sit at the Italian ceiling. */
export const ITALY_DAMPENER = 0.97
export const HOURLY_ECONOMIC = 135
export const HOURLY_HIGHEND = 205
export const MATERIAL_MARKUP_ECON = 2.35
export const MATERIAL_MARKUP_HIGH = 2.55

const CORE: CountryCode[] = ['HR', 'SI', 'IT', 'HU']
const QUALITY_LOCAL: CountryCode[] = ['HR', 'SI']

export interface ProcedureSeed {
  id: string
  timeMinutes: number
  materialEconomic: number
  materialHighend: number
  recommendedEconomic: number
  recommendedHighend: number
}

export interface RecommendedTiers {
  economic: number
  highend: number
  nSpecialist: number
  shrinkage: number
  prior: number
}

function specialistLike(type: string): boolean {
  return type === 'perio_oriented' || type === 'polyclinic'
}

/** Convert a published fee into Croatian purchasing-power equivalent (never inflate). */
export function toHrEquivalent(eur: number, country: CountryCode): number {
  const aic = AIC_2024[country] ?? AIC_2024.HR
  const factor = Math.min(1, AIC_2024.HR / aic)
  return eur * factor
}

function clinicRound(n: number): number {
  if (!Number.isFinite(n) || n <= 0) return 0
  if (n < 80) return Math.round(n / 5) * 5
  if (n < 400) return Math.round(n / 5) * 5
  if (n < 900) return Math.round(n / 10) * 10
  return Math.round(n / 20) * 20
}

function costPlus(material: number, timeMinutes: number, hourly: number, markup: number): number {
  if (timeMinutes <= 0) return material * markup
  return material + (timeMinutes / 60) * hourly
}

export function gatherSpecialistFees(
  procedureId: string,
  opts: { hrEquivalent: boolean; countries?: CountryCode[] },
): number[] {
  const countries = opts.countries ?? CORE
  const out: number[] = []
  for (const o of observations) {
    if (o.procedureId !== procedureId) continue
    if (o.eur <= 0) continue
    const clinic = clinicById[o.clinicId]
    if (!clinic) continue
    if (clinic.type === 'benchmark') continue
    if (!specialistLike(clinic.type)) continue
    if (!countries.includes(clinic.country)) continue
    const value = opts.hrEquivalent ? toHrEquivalent(o.eur, clinic.country) : o.eur
    out.push(value)
    if (o.rangeHighEur != null && o.rangeHighEur > o.eur) {
      const hi = opts.hrEquivalent ? toHrEquivalent(o.rangeHighEur, clinic.country) : o.rangeHighEur
      out.push(hi)
    }
  }
  return out
}

function gatherAllQualityFees(procedureId: string): number[] {
  const out: number[] = []
  for (const o of observations) {
    if (o.procedureId !== procedureId || o.eur <= 0) continue
    const clinic = clinicById[o.clinicId]
    if (!clinic || clinic.type === 'benchmark') continue
    if (!CORE.includes(clinic.country)) continue
    out.push(toHrEquivalent(o.eur, clinic.country))
  }
  return out
}

function gatherBenchmarkPrior(procedureId: string): number | null {
  const vals = observations
    .filter((o) => o.procedureId === procedureId && o.eur > 0 && clinicById[o.clinicId]?.type === 'benchmark')
    .map((o) => {
      const c = clinicById[o.clinicId]!
      return toHrEquivalent(o.eur, c.country)
    })
  return median(vals)
}

/**
 * When a named modern line has no public fee, borrow the specialist distribution
 * of a close clinical analogue and apply a modest lift (not a luxury multiple).
 */
const ANALOGUES: Record<string, { ids: string[]; lift: number }> = {
  'endo-perio-quad': { ids: ['srp-quad', 'vector', 'laser-perio'], lift: 1.32 },
  'eryag-pocket': { ids: ['laser-perio', 'vector'], lift: 1.12 },
  'ndyag-pocket': { ids: ['laser-perio'], lift: 1.18 },
  'emdogain-bone': { ids: ['emdogain', 'gtr-small', 'graft-bone'], lift: 1.08 },
  'sctg-emd': { ids: ['ctg-tooth', 'emdogain', 'tunnel'], lift: 1.15 },
  vista: { ids: ['tunnel', 'ctg-tooth'], lift: 1.12 },
  'pinhole-class': { ids: ['recession-quad', 'tunnel'], lift: 0.95 },
  'peri-implantoplasty': { ids: ['peri-surg', 'cl-func'], lift: 0.72 },
  'host-sdd': { ids: ['local-abx', 'spt'], lift: 0.55 },
  'guided-muco': { ids: ['tunnel', 'dsd'], lift: 1.22 },
  spic: { ids: ['spt', 'gbt', 'peri-muc'], lift: 1.08 },
  mmist: { ids: ['ofd-quad', 'gtr-small'], lift: 1.05 },
  'xeno-matrix': { ids: ['ctg-tooth', 'fgg-small'], lift: 0.92 },
  'scope-add': { ids: ['sedation'], lift: 0.35 },
  'endo-dx': { ids: ['perio-exam', 'full-chart'], lift: 1.25 },
  'apdt': { ids: ['laser-perio', 'local-abx'], lift: 0.55 },
  gem21: { ids: ['emdogain', 'gtr-large'], lift: 1.18 },
  tunnel: { ids: ['ctg-tooth'], lift: 1.08 },
  'peri-regen': { ids: ['gtr-large', 'peri-surg'], lift: 1.1 },
}

function analoguePrior(procedureId: string): number | null {
  const spec = ANALOGUES[procedureId]
  if (!spec) return null
  const pool: number[] = []
  for (const id of spec.ids) {
    pool.push(...gatherSpecialistFees(id, { hrEquivalent: true }))
  }
  const m = median(pool)
  return m == null ? null : m * spec.lift
}

function shrinkToward(sample: number, prior: number, n: number, k = PRIOR_STRENGTH_K): { value: number; shrinkage: number } {
  const w = n / (n + k)
  return { value: w * sample + (1 - w) * prior, shrinkage: 1 - w }
}

function effectiveTime(seed: ProcedureSeed): { minutes: number; matE: number; matH: number } {
  const extra = USER_SURGICAL_PRIORS[seed.id]
  return {
    minutes: seed.timeMinutes + (extra?.extraMinutes ?? 0),
    matE: seed.materialEconomic + (extra?.extraMaterialEconomic ?? 0),
    matH: seed.materialHighend + (extra?.extraMaterialHighend ?? 0),
  }
}

/**
 * Empirical-Bayes recommended pair for one procedure.
 * `seed` recommended fields are the catalogue’s previous/clinical estimate
 * and act as a second prior when evidence is thin.
 */
export function recommendTiers(seed: ProcedureSeed): RecommendedTiers {
  const { minutes, matE, matH } = effectiveTime(seed)
  const specialist = gatherSpecialistFees(seed.id, { hrEquivalent: true })
  const localQuality = gatherSpecialistFees(seed.id, { hrEquivalent: false, countries: QUALITY_LOCAL })
  const allQuality = gatherAllQualityFees(seed.id)
  const n = specialist.length

  const floorE = costPlus(matE, minutes, HOURLY_ECONOMIC, MATERIAL_MARKUP_ECON)
  const floorH = costPlus(matH, minutes, HOURLY_HIGHEND, MATERIAL_MARKUP_HIGH)

  const specMed = median(specialist)
  const analogue = analoguePrior(seed.id)
  const bench = gatherBenchmarkPrior(seed.id)
  const userWeak = USER_WEAK_PRICE_PRIORS[seed.id]

  // High-end prior sits a little above the specialist median (premium quality)
  // but is not the sample max.
  const priorHigh =
    specMed != null
      ? specMed * 1.1
      : Math.max(floorH, analogue ?? 0, userWeak?.highend ?? 0, bench ?? 0, seed.recommendedHighend)

  const localMed = median(localQuality)
  const priorEcon =
    localMed ??
    (specMed != null ? specMed * 0.82 : null) ??
    Math.max(floorE, analogue != null ? analogue * 0.78 : 0, userWeak?.economic ?? 0, seed.recommendedEconomic)

  const p70 = percentile(specialist, HIGHEND_PERCENTILE) ?? percentile(allQuality, 0.72)
  const p85 = percentile(specialist, 0.85) ?? percentile(allQuality, 0.85)
  const p52Local = percentile(localQuality, ECONOMIC_PERCENTILE) ?? percentile(specialist, 0.5)

  const highSample = p70 ?? priorHigh
  const econSample = p52Local ?? priorEcon

  const highSh = shrinkToward(highSample, priorHigh, n)
  const econSh = shrinkToward(econSample, priorEcon, n)

  let high = highSh.value * ITALY_DAMPENER
  let econ = econSh.value

  // Thin evidence: blend catalogue seed, analogue, and cost-plus so named
  // modern lines are not stuck at a single neighbour’s underpriced tariff.
  if (n < 3) {
    const seedH = seed.recommendedHighend
    const seedE = seed.recommendedEconomic
    const analogH = analogue ?? seedH
    high = 0.4 * high + 0.3 * seedH + 0.2 * floorH + 0.1 * analogH
    econ = 0.4 * econ + 0.3 * seedE + 0.2 * floorE + 0.1 * (userWeak?.economic ?? seedE)
  } else {
    const mix = n >= 8 ? 0.08 : 0.14
    high = (1 - mix) * high + mix * floorH
    econ = (1 - mix) * econ + mix * floorE
  }

  if (userWeak && n < 2) {
    high = 0.7 * high + 0.3 * userWeak.highend
    econ = 0.7 * econ + 0.3 * userWeak.economic
  }

  // Honest time and materials always clear a viability floor.
  high = Math.max(high, floorH * 0.95)
  econ = Math.max(econ, floorE * 0.92)

  // Luxury-max cap: with a real specialist sample, stay near the 85th
  // percentile (plus a little room for microscope time). With sparse data,
  // allow cost-plus and the catalogue seed, but not US-style multiples.
  const luxuryCap =
    n >= 6 && p85 != null
      ? Math.max(p85 * 1.16, floorH * 1.06)
      : Math.max(floorH * 1.3, priorHigh * 1.32, seed.recommendedHighend)

  high = Math.min(high, luxuryCap)

  if (high < econ * 1.14) high = econ * 1.16
  econ = Math.min(econ, high * 0.88)
  econ = Math.max(econ, floorE * 0.9)

  return {
    economic: clinicRound(econ),
    highend: clinicRound(high),
    nSpecialist: n,
    shrinkage: Math.round(highSh.shrinkage * 100) / 100,
    prior: Math.round(priorHigh * 100) / 100,
  }
}

export function recommendForProcedure(proc: Pick<Procedure, keyof ProcedureSeed>): RecommendedTiers {
  return recommendTiers(proc)
}

export function italyRelativeBuyingPower(): number {
  return AIC_2024.HR / AIC_2024.IT
}
