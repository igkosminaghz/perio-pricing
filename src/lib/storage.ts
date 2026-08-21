import type {
  BundleDef,
  ClinicIdentity,
  PersistedState,
  PriceOverride,
  Procedure,
  ProcedureStack,
} from '../types'
import { defaultBundles } from '../data/bundles'

export const STORAGE_KEY = 'perio-atlas-state-v1'

export const defaultIdentity: ClinicIdentity = {
  name: 'Studio Parodonta',
  city: 'Zagreb',
  tagline: 'Specialist periodontal care — two honest price pathways',
}

export function defaultState(): PersistedState {
  return {
    version: 1,
    identity: defaultIdentity,
    overrides: {},
    customProcedures: [],
    bundles: defaultBundles,
    collapsed: {},
    stacks: [],
  }
}

export function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw) as Partial<PersistedState>
    if (parsed.version !== 1) return defaultState()
    return {
      ...defaultState(),
      ...parsed,
      identity: { ...defaultIdentity, ...parsed.identity },
      overrides: parsed.overrides ?? {},
      customProcedures: parsed.customProcedures ?? [],
      bundles: parsed.bundles?.length ? parsed.bundles : defaultBundles,
      collapsed: parsed.collapsed ?? {},
      stacks: parsed.stacks ?? [],
    }
  } catch {
    return defaultState()
  }
}

export function saveState(state: PersistedState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function exportPayload(state: PersistedState, catalog: Procedure[]) {
  return {
    exportedAt: new Date().toISOString(),
    clinic: state.identity,
    catalog,
    customProcedures: state.customProcedures,
    overrides: state.overrides,
    bundles: state.bundles,
    stacks: state.stacks,
  }
}

export function mergeImported(
  current: PersistedState,
  incoming: Partial<PersistedState> & {
    clinic?: ClinicIdentity
    overrides?: Record<string, PriceOverride>
    bundles?: BundleDef[]
    customProcedures?: Procedure[]
    stacks?: ProcedureStack[]
  },
): PersistedState {
  return {
    ...current,
    identity: incoming.clinic ?? incoming.identity ?? current.identity,
    overrides: incoming.overrides ?? current.overrides,
    customProcedures: incoming.customProcedures ?? current.customProcedures,
    bundles: incoming.bundles ?? current.bundles,
    stacks: incoming.stacks ?? current.stacks,
  }
}
