import { useMemo, useState } from 'react'
import { formatEur } from '../lib/format'
import {
  CARE_CATEGORIES,
  MEMBERSHIP_TIERS,
  PERSONAS,
  ROI_PROBE_IDS,
  SUSTAINABLE_RATES,
  cloneCopay,
  copayChairHour,
  defaultCatalogLite,
  materialOf,
  probeChairHours,
  procedureName,
  yearForPersona,
  type CareCategory,
  type CopayMap,
  type Locale,
  type PriceColumn,
  type ProcedureLite,
} from '../data/subscriptions'
import './Membership.css'

export type MembershipProps = {
  locale: 'en' | 'hr'
  getPrice: (procedureId: string, tier: 'economic' | 'highend') => number
  procedures?: Array<{ id: string; name: string; timeMinutes: number; category?: string }>
}

const CATEGORY_LABEL: Record<CareCategory, { en: string; hr: string }> = {
  diagnostics: { en: 'Diagnostics', hr: 'Dijagnostika' },
  hygiene: { en: 'Hygiene / GBT extras', hr: 'Higijena / dodatni GBT' },
  nonsurgical: { en: 'Non-surgical / SRP', hr: 'Nekirurško / SRP' },
  surgical: { en: 'Surgical access', hr: 'Kirurški pristup' },
  regenerative: { en: 'Regeneration', hr: 'Regeneracija' },
  mucogingival: { en: 'Mucogingival / plastic', hr: 'Mukogingivalna / plastika' },
  implants: { en: 'Implants / peri-implant', hr: 'Implanti / periimplantno' },
  adjuncts: { en: 'Adjuncts', hr: 'Dopune' },
}

const COPY = {
  en: {
    eyebrow: 'Membership · periodontal care',
    title: 'Retainers that keep patients in care',
    lede: 'Four clinical memberships for a high-end Croatian specialist perio clinic. Higher tiers buy more Guided Biofilm Therapy, shorter waits, microscope protocol and written reporting — not a cheaper path to implants. The patient still pays a co-pay. Biomaterials are billed in full; co-pay applies to the professional portion (list minus material).',
    priceColumn: 'Price column',
    economic: 'Economic',
    highend: 'High-end',
    reset: 'Reset fees & co-pays',
    annualFee: 'Annual retainer, €',
    patientPays: 'Patient pays',
    clinicCovers: 'Clinic covers',
    ofProfessional: 'of professional fee on extras',
    included: 'Included in retainer',
    wait: (d: number) => (d <= 3 ? `Priority ~${d} days` : `Wait ~${d} days`),
    editHint: 'Select a tier to edit category co-pays. Fees on the cards are live.',
    copayTitle: (name: string) => `Co-pay planner — ${name}`,
    copayIntro:
      'Figures are the share the patient pays of (list − materials). Materials stay at 100%. Included visits above remain €0 at the chair.',
    compareTitle: 'Pay-as-you-go versus membership',
    compareLede:
      'Three typical years. Patient total = retainer + co-pays on anything not included. Clinic €/chair-hour is revenue minus materials, divided by hours.',
    payg: 'Pay-as-you-go',
    patientYear: 'Patient pays / year',
    vsPayg: 'vs pay-as-you-go',
    clinicHour: 'Clinic € / chair-hour',
    hours: 'Chair hours',
    sound: 'Viable',
    thin: 'Thin contribution',
    loss: 'Below viable chair-hour',
    surgeryNote: 'Surgery lines below €140/h after co-pay',
    roiTitle: 'Clinic chair-hour after co-pay',
    roiLede: `Uninsured list versus each tier on four high-stakes lines. Specialist floor is ${formatEur(SUSTAINABLE_RATES.specialistFloor)}/h after materials. Hygienist floor ${formatEur(SUSTAINABLE_RATES.hygieneFloor)}/h. A reconstructive year on Atelier can look cheap for the patient while flap and tunnel time fall through the floor — that is the warning, not a reason to give surgery away.`,
    listHour: 'Uninsured €/h',
    belowFloor: 'Below specialist floor',
    atelierWarn:
      'Atelier (and sometimes Specialist) will lose money on resective and tunnel time if co-pay stays in the 30s–40s. Raise surgical / mucogingival co-pay, or keep those patients on a higher co-pay tier. Regenerative and implant lines survive better because materials are passed through.',
    materialsRule:
      'Rule: the clinic never absorbs the biomaterial. Patient always pays 100% of material plus the co-pay on professional time.',
    recommend: (tier: string, persona: string) =>
      `For ${persona}, ${tier} is the lowest patient total that still holds a blended chair-hour at or above ${formatEur(SUSTAINABLE_RATES.blendedThin)}/h.`,
    noneViable:
      'No tier holds a blended chair-hour at the thin threshold for this year — raise co-pays or the retainer before offering it.',
  },
  hr: {
    eyebrow: 'Članstvo · parodontološka skrb',
    title: 'Članarine koje zadržavaju pacijenta u skrbi',
    lede: 'Četiri klinička članstva za high-end hrvatsku specijalističku parodontološku ordinaciju. Više razine kupuju više vođene terapije biofilma, kraće čekanje, mikroskopski protokol i pisana izvješća — ne jeftiniji put do implanata. Pacijent i dalje plaća doplatu. Biomaterijali se naplaćuju u cijelosti; doplata se odnosi na profesionalni dio (cjenik minus materijal).',
    priceColumn: 'Stupac cijene',
    economic: 'Ekonomski',
    highend: 'High-end',
    reset: 'Vrati članarine i doplate',
    annualFee: 'Godišnja članarina, €',
    patientPays: 'Pacijent plaća',
    clinicCovers: 'Klinika pokriva',
    ofProfessional: 'profesionalnog dijela na ostalim stavkama',
    included: 'Uključeno u članarinu',
    wait: (d: number) => (d <= 3 ? `Prioritet ~${d} dana` : `Čekanje ~${d} dana`),
    editHint: 'Odaberite razinu da uredite doplate po kategoriji. Članarine na karticama su žive.',
    copayTitle: (name: string) => `Planer doplata — ${name}`,
    copayIntro:
      'Brojke su udio koji pacijent plaća od (cjenik − materijal). Materijali ostaju 100 %. Uključeni posjeti gore ostaju 0 € na stolici.',
    compareTitle: 'Plaćanje po usluzi naspram članstva',
    compareLede:
      'Tri tipične godine. Ukupno za pacijenta = članarina + doplate na sve što nije uključeno. €/sat stolice klinike je prihod minus materijali, podijeljeno sa satima.',
    payg: 'Po usluzi',
    patientYear: 'Pacijent plaća / godina',
    vsPayg: 'naspram po usluzi',
    clinicHour: 'Klinika € / sat stolice',
    hours: 'Sati stolice',
    sound: 'Održivo',
    thin: 'Tanak doprinos',
    loss: 'Ispod održivog sata stolice',
    surgeryNote: 'Kirurške stavke ispod 140 €/h nakon doplate',
    roiTitle: 'Sat stolice klinike nakon doplate',
    roiLede: `Cjenik bez osiguranja naspram svake razine na četiri visokorizične stavke. Prag specijalista je ${formatEur(SUSTAINABLE_RATES.specialistFloor)}/h nakon materijala. Prag higijene ${formatEur(SUSTAINABLE_RATES.hygieneFloor)}/h. Rekonstrukcijska godina na Atelieru može izgledati jeftino za pacijenta dok vrijeme režnja i tunela padne ispod praga — to je upozorenje, ne razlog da se kirurgija poklanja.`,
    listHour: 'Bez osiguranja €/h',
    belowFloor: 'Ispod praga specijalista',
    atelierWarn:
      'Atelier (i ponekad Specijalist) gubi na resekcijskom i tunelskom vremenu ako doplata ostane u rasponu 30–40 %. Podignite doplatu na kirurgiji / mukogingivali, ili te pacijente držite na razini s višom doplatnom stopom. Regeneracija i implanti bolje preživljavaju jer se materijal prevaljuje na pacijenta.',
    materialsRule:
      'Pravilo: klinika ne preuzima biomaterijal. Pacijent uvijek plaća 100 % materijala plus doplatu na profesionalno vrijeme.',
    recommend: (tier: string, persona: string) =>
      `Za ${persona} je ${tier} najniži trošak pacijenta koji još drži mješoviti sat stolice na ili iznad ${formatEur(SUSTAINABLE_RATES.blendedThin)}/h.`,
    noneViable:
      'Nijedna razina ne drži mješoviti sat stolice na pragu tankog doprinosa za ovu godinu — podignite doplate ili članarinu prije ponude.',
  },
} as const

function defaultFees(): Record<string, number> {
  return Object.fromEntries(MEMBERSHIP_TIERS.map((tier) => [tier.id, tier.defaultAnnualFee]))
}

function defaultCopays(): Record<string, CopayMap> {
  return Object.fromEntries(MEMBERSHIP_TIERS.map((tier) => [tier.id, cloneCopay(tier.defaultCopay)]))
}

function meanCopay(c: CopayMap): number {
  return (c.surgical + c.regenerative + c.mucogingival) / 3
}

function fmtHour(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return '—'
  return `${formatEur(n)}/h`
}

function CopayBar({
  patient,
  caption,
  patientLabel,
  clinicLabel,
}: {
  patient: number
  caption: string
  patientLabel: string
  clinicLabel: string
}) {
  const clinic = 1 - patient
  return (
    <div className="mem-split">
      <div className="mem-split-bar" aria-hidden="true">
        <i style={{ width: `${patient * 100}%` }} />
        <i style={{ width: `${clinic * 100}%` }} />
      </div>
      <div className="mem-split-legend">
        <span>
          {patientLabel} {Math.round(patient * 100)}%
        </span>
        <span>
          {clinicLabel} {Math.round(clinic * 100)}%
        </span>
      </div>
      <span className="mem-split-legend">{caption}</span>
    </div>
  )
}

function saveLabel(n: number, locale: Locale): string {
  if (n > 4) return locale === 'hr' ? `ušteda ${formatEur(n)}` : `saves ${formatEur(n)}`
  if (n < -4) return locale === 'hr' ? `skuplje ${formatEur(-n)}` : `${formatEur(-n)} more`
  return locale === 'hr' ? 'približno isto' : 'about even'
}

export function Membership(props: MembershipProps) {
  const { locale, getPrice } = props
  const copy = COPY[locale]
  const extras: ProcedureLite[] = props.procedures?.length ? props.procedures : defaultCatalogLite()

  const [column, setColumn] = useState<PriceColumn>('highend')
  const [activeId, setActiveId] = useState(MEMBERSHIP_TIERS[2].id)
  const [fees, setFees] = useState<Record<string, number>>(defaultFees)
  const [copays, setCopays] = useState<Record<string, CopayMap>>(defaultCopays)

  const active = MEMBERSHIP_TIERS.find((tier) => tier.id === activeId) ?? MEMBERSHIP_TIERS[0]
  const activeCopay = copays[active.id]

  const personaRows = useMemo(() => {
    return PERSONAS.map((persona) => {
      const byTier = MEMBERSHIP_TIERS.map((tier) =>
        yearForPersona(
          persona,
          tier,
          fees[tier.id] ?? tier.defaultAnnualFee,
          copays[tier.id],
          getPrice,
          column,
          extras,
        ),
      )
      const payg = byTier[0]?.payg ?? 0
      const viable = byTier.filter(
        (row) => row.viability !== 'loss' && (row.memberChairHour ?? 0) >= SUSTAINABLE_RATES.blendedThin,
      )
      const pool = viable.length ? viable : byTier.filter((row) => row.viability !== 'loss')
      const bestId = (pool.length ? pool : byTier).reduce((a, b) =>
        a.patientTotal <= b.patientTotal ? a : b,
      ).tierId
      return { persona, payg, byTier, bestId }
    })
  }, [fees, copays, getPrice, column, extras])

  const probes = useMemo(() => {
    return MEMBERSHIP_TIERS.map((tier) => ({
      tier,
      rows: probeChairHours(tier, copays[tier.id], getPrice, column, extras),
    }))
  }, [copays, getPrice, column, extras])

  const listProbes = useMemo(() => {
    return ROI_PROBE_IDS.map((id) => {
      const list = getPrice(id, column)
      const material = materialOf(id, column)
      const minutes = extras.find((p) => p.id === id)?.timeMinutes ?? 0
      return {
        id,
        listHour: copayChairHour(list, material, minutes, 1),
      }
    })
  }, [getPrice, column, extras])

  const anyBelowFloor = probes.some((p) => p.rows.some((r) => r.belowFloor))

  const setCopay = (cat: CareCategory, pct: number) => {
    const fraction = Math.min(0.98, Math.max(0.05, pct / 100))
    setCopays((prev) => ({
      ...prev,
      [active.id]: { ...prev[active.id], [cat]: fraction },
    }))
  }

  return (
    <section id="membership" className="section membership">
      <header className="section-head">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2>{copy.title}</h2>
        <p className="membership-lede">{copy.lede}</p>
      </header>

      <div className="membership-toolbar">
        <div>
          <span className="eyebrow" style={{ display: 'block' }}>
            {copy.priceColumn}
          </span>
          <div className="membership-seg" role="group">
            <button type="button" className={column === 'economic' ? 'is-on' : ''} onClick={() => setColumn('economic')}>
              {copy.economic}
            </button>
            <button type="button" className={column === 'highend' ? 'is-on' : ''} onClick={() => setColumn('highend')}>
              {copy.highend}
            </button>
          </div>
        </div>
        <button
          type="button"
          className="ghost-btn"
          onClick={() => {
            setFees(defaultFees())
            setCopays(defaultCopays())
          }}
        >
          {copy.reset}
        </button>
      </div>
      <p className="muted" style={{ marginTop: '-0.8rem', fontSize: '0.88rem' }}>
        {copy.editHint}
      </p>

      <div className="membership-grid">
        {MEMBERSHIP_TIERS.map((tier) => {
          const copay = copays[tier.id]
          const patientShare = meanCopay(copay)
          return (
            <article
              key={tier.id}
              className={`mem-card${tier.id === activeId ? ' is-active' : ''}`}
              onClick={() => setActiveId(tier.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setActiveId(tier.id)
                }
              }}
              role="button"
              tabIndex={0}
              aria-pressed={tier.id === activeId}
            >
                <div className="mem-card-top">
                  <span className="mem-roman">{tier.roman}</span>
                  <span className="mem-wait">{copy.wait(tier.waitDays)}</span>
                </div>
                <h3>{tier.name[locale]}</h3>
                <p className="mem-intended">{tier.intendedFor[locale]}</p>
                <label
                  className="mem-fee"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <span>{copy.annualFee}</span>
                  <input
                    type="number"
                    min={0}
                    step={10}
                    value={fees[tier.id]}
                    onChange={(e) =>
                      setFees((prev) => ({ ...prev, [tier.id]: Number(e.target.value) || 0 }))
                    }
                  />
                </label>
                <CopayBar
                  patient={patientShare}
                  caption={`${CATEGORY_LABEL.surgical[locale]} / ${CATEGORY_LABEL.regenerative[locale]}`}
                  patientLabel={copy.patientPays}
                  clinicLabel={copy.clinicCovers}
                />
                <CopayBar
                  patient={copay.hygiene}
                  caption={CATEGORY_LABEL.hygiene[locale]}
                  patientLabel={copy.patientPays}
                  clinicLabel={copy.clinicCovers}
                />
                <span className="mem-split-legend">{copy.ofProfessional}</span>
                <p className="eyebrow" style={{ margin: '0.2rem 0 0' }}>
                  {copy.included}
                </p>
                <ul className="mem-inc">
                  {tier.included.map((line) => (
                    <li key={`${line.procedureId}-${line.note?.en ?? line.qty}`}>
                      <b>{line.qty}×</b>
                      <span>
                        {procedureName(line.procedureId, locale, extras)}
                        {line.note ? ` — ${line.note[locale]}` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
                <ul className="mem-proto">
                  {tier.protocols.map((p) => (
                    <li key={p.en}>{p[locale]}</li>
                  ))}
                </ul>
                <p className="mem-goal">{tier.clinicalGoal[locale]}</p>
            </article>
          )
        })}
      </div>

      <div className="mem-panel">
        <h3>{copy.copayTitle(active.name[locale])}</h3>
        <p className="mem-math">{copy.copayIntro}</p>
        <p className="mem-math">{active.feeMath[locale]}</p>
        <p className="mem-math">{copy.materialsRule}</p>
        <div className="mem-copay-grid">
          {CARE_CATEGORIES.map((cat) => {
            const pct = Math.round(activeCopay[cat] * 100)
            return (
              <label key={cat}>
                {CATEGORY_LABEL[cat][locale]}
                <div className="mem-copay-row">
                  <input
                    type="range"
                    min={20}
                    max={95}
                    step={1}
                    value={pct}
                    onChange={(e) => setCopay(cat, Number(e.target.value))}
                  />
                  <input
                    type="number"
                    min={5}
                    max={98}
                    step={1}
                    value={pct}
                    onChange={(e) => setCopay(cat, Number(e.target.value))}
                    aria-label={CATEGORY_LABEL[cat][locale]}
                  />
                  <span>%</span>
                </div>
              </label>
            )
          })}
        </div>
      </div>

      <header className="mem-subhead section-head">
        <p className="eyebrow">{locale === 'hr' ? 'Usporedba godina' : 'Year comparison'}</p>
        <h2>{copy.compareTitle}</h2>
        <p>{copy.compareLede}</p>
      </header>

      <div className="mem-personas">
        {personaRows.map(({ persona, payg, byTier, bestId }) => {
          const best = byTier.find((row) => row.tierId === bestId)
          const bestTier = MEMBERSHIP_TIERS.find((x) => x.id === bestId)
          const viableBest =
            best &&
            best.viability !== 'loss' &&
            (best.memberChairHour ?? 0) >= SUSTAINABLE_RATES.blendedThin
          return (
            <article key={persona.id} className="mem-persona">
              <header>
                <p className="eyebrow">{persona.stage[locale]}</p>
                <h3>{persona.name[locale]}</h3>
                <p>{persona.description[locale]}</p>
                <p className={viableBest ? 'mem-flag' : 'mem-flag is-loss'}>
                  {viableBest && bestTier
                    ? copy.recommend(bestTier.name[locale], persona.name[locale])
                    : copy.noneViable}
                </p>
              </header>
              <table className="mem-table">
                <thead>
                  <tr>
                    <th />
                    <th>{copy.payg}</th>
                    {MEMBERSHIP_TIERS.map((tier) => (
                      <th key={tier.id}>{tier.shortName[locale]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th>{copy.patientYear}</th>
                    <td className="num">{formatEur(payg)}</td>
                    {byTier.map((row) => (
                      <td key={row.tierId} className={`num${row.tierId === bestId ? ' is-best' : ''}`}>
                        {formatEur(row.patientTotal)}
                        <div className="muted" style={{ fontSize: '0.78rem' }}>
                          {formatEur(row.retainer)} + {formatEur(row.copays)}
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th>{copy.vsPayg}</th>
                    <td className="num">—</td>
                    {byTier.map((row) => (
                      <td key={row.tierId} className={`num${row.tierId === bestId ? ' is-best' : ''}`}>
                        {saveLabel(row.saveVsPayg, locale)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th>{copy.clinicHour}</th>
                    <td className="num">{fmtHour(byTier[0]?.paygChairHour ?? null)}</td>
                    {byTier.map((row) => (
                      <td key={row.tierId} className={`num${row.tierId === bestId ? ' is-best' : ''}`}>
                        {fmtHour(row.memberChairHour)}
                        <div className={row.viability === 'loss' ? 'mem-flag is-loss' : 'mem-flag'}>
                          {copy[row.viability]}
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th>{copy.hours}</th>
                    <td className="num">{byTier[0]?.hours.toFixed(1)}</td>
                    {byTier.map((row) => (
                      <td key={row.tierId} className="num">
                        {row.hours.toFixed(1)}
                        {row.surgeryWarnings.length > 0 ? (
                          <div className="mem-flag is-loss">
                            {copy.surgeryNote}:{' '}
                            {row.surgeryWarnings.map((id) => procedureName(id, locale, extras)).join(', ')}
                          </div>
                        ) : null}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </article>
          )
        })}
      </div>

      <header className="mem-subhead section-head">
        <p className="eyebrow">ROI</p>
        <h2>{copy.roiTitle}</h2>
        <p>{copy.roiLede}</p>
      </header>

      <div className="mem-persona mem-roi-wrap">
        <table className="mem-table">
          <thead>
            <tr>
              <th />
              <th>{copy.listHour}</th>
              {MEMBERSHIP_TIERS.map((tier) => (
                <th key={tier.id}>{tier.shortName[locale]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROI_PROBE_IDS.map((id, idx) => (
              <tr key={id}>
                <th>{procedureName(id, locale, extras)}</th>
                <td className="num">{fmtHour(listProbes[idx]?.listHour ?? null)}</td>
                {probes.map((p) => {
                  const row = p.rows.find((r) => r.procedureId === id)
                  return (
                    <td key={p.tier.id} className="num">
                      {fmtHour(row?.memberHour ?? null)}
                      {row?.belowFloor ? <div className="mem-flag is-loss">{copy.belowFloor}</div> : null}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={`mem-note${anyBelowFloor ? ' is-warn' : ''}`}>{copy.atelierWarn}</p>
    </section>
  )
}
