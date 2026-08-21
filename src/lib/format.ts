import type { CurrencyCode } from '../types'

/** Documented conversion rates, accessed 21 Aug 2026. */
export const FX_TO_EUR: Record<CurrencyCode, number> = {
  EUR: 1,
  /** ECB euro reference rate 20 Aug 2026 ≈ 365.10 HUF. */
  HUF: 1 / 365.1,
  /** Approximate mid-market rate used for Serbian dinar (no ECB HUF-style daily feed in this app). */
  RSD: 1 / 117.2,
  /** BAM is pegged to the euro. */
  BAM: 1 / 1.95583,
}

export const FX_NOTES = {
  asOf: '21 August 2026',
  HUF: 'ECB euro reference rate 20 Aug 2026: 1 EUR = 365.10 HUF.',
  RSD: '1 EUR ≈ 117.2 RSD (mid-market approximation for comparison only).',
  BAM: '1 EUR = 1.95583 BAM (currency board peg).',
}

export function toEur(amount: number, currency: CurrencyCode): number {
  return roundMoney(amount * FX_TO_EUR[currency])
}

export function roundMoney(n: number): number {
  return Math.round(n * 100) / 100
}

export function formatEur(n: number): string {
  return new Intl.NumberFormat('de-AT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(Math.round(n))
}

export function formatEurExact(n: number): string {
  return new Intl.NumberFormat('de-AT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n)
}

export function formatOriginal(amount: number, currency: CurrencyCode): string {
  if (currency === 'EUR') return formatEurExact(amount)
  const symbols: Record<CurrencyCode, string> = {
    EUR: '€',
    HUF: 'Ft',
    RSD: 'RSD',
    BAM: 'KM',
  }
  const formatted = new Intl.NumberFormat('de-AT', { maximumFractionDigits: 0 }).format(amount)
  return `${formatted} ${symbols[currency]}`
}
