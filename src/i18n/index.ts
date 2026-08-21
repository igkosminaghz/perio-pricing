import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Locale, Procedure } from '../types'
import { en, type Messages } from './en'
import { hr } from './hr'

export type { Locale, Messages }

const dicts: Record<Locale, Messages> = { en, hr }
const LOCALE_KEY = 'perio-atlas-locale'

export function detectLocale(): Locale {
  try {
    const saved = localStorage.getItem(LOCALE_KEY)
    if (saved === 'en' || saved === 'hr') return saved
  } catch {
    /* ignore */
  }
  if (typeof navigator === 'undefined') return 'en'
  const langs = [navigator.language, ...(navigator.languages ?? [])]
  if (langs.some((l) => (l ?? '').toLowerCase().startsWith('hr'))) return 'hr'
  return 'en'
}

interface I18nValue {
  locale: Locale
  setLocale: (next: Locale) => void
  m: Messages
}

const I18nContext = createContext<I18nValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectLocale)

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    try {
      localStorage.setItem(LOCALE_KEY, next)
    } catch {
      /* ignore */
    }
    document.documentElement.lang = next
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const value = useMemo(() => ({ locale, setLocale, m: dicts[locale] }), [locale, setLocale])
  return createElement(I18nContext.Provider, { value }, children)
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider')
  return ctx
}

export function procedureName(
  proc: Pick<Procedure, 'id' | 'name' | 'nameHr'>,
  locale: Locale,
  names: Messages['procedures'],
): string {
  if (locale === 'hr' && proc.nameHr) return proc.nameHr
  return (names as Record<string, string>)[proc.id] ?? proc.name
}
