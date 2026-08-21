import { Header, Hero } from './components/Header'
import { Dashboard } from './components/Dashboard'
import { Pricelist } from './components/Pricelist'
import { Pathways } from './components/Pathways'
import { AboutModel, Sources, PrintSheet, Footer } from './components/About'
import { useClinicState } from './hooks/useClinicState'
import { exportPayload, mergeImported, defaultState } from './lib/storage'
import { I18nProvider, useI18n } from './i18n'
import { SiteGate } from './components/SiteGate'
import { Planner } from './components/Planner'
import { Membership } from './components/Membership'
import type { AppMode, PersistedState } from './types'
import { useCallback, useEffect, useState } from 'react'

const MODE_KEY = 'perio-atlas-mode'

function loadMode(): AppMode {
  try {
    const raw = localStorage.getItem(MODE_KEY)
    if (raw === 'atlas' || raw === 'planner' || raw === 'membership') return raw
  } catch {
    /* ignore */
  }
  return 'atlas'
}

export default function App() {
  return (
    <I18nProvider>
      <SiteGate>
        <AppShell />
      </SiteGate>
    </I18nProvider>
  )
}

function AppShell() {
  const app = useClinicState()
  const { locale, m } = useI18n()
  const [mode, setModeState] = useState<AppMode>(loadMode)

  const setMode = useCallback((next: AppMode) => {
    setModeState(next)
    try {
      localStorage.setItem(MODE_KEY, next)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    document.title =
      locale === 'hr' ? 'Perio Atlas — specijalističke parodontološke cijene' : 'Perio Atlas — specialist periodontal pricing'
  }, [locale])

  const onPrint = () => {
    document.body.classList.add('is-printing')
    window.print()
    window.setTimeout(() => document.body.classList.remove('is-printing'), 400)
  }

  const onExport = () => {
    const payload = exportPayload(app.state, app.allProcedures)
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${slug(app.state.identity.name)}-perio-pricelist.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const onImport = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as Partial<PersistedState> & {
          clinic?: PersistedState['identity']
        }
        app.replaceState(mergeImported(app.state, parsed))
      } catch {
        window.alert(m.importBad)
      }
    }
    reader.readAsText(file)
  }

  const onReset = () => {
    if (window.confirm(m.resetConfirm)) {
      app.replaceState({
        ...defaultState(),
        identity: app.state.identity,
      })
    }
  }

  const getPrice = app.priceOf

  return (
    <>
      <Header
        onPrint={onPrint}
        onExport={onExport}
        onImport={onImport}
        onReset={onReset}
        mode={mode}
        setMode={setMode}
      />
      <main className="screen-root">
        {mode === 'atlas' && (
          <>
            <Hero />
            <Dashboard priceOf={getPrice} />
            <Pricelist app={app} />
            <Pathways app={app} />
            <AboutModel />
            <Sources />
          </>
        )}
        {mode === 'planner' && (
          <section className="section mode-panel" id="top">
            <Planner
              locale={locale}
              economic
              getPrice={getPrice}
              getProcedure={(id) => {
                const p = app.allProcedures.find((x) => x.id === id)
                if (!p) return undefined
                return {
                  id: p.id,
                  name: p.name,
                  timeMinutes: p.timeMinutes,
                  materialEconomic: p.materialEconomic,
                  materialHighend: p.materialHighend,
                }
              }}
            />
          </section>
        )}
        {mode === 'membership' && (
          <section className="section mode-panel" id="top">
            <Membership
              locale={locale}
              getPrice={getPrice}
              procedures={app.allProcedures.map((p) => ({
                id: p.id,
                name: p.name,
                timeMinutes: p.timeMinutes,
                category: p.category,
              }))}
            />
          </section>
        )}
        <Footer />
      </main>
      <PrintSheet app={app} />
    </>
  )
}

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'clinic'
}
