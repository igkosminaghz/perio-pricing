import { chairHourNet } from '../lib/roi'
import { procedureById, procedures as catalog } from './procedures'

/**
 * Periodontal membership retainers — clinical product, not a gym clone.
 *
 * Chair-hour targets (high-end Croatian specialist clinic; see About model):
 *   Specialist fully loaded (rent, nurse, microscope, CE): €140–190/h → plan at €165/h
 *   Floor we refuse to under-run on surgery: €140/h after materials
 *   Hygienist + GBT room (loaded €50–65/h): plan at €110/h so powder and contribution survive
 *   Hygiene floor: €65/h
 *
 * Retainer formula (documented per tier below):
 *   chairValue = Σ includedQty × (timeMinutes / 60) × rateForChair
 *   annualFee  = round(chairValue − courtesyEur)
 *
 * Courtesy is a small loyalty cut so the retainer undercuts pay-as-you-go list
 * on included visits, without giving away surgical time.
 *
 * Co-pay applies ONLY to the professional portion (list − materials).
 * Biomaterials are billed in full — a high-end clinic never “eats” the Emdogain
 * bottle (€180–280) or a membrane (€90–140). Patient share of an extra item:
 *   materials + copay × (list − materials)
 * Clinic covers:
 *   (1 − copay) × (list − materials)
 *
 * Included visits: €0 at the chair; the retainer must cover their materials and
 * sustainable chair-hour. Higher tiers buy more GBT (never a cheap polish),
 * shorter waits, microscope protocol, education, and written reporting — not
 * “cheaper surgery to upsell implants”.
 */

export const SUSTAINABLE_RATES = {
  specialistChairHour: 165,
  hygieneChairHour: 110,
  specialistFloor: 140,
  hygieneFloor: 65,
  /** Blended year below this is thin for a mixed hygienist/specialist diary. */
  blendedThin: 100,
  /** Blended year below this is loss-making once specialist time is in the mix. */
  blendedLoss: 80,
} as const

export type Locale = 'en' | 'hr'
export type PriceColumn = 'economic' | 'highend'
export type ChairKind = 'hygiene' | 'specialist'

export type CareCategory =
  | 'diagnostics'
  | 'hygiene'
  | 'nonsurgical'
  | 'surgical'
  | 'regenerative'
  | 'mucogingival'
  | 'implants'
  | 'adjuncts'

export const CARE_CATEGORIES: CareCategory[] = [
  'diagnostics',
  'hygiene',
  'nonsurgical',
  'surgical',
  'regenerative',
  'mucogingival',
  'implants',
  'adjuncts',
]

export type Bilingual = { en: string; hr: string }

export type IncludedLine = {
  procedureId: string
  qty: number
  chair: ChairKind
  note?: Bilingual
}

export type CopayMap = Record<CareCategory, number>

export type MembershipTierDef = {
  id: string
  roman: string
  name: Bilingual
  shortName: Bilingual
  intendedFor: Bilingual
  clinicalGoal: Bilingual
  protocols: Bilingual[]
  included: IncludedLine[]
  defaultAnnualFee: number
  /** Patient pays this fraction of (list − materials) on extras. */
  defaultCopay: CopayMap
  waitDays: number
  educationHours: number
  courtesyEur: number
  feeMath: Bilingual
}

export type PersonaLine = { procedureId: string; qty: number }

export type PatientPersona = {
  id: string
  name: Bilingual
  stage: Bilingual
  description: Bilingual
  lines: PersonaLine[]
}

export type ProcedureLite = {
  id: string
  name: string
  timeMinutes: number
  category?: string
}

export type GetPrice = (procedureId: string, tier: PriceColumn) => number

function hoursOf(procedureId: string, qty: number, extras?: ProcedureLite[]): number {
  const extra = extras?.find((p) => p.id === procedureId)
  const minutes = extra?.timeMinutes ?? procedureById[procedureId]?.timeMinutes ?? 0
  return (minutes * qty) / 60
}

function chairValue(line: IncludedLine, extras?: ProcedureLite[]): number {
  const h = hoursOf(line.procedureId, line.qty, extras)
  const rate =
    line.chair === 'specialist'
      ? SUSTAINABLE_RATES.specialistChairHour
      : SUSTAINABLE_RATES.hygieneChairHour
  return h * rate
}

export function includedChairValue(tier: MembershipTierDef, extras?: ProcedureLite[]): number {
  return tier.included.reduce((sum, line) => sum + chairValue(line, extras), 0)
}

export function suggestedRetainer(tier: MembershipTierDef, extras?: ProcedureLite[]): number {
  return Math.round(includedChairValue(tier, extras) - tier.courtesyEur)
}

export const MEMBERSHIP_TIERS: MembershipTierDef[] = [
  {
    id: 'recall',
    roman: 'I',
    name: { en: 'SPT Recall', hr: 'SPT recall' },
    shortName: { en: 'Recall', hr: 'Recall' },
    intendedFor: {
      en: 'Treated, stable patients in supportive care (healthy / gingivitis / SPT after Stage I–III).',
      hr: 'Stabilni, izliječeni pacijenti u potpornoj skrbi (zdravi / gingivitis / SPT nakon stadija I–III).',
    },
    clinicalGoal: {
      en: 'Keep people in maintenance. Three GBT visits a year beat a cheap polish and a missed recall.',
      hr: 'Zadržati pacijenta u održavanju. Tri GBT posjeta godišnje vrijede više od jeftinog poliranja i propuštenog recall-a.',
    },
    protocols: [
      {
        en: 'Guided Biofilm Therapy only — not a 20-minute scale-and-polish.',
        hr: 'Isključivo vođena terapija biofilma (GBT) — ne 20-minutno poliranje.',
      },
      {
        en: 'Routine booking window: about 3–4 weeks.',
        hr: 'Redovni termin: otprilike 3–4 tjedna.',
      },
      {
        en: 'Home-care coaching folded into each GBT session.',
        hr: 'Poduka o kućnoj njezi ugrađena u svaki GBT posjet.',
      },
    ],
    included: [
      {
        procedureId: 'gbt',
        qty: 3,
        chair: 'hygiene',
        note: {
          en: 'Three full GBT protocols (disclosure, AIRFLOW, PIEZON, check).',
          hr: 'Tri puna GBT protokola (indikator, AIRFLOW, PIEZON, kontrola).',
        },
      },
    ],
    defaultAnnualFee: 380,
    defaultCopay: {
      diagnostics: 0.9,
      hygiene: 0.85,
      nonsurgical: 0.88,
      surgical: 0.88,
      regenerative: 0.9,
      mucogingival: 0.9,
      implants: 0.92,
      adjuncts: 0.9,
    },
    waitDays: 24,
    educationHours: 1,
    courtesyEur: 5,
    feeMath: {
      en: '3 × GBT × 70 min = 3.50 h × €110 hygiene chair-hour = €385, minus €5 courtesy → €380. List (high-end) €525. After GBT powder (€84) the chair holds €85/h — above the €65 hygiene floor. Surgery stays at 88% patient co-pay so this tier is not a discount club for flaps.',
      hr: '3 × GBT × 70 min = 3,50 h × 110 €/h higijenske stolice = 385 €, minus 5 € ustupka → 380 €. Cjenik (high-end) 525 €. Nakon praha (€84) stolica drži 85 €/h — iznad praga higijene od 65 €. Kirurgija ostaje na 88 % doplate da ova razina ne postane klub za jeftine režnjeve.',
    },
  },
  {
    id: 'active',
    roman: 'II',
    name: { en: 'Cause-related year', hr: 'Godina uzročne terapije' },
    shortName: { en: 'Active therapy', hr: 'Aktivna terapija' },
    intendedFor: {
      en: 'First year of cause-related therapy: new Stage II–III, relapse, or the patient who otherwise abandons SRP midway.',
      hr: 'Prva godina uzročne terapije: novi stadij II–III, recidiv, ili pacijent koji inače odustane usred SRP-a.',
    },
    clinicalGoal: {
      en: 'Adherence through the hard year: exam, GBT, iTOP coaching and first SPT are inside the retainer; SRP is on a lower co-pay, not given away.',
      hr: 'Pridržavanje kroz tešku godinu: pregled, GBT, iTOP poduka i prvi SPT u članarini; SRP na nižoj doplatnoj stopi, ne besplatno.',
    },
    protocols: [
      {
        en: 'Structured CRT pathway: specialist exam → GBT → closed SRP → SPT.',
        hr: 'Strukturirani put uzročne terapije: specijalistički pregled → GBT → zatvoreni SRP → SPT.',
      },
      {
        en: 'Booking window: about 10–14 days during active therapy.',
        hr: 'Termini: otprilike 10–14 dana tijekom aktivne terapije.',
      },
      {
        en: 'Written home protocol after iTOP; second GBT after debridement.',
        hr: 'Pisani kućni protokol nakon iTOP-a; drugi GBT nakon debridmana.',
      },
    ],
    included: [
      { procedureId: 'perio-exam', qty: 1, chair: 'specialist' },
      {
        procedureId: 'gbt',
        qty: 2,
        chair: 'hygiene',
        note: {
          en: 'Pre-SRP biofilm session and post-debridement GBT.',
          hr: 'GBT prije SRP-a i GBT nakon debridmana.',
        },
      },
      { procedureId: 'ohi', qty: 1, chair: 'hygiene' },
      {
        procedureId: 'spt',
        qty: 1,
        chair: 'hygiene',
        note: {
          en: 'First supportive visit after cause-related therapy.',
          hr: 'Prvi potporni posjet nakon uzročne terapije.',
        },
      },
    ],
    defaultAnnualFee: 540,
    defaultCopay: {
      diagnostics: 0.65,
      hygiene: 0.58,
      nonsurgical: 0.62,
      surgical: 0.68,
      regenerative: 0.72,
      mucogingival: 0.72,
      implants: 0.78,
      adjuncts: 0.7,
    },
    waitDays: 12,
    educationHours: 2,
    courtesyEur: 19,
    feeMath: {
      en: 'Exam 0.83 h × €165 = €137. GBT ×2 + OHI + SPT = 3.83 h × €110 = €422. Chair-value €559, minus €19 CRT-year courtesy → €540. SRP is not included: patient still pays 62% of the professional fee so four quadrants remain a real, viable session. Residual flap work sits at 68% co-pay — help, not a loss-leader.',
      hr: 'Pregled 0,83 h × 165 € = 137 €. GBT ×2 + OHI + SPT = 3,83 h × 110 € = 422 €. Vrijednost stolice 559 €, minus 19 € ustupka za godinu CRT-a → 540 €. SRP nije uključen: pacijent i dalje plaća 62 % profesionalnog dijela pa četiri kvadranta ostaju održiva. Preostali režanj na 68 % doplate — pomoć, ne mamac s gubitkom.',
    },
  },
  {
    id: 'specialist',
    roman: 'III',
    name: { en: 'Specialist continuum', hr: 'Specijalistički kontinuitet' },
    shortName: { en: 'Specialist', hr: 'Specijalist' },
    intendedFor: {
      en: 'High-risk SPT, residual pockets, or the patient who needs regen / plastic later without leaving the recall system.',
      hr: 'SPT visokog rizika, preostali džepovi, ili pacijent kojem će trebati regeneracija / plastika, a da ne napusti recall.',
    },
    clinicalGoal: {
      en: 'More and better care: quarterly GBT, microscope as default, priority slots, written annual report. Bigger help on regen and mucogingival — still a co-pay.',
      hr: 'Više i bolje skrbi: kvartalni GBT, mikroskop kao standard, prioritetni termini, pisano godišnje izvješće. Veća pomoć na regeneraciji i mukogingivali — i dalje uz doplatu.',
    },
    protocols: [
      {
        en: 'Microscope-supported specialist time on exam and surgery.',
        hr: 'Specijalističko vrijeme uz mikroskop na pregledu i kirurgiji.',
      },
      {
        en: 'Priority diary: about 5–7 days.',
        hr: 'Prioritetni raspored: otprilike 5–7 dana.',
      },
      {
        en: 'Written annual periodontal report (second-opinion grade).',
        hr: 'Pisano godišnje parodontološko izvješće (razine second-opinion).',
      },
      {
        en: 'Quarterly GBT — never a “polish between surgeries”.',
        hr: 'Kvartalni GBT — nikad „poliranje između operacija“.',
      },
    ],
    included: [
      { procedureId: 'perio-exam', qty: 1, chair: 'specialist' },
      { procedureId: 'status-photos', qty: 1, chair: 'specialist' },
      {
        procedureId: 'second-opinion',
        qty: 1,
        chair: 'specialist',
        note: {
          en: 'Written annual report to the patient and referring dentist.',
          hr: 'Pisano godišnje izvješće pacijentu i uputnom stomatologu.',
        },
      },
      { procedureId: 'gbt', qty: 4, chair: 'hygiene' },
      { procedureId: 'ohi', qty: 1, chair: 'hygiene' },
    ],
    defaultAnnualFee: 840,
    defaultCopay: {
      diagnostics: 0.5,
      hygiene: 0.42,
      nonsurgical: 0.5,
      surgical: 0.52,
      regenerative: 0.45,
      mucogingival: 0.45,
      implants: 0.58,
      adjuncts: 0.48,
    },
    waitDays: 6,
    educationHours: 3,
    courtesyEur: 49,
    feeMath: {
      en: 'Hygiene 5.33 h × €110 = €587. Specialist exam + photos + report 1.83 h × €165 = €302. Chair-value €889, minus €49 retention courtesy → €840. List of included high-end lines ≈ €1,115. Regenerative / plastic co-pay 45% of professional fee; implants stay higher (58%) so fixture cost is not socialised.',
      hr: 'Higijena 5,33 h × 110 € = 587 €. Specijalist pregled + fotografije + izvješće 1,83 h × 165 € = 302 €. Vrijednost stolice 889 €, minus 49 € ustupka za ostanak → 840 €. Cjenik uključenih high-end stavki ≈ 1.115 €. Regeneracija / plastika 45 % profesionalnog dijela; implanti ostaju viši (58 %) da se cijena fiksture ne socijalizira.',
    },
  },
  {
    id: 'atelier',
    roman: 'IV',
    name: { en: 'Atelier concierge', hr: 'Atelier konzjerž' },
    shortName: { en: 'Atelier', hr: 'Atelier' },
    intendedFor: {
      en: 'Stage IV / full-mouth reconstructive year, peri-implant risk, or the patient who needs a coordinator and guest hygiene visits.',
      hr: 'Stadij IV / godina pune rekonstrukcije, periimplantni rizik, ili pacijent kojem treba koordinator i gostujući higijenski posjeti.',
    },
    clinicalGoal: {
      en: 'Lowest co-pay on almost everything, including implants and regen — still not free care. The retainer buys access, GBT, reporting and two guest hygiene visits. Surgical time must remain viable.',
      hr: 'Najniža doplata na gotovo sve, uključujući implante i regeneraciju — i dalje nije besplatna skrb. Članarina kupuje pristup, GBT, izvješća i dva gostujuća higijenska posjeta. Kirurško vrijeme mora ostati održivo.',
    },
    protocols: [
      {
        en: 'Same-week / 48-hour priority for acute perio and peri-implant problems.',
        hr: 'Prioritet u istom tjednu / 48 sati za akutne parodontološke i periimplantne tegobe.',
      },
      {
        en: 'Annual comprehensive exam, dual-jaw CBCT, photo status, written report.',
        hr: 'Godišnji sveobuhvatni pregled, CBCT obje čeljusti, foto-status, pisano izvješće.',
      },
      {
        en: 'Two guest GBT visits (partner / family) on the same diary rules.',
        hr: 'Dva gostujuća GBT posjeta (partner / obitelj) po istim pravilima termina.',
      },
      {
        en: 'Named coordinator; microscope and GBT as non-negotiable protocol.',
        hr: 'Imenovani koordinator; mikroskop i GBT kao neupitni protokol.',
      },
    ],
    included: [
      { procedureId: 'perio-exam', qty: 1, chair: 'specialist' },
      { procedureId: 'cbct-full', qty: 1, chair: 'specialist' },
      { procedureId: 'status-photos', qty: 1, chair: 'specialist' },
      { procedureId: 'second-opinion', qty: 1, chair: 'specialist' },
      {
        procedureId: 'gbt',
        qty: 6,
        chair: 'hygiene',
        note: {
          en: 'Four patient GBT sessions plus two guest hygienist visits.',
          hr: 'Četiri GBT posjeta pacijenta plus dva gostujuća higijenska posjeta.',
        },
      },
      { procedureId: 'ohi', qty: 2, chair: 'hygiene' },
    ],
    defaultAnnualFee: 1240,
    defaultCopay: {
      diagnostics: 0.3,
      hygiene: 0.28,
      nonsurgical: 0.32,
      surgical: 0.38,
      regenerative: 0.3,
      mucogingival: 0.36,
      implants: 0.38,
      adjuncts: 0.32,
    },
    waitDays: 2,
    educationHours: 4,
    courtesyEur: 35,
    feeMath: {
      en: 'Hygiene 8.33 h × €110 = €917 (6 × GBT including guests + 2 × OHI). Specialist 2.17 h × €165 = €358. Chair-value €1,275, minus €35 → €1,240. List of included high-end lines ≈ €1,700. Flap/tunnel at 36–38% of professional fee lands near €90–110/h — below the €140 specialist floor. The retainer funds hygiene and access, not resective time. Raise surgical co-pay or keep this tier off surgery-heavy years that are not also implant/regen-heavy.',
      hr: 'Higijena 8,33 h × 110 € = 917 € (6 × GBT uključujući goste + 2 × OHI). Specijalist 2,17 h × 165 € = 358 €. Vrijednost stolice 1.275 €, minus 35 € → 1.240 €. Cjenik uključenih high-end stavki ≈ 1.700 €. Režanj/tunel na 36–38 % profesionalnog dijela daje oko 90–110 €/h — ispod praga specijalista od 140 €. Članarina financira higijenu i pristup, ne resekcijsko vrijeme. Podignite doplatu na kirurgiji ili ovu razinu ne dajte na godine pune režnjeva bez regeneracije/implanata.',
    },
  },
]

export const PERSONAS: PatientPersona[] = [
  {
    id: 'spt-stable',
    name: { en: 'Stable SPT year', hr: 'Stabilna SPT godina' },
    stage: { en: 'Healthy / maintenance', hr: 'Zdrav / održavanje' },
    description: {
      en: 'Treated periodontitis, now in recall: three GBT sessions and one annual iTOP refresh. No surgery.',
      hr: 'Izlječeni parodontitis u recall-u: tri GBT posjeta i jedan godišnji iTOP. Bez kirurgije.',
    },
    lines: [
      { procedureId: 'gbt', qty: 3 },
      { procedureId: 'ohi', qty: 1 },
    ],
  },
  {
    id: 'stage3-year',
    name: { en: 'Stage III — first year', hr: 'Stadij III — prva godina' },
    stage: { en: 'Cause-related + one residual flap', hr: 'Uzročna terapija + jedan preostali režanj' },
    description: {
      en: 'New generalised Stage III: specialist exam, imaging, two GBT, four-quadrant SRP, local antimicrobials, two SPT visits, and one residual open-flap quadrant. The classic “hard year”.',
      hr: 'Novi generalizirani stadij III: specijalistički pregled, snimanje, dva GBT, SRP četiri kvadranta, lokalni antimikrobici, dva SPT posjeta i jedan preostali otvoreni režanj. Klasična „teška godina“.',
    },
    lines: [
      { procedureId: 'perio-exam', qty: 1 },
      { procedureId: 'opg', qty: 1 },
      { procedureId: 'status-photos', qty: 1 },
      { procedureId: 'ohi', qty: 1 },
      { procedureId: 'gbt', qty: 2 },
      { procedureId: 'srp-quad', qty: 4 },
      { procedureId: 'local-abx', qty: 4 },
      { procedureId: 'spt', qty: 2 },
      { procedureId: 'ofd-quad', qty: 1 },
    ],
  },
  {
    id: 'stage4-recon',
    name: { en: 'Stage IV — reconstructive year', hr: 'Stadij IV — rekonstrukcijska godina' },
    stage: { en: 'Full-mouth reconstructive', hr: 'Rekonstrukcija cijelih čeljusti' },
    description: {
      en: 'Unstable Stage IV: comprehensive diagnostics, FMD, three GBT, two hopeless extractions with socket preservation, two Emdogain sites, three-tooth tunnel, two premium guided implants, sedation, and three SPT visits. Surgery-heavy on purpose — this is where a cheap co-pay destroys chair-hour.',
      hr: 'Nestabilni stadij IV: sveobuhvatna dijagnostika, FMD, tri GBT, dva bezizgledna vađenja sa socket preservation, dva Emdogain mjesta, tunel na tri zuba, dva premium vođena implanta, sedacija i tri SPT posjeta. Namjerno kirurški teška godina — tu jeftina doplata uništava sat stolice.',
    },
    lines: [
      { procedureId: 'perio-exam', qty: 1 },
      { procedureId: 'cbct-full', qty: 1 },
      { procedureId: 'status-photos', qty: 1 },
      { procedureId: 'second-opinion', qty: 1 },
      { procedureId: 'ohi', qty: 2 },
      { procedureId: 'gbt', qty: 3 },
      { procedureId: 'fmd', qty: 1 },
      { procedureId: 'emdogain', qty: 2 },
      { procedureId: 'prf', qty: 1 },
      { procedureId: 'tunnel', qty: 3 },
      { procedureId: 'ex-surg', qty: 2 },
      { procedureId: 'socket', qty: 2 },
      { procedureId: 'implant-prem', qty: 2 },
      { procedureId: 'sedation', qty: 2 },
      { procedureId: 'spt', qty: 3 },
    ],
  },
]

/** Probe procedures used in the ROI panel (list vs each tier after co-pay). */
export const ROI_PROBE_IDS = ['ofd-quad', 'emdogain', 'tunnel', 'implant-prem'] as const

export function categoryOf(procedureId: string, extras?: ProcedureLite[]): CareCategory {
  const extra = extras?.find((p) => p.id === procedureId)
  const raw = extra?.category ?? procedureById[procedureId]?.category
  if (raw && (CARE_CATEGORIES as string[]).includes(raw)) return raw as CareCategory
  return 'adjuncts'
}

export function materialOf(procedureId: string, column: PriceColumn): number {
  const proc = procedureById[procedureId]
  if (!proc) return 0
  return column === 'economic' ? proc.materialEconomic : proc.materialHighend
}

export function professionalFee(list: number, material: number): number {
  return Math.max(0, list - material)
}

export function patientPaysExtra(list: number, material: number, copay: number): number {
  return material + copay * professionalFee(list, material)
}

export function clinicCoversExtra(list: number, material: number, copay: number): number {
  return (1 - copay) * professionalFee(list, material)
}

/** €/chair-hour after materials — wraps src/lib/roi.ts chairHourNet. */
export function chairHourAfterMaterials(price: number, material: number, timeMinutes: number): number | null {
  if (timeMinutes <= 0) return null
  return chairHourNet(price, material, timeMinutes)
}

export function copayChairHour(
  list: number,
  material: number,
  timeMinutes: number,
  copay: number,
): number | null {
  const patientPay = patientPaysExtra(list, material, copay)
  return chairHourAfterMaterials(patientPay, material, timeMinutes)
}

export type LineSettlement = {
  procedureId: string
  qty: number
  includedQty: number
  extraQty: number
  listEach: number
  materialEach: number
  copay: number
  payg: number
  patient: number
  clinicCovered: number
  hours: number
}

function includedPool(tier: MembershipTierDef): Map<string, number> {
  const map = new Map<string, number>()
  for (const line of tier.included) {
    map.set(line.procedureId, (map.get(line.procedureId) ?? 0) + line.qty)
  }
  return map
}

export function settleLines(
  lines: PersonaLine[],
  tier: MembershipTierDef,
  copay: CopayMap,
  getPrice: GetPrice,
  column: PriceColumn,
  extras?: ProcedureLite[],
): LineSettlement[] {
  const pool = includedPool(tier)
  return lines.map((line) => {
    const remaining = pool.get(line.procedureId) ?? 0
    const includedQty = Math.min(line.qty, remaining)
    const extraQty = line.qty - includedQty
    pool.set(line.procedureId, remaining - includedQty)
    const listEach = getPrice(line.procedureId, column)
    const materialEach = materialOf(line.procedureId, column)
    const cat = categoryOf(line.procedureId, extras)
    const rate = copay[cat]
    const extraPatient = extraQty * patientPaysExtra(listEach, materialEach, rate)
    const extraCovered = extraQty * clinicCoversExtra(listEach, materialEach, rate)
    return {
      procedureId: line.procedureId,
      qty: line.qty,
      includedQty,
      extraQty,
      listEach,
      materialEach,
      copay: rate,
      payg: line.qty * listEach,
      patient: extraPatient,
      clinicCovered: includedQty * listEach + extraCovered,
      hours: hoursOf(line.procedureId, line.qty, extras),
    }
  })
}

export type YearResult = {
  personaId: string
  tierId: string
  payg: number
  retainer: number
  copays: number
  patientTotal: number
  saveVsPayg: number
  clinicRevenue: number
  materials: number
  hours: number
  paygChairHour: number | null
  memberChairHour: number | null
  viability: 'sound' | 'thin' | 'loss'
  surgeryWarnings: string[]
}

export function yearForPersona(
  persona: PatientPersona,
  tier: MembershipTierDef,
  retainer: number,
  copay: CopayMap,
  getPrice: GetPrice,
  column: PriceColumn,
  extras?: ProcedureLite[],
): YearResult {
  const settled = settleLines(persona.lines, tier, copay, getPrice, column, extras)
  const payg = settled.reduce((s, l) => s + l.payg, 0)
  const copays = settled.reduce((s, l) => s + l.patient, 0)
  const materials = settled.reduce((s, l) => s + l.materialEach * l.qty, 0)
  const hours = settled.reduce((s, l) => s + l.hours, 0)
  const patientTotal = retainer + copays
  const clinicRevenue = retainer + copays
  const paygChairHour = hours > 0 ? chairHourNet(payg, materials, hours * 60) : null
  const memberChairHour = hours > 0 ? chairHourNet(clinicRevenue, materials, hours * 60) : null

  const surgeryWarnings: string[] = []
  for (const line of settled) {
    const cat = categoryOf(line.procedureId, extras)
    if (cat !== 'surgical' && cat !== 'regenerative' && cat !== 'mucogingival' && cat !== 'implants') {
      continue
    }
    if (line.extraQty <= 0) continue
    const minutes = (line.hours / line.qty) * 60
    const ch = copayChairHour(line.listEach, line.materialEach, minutes, line.copay)
    if (ch != null && ch < SUSTAINABLE_RATES.specialistFloor) {
      surgeryWarnings.push(line.procedureId)
    }
  }

  let viability: YearResult['viability'] = 'sound'
  if (memberChairHour != null && memberChairHour < SUSTAINABLE_RATES.blendedLoss) viability = 'loss'
  else if (memberChairHour != null && memberChairHour < SUSTAINABLE_RATES.blendedThin) viability = 'thin'
  if (surgeryWarnings.length >= 2 && viability === 'sound') viability = 'thin'

  return {
    personaId: persona.id,
    tierId: tier.id,
    payg,
    retainer,
    copays,
    patientTotal,
    saveVsPayg: payg - patientTotal,
    clinicRevenue,
    materials,
    hours,
    paygChairHour,
    memberChairHour,
    viability,
    surgeryWarnings,
  }
}

export function probeChairHours(
  _tier: MembershipTierDef,
  copay: CopayMap,
  getPrice: GetPrice,
  column: PriceColumn,
  extras?: ProcedureLite[],
): { procedureId: string; listHour: number | null; memberHour: number | null; belowFloor: boolean }[] {
  return ROI_PROBE_IDS.map((procedureId) => {
    const list = getPrice(procedureId, column)
    const material = materialOf(procedureId, column)
    const minutes = extras?.find((p) => p.id === procedureId)?.timeMinutes ?? procedureById[procedureId]?.timeMinutes ?? 0
    const cat = categoryOf(procedureId, extras)
    const rate = copay[cat]
    const listHour = chairHourAfterMaterials(list, material, minutes)
    const memberHour = copayChairHour(list, material, minutes, rate)
    return {
      procedureId,
      listHour,
      memberHour,
      belowFloor: memberHour != null && memberHour < SUSTAINABLE_RATES.specialistFloor,
    }
  })
}

export const PROCEDURE_LABELS: Record<string, Bilingual> = {
  gbt: { en: 'Guided Biofilm Therapy — full protocol', hr: 'Vođena terapija biofilma (GBT) — puni protokol' },
  'perio-exam': { en: 'Specialist periodontal examination', hr: 'Specijalistički parodontološki pregled' },
  ohi: { en: 'Personalised oral-hygiene instruction (iTOP-style)', hr: 'Personalizirana poduka o oralnoj higijeni (iTOP)' },
  spt: { en: 'Periodontal maintenance (SPT / recall)', hr: 'Potporna parodontološka terapija (SPT / recall)' },
  'status-photos': { en: 'Periodontal photo status & digital records', hr: 'Parodontološki foto-status i digitalni zapisi' },
  'second-opinion': { en: 'Written second opinion / referral report', hr: 'Pisano mišljenje / izvješće uputnom liječniku' },
  'cbct-full': { en: 'CBCT — both jaws', hr: 'CBCT — obje čeljusti' },
  opg: { en: 'Panoramic radiograph (OPG)', hr: 'Ortopan (OPG)' },
  'srp-quad': { en: 'Scaling & root planing — per quadrant', hr: 'SRP / zatvorena kiretaža — po kvadrantu' },
  'local-abx': { en: 'Local delivery antimicrobials (per site)', hr: 'Lokalni antimikrobici (po mjestu)' },
  'ofd-quad': { en: 'Open-flap debridement — per quadrant', hr: 'Otvoreni režanj / debridman — po kvadrantu' },
  fmd: { en: 'Full-mouth disinfection (FMD) protocol', hr: 'Dezinfekcija cijelih usta (FMD)' },
  emdogain: { en: 'Enamel-matrix (Emdogain) regenerative site', hr: 'Regeneracija caklinskim matriksom (Emdogain)' },
  prf: { en: 'PRF / CGF / PRGF biologic (per session)', hr: 'PRF / CGF / PRGF biologik (po seansi)' },
  tunnel: { en: 'Tunnel / CAF recession coverage — per tooth', hr: 'Tunel / CAF pokrivanje recesije — po zubu' },
  'ex-surg': { en: 'Extraction of hopeless perio tooth — surgical', hr: 'Kirurško vađenje bezizglednog parodontološkog zuba' },
  socket: { en: 'Socket preservation (graft ± PRF ± membrane)', hr: 'Očuvanje alveole (graft ± PRF ± membrana)' },
  'implant-prem': { en: 'Single implant — premium + fully guided', hr: 'Jedan implantat — premium + vođeno' },
  sedation: { en: 'IV / conscious sedation — per hour', hr: 'IV / svjesna sedacija — po satu' },
}

export function procedureName(id: string, locale: Locale, extras?: ProcedureLite[]): string {
  const labeled = PROCEDURE_LABELS[id]
  if (labeled) return labeled[locale]
  return extras?.find((p) => p.id === id)?.name ?? procedureById[id]?.name ?? id
}

export function defaultCatalogLite(): ProcedureLite[] {
  return catalog.map((p) => ({
    id: p.id,
    name: p.name,
    timeMinutes: p.timeMinutes,
    category: p.category,
  }))
}

export function cloneCopay(c: CopayMap): CopayMap {
  return { ...c }
}
