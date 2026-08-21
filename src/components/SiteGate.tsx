import { useState, type FormEvent, type ReactNode } from 'react'
import { useI18n } from '../i18n'
import type { Locale } from '../types'

const UNLOCK_KEY = 'perio-atlas-gate'
const SITE_PASSWORD = 'perio'
const UNLOCK_TOKEN = `v1:${SITE_PASSWORD}`

export function SiteGate({ children }: { children: ReactNode }) {
  const { locale, setLocale, m } = useI18n()
  const [value, setValue] = useState('')
  const [wrong, setWrong] = useState(false)
  const [open, setOpen] = useState(() => {
    try {
      return sessionStorage.getItem(UNLOCK_KEY) === UNLOCK_TOKEN
    } catch {
      return false
    }
  })

  if (open) return children

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (value === SITE_PASSWORD) {
      try {
        sessionStorage.setItem(UNLOCK_KEY, UNLOCK_TOKEN)
      } catch {
        /* ignore */
      }
      setWrong(false)
      setOpen(true)
      return
    }
    setWrong(true)
  }

  return (
    <div className="site-gate">
      <div className="site-gate-card">
        <div className="seg lang-seg site-gate-lang" role="group" aria-label={m.lang.label}>
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
        <p className="eyebrow">{m.brand.tag}</p>
        <h1>{m.gate.title}</h1>
        <p>{m.gate.lede}</p>
        <form onSubmit={onSubmit}>
          <label>
            {m.gate.password}
            <input
              type="password"
              autoComplete="current-password"
              autoFocus
              value={value}
              onChange={(e) => {
                setValue(e.target.value)
                if (wrong) setWrong(false)
              }}
            />
          </label>
          {wrong && <p className="site-gate-error">{m.gate.wrong}</p>}
          <button type="submit" className="gold-btn">
            {m.gate.unlock}
          </button>
        </form>
        <p className="site-gate-hint">{m.gate.hint}</p>
      </div>
    </div>
  )
}
