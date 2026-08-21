export type Locale = 'en' | 'hr'

export type AppMode = 'atlas' | 'planner' | 'membership'

export type StackKind = 'same-session' | 'sequential'

export type CountryCode = 'HR' | 'SI' | 'IT' | 'HU' | 'TR' | 'AT' | 'BA' | 'RS'

export type ClinicType = 'ordinary' | 'polyclinic' | 'perio_oriented' | 'benchmark'

export type CategoryId =
  | 'diagnostics'
  | 'hygiene'
  | 'nonsurgical'
  | 'surgical'
  | 'regenerative'
  | 'mucogingival'
  | 'implants'
  | 'adjuncts'

export type CurrencyCode = 'EUR' | 'HUF' | 'RSD' | 'BAM'

export interface Clinic {
  id: string
  name: string
  city: string
  country: CountryCode
  type: ClinicType
  url: string
  accessed: string
  notes: string
}

export interface Procedure {
  id: string
  name: string
  category: CategoryId
  unit: string
  description: string
  modernGap: boolean
  estimatedRecommend: boolean
  timeMinutes: number
  materialEconomic: number
  materialHighend: number
  recommendedEconomic: number
  recommendedHighend: number
  custom?: boolean
  /** Optional Croatian label if a data sibling added it. */
  nameHr?: string
  /** Rare / cutting-edge perio; UI may badge. */
  cuttingEdge?: boolean
  /** Seldom or not offered as a named line in surveyed HR/SI/IT/HU/TR lists. */
  notDoneInRegion?: boolean
}

export interface Observation {
  id: string
  clinicId: string
  procedureId: string
  originalAmount: number
  originalCurrency: CurrencyCode
  eur: number
  rangeHighEur?: number
  estimated: boolean
  note?: string
}

export interface BundleDef {
  id: string
  name: string
  description: string
  pathway: string
  procedureIds: string[]
  discountType: 'percent' | 'fixed'
  discountValue: number
  custom?: boolean
}

export interface ProcedureStack {
  id: string
  name: string
  kind: StackKind
  procedureIds: string[]
  discountType: 'percent' | 'fixed'
  discountValue: number
}

export interface ClinicIdentity {
  name: string
  city: string
  tagline: string
}

export interface PriceOverride {
  economic?: number
  highend?: number
}

export interface PersistedState {
  version: 1
  identity: ClinicIdentity
  overrides: Record<string, PriceOverride>
  customProcedures: Procedure[]
  bundles: BundleDef[]
  collapsed: Record<string, boolean>
  stacks: ProcedureStack[]
}

export interface MarketStats {
  count: number
  min: number
  max: number
  median: number
  ordinaryMedian: number | null
  specialistMedian: number | null
  byCountry: Partial<Record<CountryCode, { count: number; median: number }>>
}
