import { useCallback, useEffect, useMemo, useState } from 'react'
import { procedures as catalog } from '../data/procedures'
import type {
  BundleDef,
  ClinicIdentity,
  PersistedState,
  PriceOverride,
  Procedure,
  ProcedureStack,
} from '../types'
import { defaultState, loadState, saveState } from '../lib/storage'

export type Tier = 'economic' | 'highend'

export function useClinicState() {
  const [state, setState] = useState<PersistedState>(() => defaultState())
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setState(loadState())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    saveState(state)
  }, [state, hydrated])

  const allProcedures = useMemo(
    () => [...catalog, ...state.customProcedures],
    [state.customProcedures],
  )

  const priceOf = useCallback(
    (id: string, tier: Tier): number => {
      const proc = allProcedures.find((p) => p.id === id)
      if (!proc) return 0
      const over = state.overrides[id]
      if (tier === 'economic') return over?.economic ?? proc.recommendedEconomic
      return over?.highend ?? proc.recommendedHighend
    },
    [allProcedures, state.overrides],
  )

  const isEdited = useCallback(
    (id: string) => {
      const o = state.overrides[id]
      return o?.economic != null || o?.highend != null
    },
    [state.overrides],
  )

  const setIdentity = (patch: Partial<ClinicIdentity>) =>
    setState((s) => ({ ...s, identity: { ...s.identity, ...patch } }))

  const setPrice = (id: string, tier: Tier, value: number) => {
    setState((s) => {
      const proc = [...catalog, ...s.customProcedures].find((p) => p.id === id)
      if (!proc) return s
      const next: PriceOverride = { ...s.overrides[id] }
      const rec = tier === 'economic' ? proc.recommendedEconomic : proc.recommendedHighend
      if (Number.isNaN(value) || value === rec) {
        delete next[tier]
      } else {
        next[tier] = value
      }
      const overrides = { ...s.overrides }
      if (next.economic == null && next.highend == null) delete overrides[id]
      else overrides[id] = next
      return { ...s, overrides }
    })
  }

  const resetPrice = (id: string) =>
    setState((s) => {
      const overrides = { ...s.overrides }
      delete overrides[id]
      return { ...s, overrides }
    })

  const resetAll = () =>
    setState((s) => ({
      ...s,
      overrides: {},
      customProcedures: [],
      bundles: defaultState().bundles,
      stacks: [],
    }))

  const addProcedure = (proc: Procedure) =>
    setState((s) => ({ ...s, customProcedures: [...s.customProcedures, proc] }))

  const removeProcedure = (id: string) =>
    setState((s) => ({
      ...s,
      customProcedures: s.customProcedures.filter((p) => p.id !== id),
      overrides: Object.fromEntries(Object.entries(s.overrides).filter(([k]) => k !== id)),
      bundles: s.bundles.map((b) => ({
        ...b,
        procedureIds: b.procedureIds.filter((pid) => pid !== id),
      })),
      stacks: (s.stacks ?? []).map((st) => ({
        ...st,
        procedureIds: st.procedureIds.filter((pid) => pid !== id),
      })),
    }))

  const toggleCollapsed = (cat: string) =>
    setState((s) => ({ ...s, collapsed: { ...s.collapsed, [cat]: !s.collapsed[cat] } }))

  const setBundles = (bundles: BundleDef[]) => setState((s) => ({ ...s, bundles }))

  const setStacks = (stacks: ProcedureStack[]) => setState((s) => ({ ...s, stacks }))

  const addStack = (stack: ProcedureStack) =>
    setState((s) => ({ ...s, stacks: [...(s.stacks ?? []), stack] }))

  const removeStack = (id: string) =>
    setState((s) => ({ ...s, stacks: (s.stacks ?? []).filter((st) => st.id !== id) }))

  const replaceState = (next: PersistedState) => setState(next)

  return {
    state,
    hydrated,
    allProcedures,
    priceOf,
    isEdited,
    setIdentity,
    setPrice,
    resetPrice,
    resetAll,
    addProcedure,
    removeProcedure,
    toggleCollapsed,
    setBundles,
    setStacks,
    addStack,
    removeStack,
    replaceState,
  }
}

export type ClinicState = ReturnType<typeof useClinicState>

export function applyLineDiscount(list: number, discountType: 'percent' | 'fixed', discountValue: number): number {
  if (discountType === 'percent') return Math.max(0, list * (1 - discountValue / 100))
  return Math.max(0, list - discountValue)
}

export function bundleTotals(
  bundle: BundleDef,
  priceOf: (id: string, tier: Tier) => number,
): { economic: number; highend: number; economicNet: number; highendNet: number; listE: number; listH: number } {
  const listE = bundle.procedureIds.reduce((sum, id) => sum + priceOf(id, 'economic'), 0)
  const listH = bundle.procedureIds.reduce((sum, id) => sum + priceOf(id, 'highend'), 0)
  return {
    listE,
    listH,
    economic: listE,
    highend: listH,
    economicNet: Math.round(applyLineDiscount(listE, bundle.discountType, bundle.discountValue)),
    highendNet: Math.round(applyLineDiscount(listH, bundle.discountType, bundle.discountValue)),
  }
}

export function stackTotals(
  stack: ProcedureStack,
  allProcedures: Procedure[],
  priceOf: (id: string, tier: Tier) => number,
  tier: Tier,
): {
  list: number
  netPrice: number
  materials: number
  minutes: number
  contribution: number
  perHour: number
  aloneContribution: number
  alonePerHour: number
} {
  let list = 0
  let materials = 0
  let minutes = 0
  for (const id of stack.procedureIds) {
    const proc = allProcedures.find((p) => p.id === id)
    if (!proc) continue
    list += priceOf(id, tier)
    materials += tier === 'economic' ? proc.materialEconomic : proc.materialHighend
    minutes += proc.timeMinutes
  }
  const netPrice = applyLineDiscount(list, stack.discountType, stack.discountValue)
  const contribution = netPrice - materials
  const hours = minutes / 60
  const perHour = hours > 0 ? contribution / hours : 0
  const aloneContribution = list - materials
  const alonePerHour = hours > 0 ? aloneContribution / hours : 0
  return {
    list,
    netPrice,
    materials,
    minutes,
    contribution,
    perHour,
    aloneContribution,
    alonePerHour,
  }
}
