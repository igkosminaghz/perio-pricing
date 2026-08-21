/**
 * EFP S3-inspired sequencing for a Croatian specialist periodontal clinic.
 * Prices are applied in Planner via getPrice — this module is clinical only.
 */

export type Locale = 'en' | 'hr'
export type Extent = 'localised' | 'generalised'
export type Stage = 1 | 2 | 3 | 4
export type Grade = 'A' | 'B' | 'C'
export type ChartingMode = 'estimate' | 'chart'
export type SrpPattern = 'auto' | 'quadrant' | 'halfmouth' | 'fmd'
export type VisitPhase =
  | 'diagnostics'
  | 'hygiene'
  | 'nonsurgical'
  | 'reeval'
  | 'surgical'
  | 'reconstructive'
  | 'spt'

export interface ChartingInput {
  bopPercent?: number
  deepestPd?: number
  sites56?: number
  sites7plus?: number
  furcation?: boolean
  mobility?: boolean
  smoker?: boolean
  diabetes?: boolean
  implants?: boolean
  toothCount?: number
}

export interface ProtocolInput {
  extent: Extent
  stage: Stage
  grade: Grade
  chartingMode: ChartingMode
  charting: ChartingInput
  srpPattern: SrpPattern
}

export interface ResolvedChart {
  bopPercent: number
  deepestPd: number
  sites56: number
  sites7plus: number
  furcation: boolean
  mobility: boolean
  smoker: boolean
  diabetes: boolean
  implants: boolean
  toothCount: number
  estimatedFields: string[]
}

export interface VisitLine {
  procedureId: string
  quantity: number
}

export interface PlannedVisit {
  id: string
  visitNumber: number
  week: number
  elapsedDays: number
  gapDaysAfterPrevious: number
  phase: VisitPhase
  title: { en: string; hr: string }
  note: { en: string; hr: string }
  lines: VisitLine[]
}

export interface ProtocolNote {
  kind: 'info' | 'caution' | 'host'
  en: string
  hr: string
}

export interface ProtocolPlan {
  diagnosis: { en: string; hr: string }
  pathway: { en: string; hr: string }
  chart: ResolvedChart
  visits: PlannedVisit[]
  notes: ProtocolNote[]
  srpPatternUsed: Exclude<SrpPattern, 'auto'>
  surgeryScheduled: boolean
  regenScheduled: boolean
  firstYearSptIntervalDays: number
}

export const PROCEDURE_LABEL: Record<string, { en: string; hr: string }> = {
  consult: { en: 'General consultation', hr: 'Opća konzultacija' },
  'perio-exam': { en: 'Specialist periodontal examination', hr: 'Specijalistički parodontološki pregled' },
  'full-chart': { en: 'Full-mouth periodontal charting', hr: 'Cjelovita parodontološka kartica' },
  opg: { en: 'Panoramic radiograph (OPG)', hr: 'Ortopantomogram (OPG)' },
  'cbct-seg': { en: 'CBCT — segment / quadrant', hr: 'CBCT — segment / kvadrant' },
  'cbct-full': { en: 'CBCT — both jaws', hr: 'CBCT — obje čeljusti' },
  'status-photos': { en: 'Periodontal photo status', hr: 'Fotostatus parodonta' },
  gbt: { en: 'Guided Biofilm Therapy — full protocol', hr: 'Vođena terapija biofilma (GBT)' },
  ohi: { en: 'Personalised oral-hygiene instruction', hr: 'Individualna instrukcija higijene' },
  'srp-tooth': { en: 'Scaling & root planing — per tooth', hr: 'SRP — po zubu' },
  'srp-quad': { en: 'Scaling & root planing — per quadrant', hr: 'SRP — po kvadrantu' },
  'srp-arch': { en: 'Scaling & root planing — per arch', hr: 'SRP — po čeljusti' },
  fmd: { en: 'Full-mouth disinfection (FMD) protocol', hr: 'Protokol dezinfekcije cijelih usta (FMD)' },
  spt: { en: 'Periodontal maintenance (SPT)', hr: 'Potporna parodontološka terapija (SPT)' },
  'ofd-quad': { en: 'Open-flap debridement — per quadrant', hr: 'Režanjska obrada — po kvadrantu' },
  'osseous-quad': { en: 'Osseous / resective surgery — quadrant', hr: 'Resektivna / koštana kirurgija — kvadrant' },
  'ex-simple': { en: 'Extraction of hopeless tooth — simple', hr: 'Ekstrakcija beznadnog zuba — jednostavna' },
  'ex-surg': { en: 'Extraction of hopeless tooth — surgical', hr: 'Ekstrakcija beznadnog zuba — kirurška' },
  socket: { en: 'Socket preservation', hr: 'Preservacija alveole' },
  emdogain: { en: 'Enamel-matrix (Emdogain) regenerative site', hr: 'Regeneracija emajl-matriksom (Emdogain)' },
  'gtr-small': { en: 'Guided tissue regeneration — small defect', hr: 'Vodena regeneracija tkiva — mali defekt' },
  prf: { en: 'PRF / CGF biologic', hr: 'PRF / CGF biologik' },
  'ctg-tooth': { en: 'Connective-tissue graft — per tooth', hr: 'Transplantat vezivnog tkiva — po zubu' },
  tunnel: { en: 'Tunnel / CAF recession coverage', hr: 'Tunel / CAF pokrivanje recesije' },
  'implant-prem': { en: 'Single implant — premium + guided', hr: 'Jedan implantat — premium, vođeno' },
  'peri-muc': { en: 'Peri-implant mucositis — non-surgical', hr: 'Periimplantni mukozitis — nekirurški' },
  'peri-ns': { en: 'Peri-implantitis — non-surgical', hr: 'Periimplantitis — nekirurški' },
  'splint-ribond': { en: 'Fibre-reinforced splint 3–3', hr: 'Vlaknima ojačana šina 3–3' },
  'splint-tooth': { en: 'Periodontal splint — per tooth', hr: 'Parodontološka šina — po zubu' },
}

export function procedureLabel(id: string, locale: Locale, fallbackName?: string): string {
  const row = PROCEDURE_LABEL[id]
  if (row) return row[locale]
  return fallbackName ?? id
}

export function euroPerChairHour(price: number, materials: number, minutes: number): number | null {
  if (minutes <= 0) return null
  return (price - materials) / (minutes / 60)
}

export function gapLabel(days: number, locale: Locale): string {
  if (locale === 'hr') {
    if (days <= 0) return 'Početak'
    if (days === 1) return '1 dan kasnije'
    if (days < 7) return `${days} dana kasnije (isti tjedan)`
    if (days === 7) return '7 dana kasnije'
    if (days === 14) return '2 tjedna kasnije'
    if (days === 21) return '3 tjedna kasnije'
    if (days === 42) return '6 tjedana kasnije'
    if (days === 49) return '7 tjedana kasnije (reevaluacija)'
    if (days === 56) return '8 tjedana kasnije'
    if (days === 70) return '10 tjedana kasnije'
    if (days === 90) return '3 mjeseca kasnije'
    if (days === 180) return '6 mjeseci kasnije'
    if (days % 7 === 0) {
      const w = days / 7
      return `${w} ${croatianWeeks(w)} kasnije`
    }
    return `${days} dana kasnije`
  }
  if (days <= 0) return 'Start'
  if (days === 1) return '1 day later'
  if (days < 7) return `${days} days later (same week)`
  if (days === 7) return '7 days later'
  if (days === 14) return '2 weeks later'
  if (days === 21) return '3 weeks later'
  if (days === 42) return '6 weeks later'
  if (days === 49) return '7 weeks later (re-evaluation window)'
  if (days === 56) return '8 weeks later'
  if (days === 70) return '10 weeks later'
  if (days === 90) return '3 months later'
  if (days === 180) return '6 months later'
  if (days % 7 === 0) {
    const w = days / 7
    return `${w} week${w === 1 ? '' : 's'} later`
  }
  return `${days} days later`
}

export function weekLabel(week: number, locale: Locale): string {
  return locale === 'hr' ? `Tjedan ${week}` : `Week ${week}`
}

export function resolveChart(input: ProtocolInput): ResolvedChart {
  const { extent, stage, grade, chartingMode, charting } = input
  const estimate = estimateFromSeverity(extent, stage, grade)
  const estimatedFields: string[] = []
  const pick = <K extends 'bopPercent' | 'deepestPd' | 'sites56' | 'sites7plus' | 'toothCount'>(
    key: K,
    raw: number | undefined,
  ): number => {
    if (chartingMode === 'chart' && raw !== undefined && Number.isFinite(raw)) {
      return raw
    }
    estimatedFields.push(key)
    return estimate[key]
  }

  const smoker = charting.smoker ?? estimate.smoker
  const diabetes = charting.diabetes ?? false
  const implants = charting.implants ?? false
  const furcation = charting.furcation ?? estimate.furcation
  const mobility = charting.mobility ?? estimate.mobility

  const bop = pick('bopPercent', charting.bopPercent)
  const pd = pick('deepestPd', charting.deepestPd)
  const s56 = pick('sites56', charting.sites56)
  const s7 = pick('sites7plus', charting.sites7plus)
  const teeth = pick('toothCount', charting.toothCount)

  if (charting.smoker === undefined) estimatedFields.push('smoker')
  if (charting.diabetes === undefined) estimatedFields.push('diabetes')
  if (charting.implants === undefined) estimatedFields.push('implants')
  if (charting.furcation === undefined) estimatedFields.push('furcation')
  if (charting.mobility === undefined) estimatedFields.push('mobility')

  return {
    bopPercent: clamp(bop, 0, 100),
    deepestPd: clamp(pd, 1, 15),
    sites56: Math.max(0, Math.round(s56)),
    sites7plus: Math.max(0, Math.round(s7)),
    furcation,
    mobility,
    smoker,
    diabetes,
    implants,
    toothCount: clamp(Math.round(teeth), 1, 32),
    estimatedFields: [...new Set(estimatedFields)],
  }
}

export function buildProtocol(input: ProtocolInput): ProtocolPlan {
  const chart = resolveChart(input)
  const { extent, stage, grade } = input
  const srpPatternUsed = resolveSrpPattern(input, chart)
  const notes: ProtocolNote[] = []
  const visits: PlannedVisit[] = []
  let elapsed = 0

  const add = (
    gapDays: number,
    spec: {
      id: string
      phase: VisitPhase
      title: { en: string; hr: string }
      note: { en: string; hr: string }
      lines: VisitLine[]
    },
  ) => {
    elapsed += gapDays
    visits.push({
      id: spec.id,
      visitNumber: visits.length + 1,
      week: Math.round(elapsed / 7),
      elapsedDays: elapsed,
      gapDaysAfterPrevious: gapDays,
      phase: spec.phase,
      title: spec.title,
      note: spec.note,
      lines: spec.lines.filter((l) => l.quantity > 0),
    })
  }

  const imaging = imagingLines(stage, extent, chart)
  add(0, {
    id: 'diagnostics',
    phase: 'diagnostics',
    title: {
      en: 'Specialist exam, charting and records',
      hr: 'Specijalistički pregled, kartica i dokumentacija',
    },
    note: {
      en:
        'Step 1 (EFP S3): diagnose, stage and grade, photographs, and a written plan. Charting is performed in this visit — it is not billed twice as a stand-alone chart.',
      hr:
        'Korak 1 (EFP S3): dijagnoza, stadij i stupanj, fotografije i pisani plan. Kartica se radi na ovom posjetu — ne naplaćuje se još jednom kao samostalna stavka.',
    },
    lines: [{ procedureId: 'perio-exam', quantity: 1 }, { procedureId: 'status-photos', quantity: 1 }, ...imaging],
  })

  const periImplantHygiene: VisitLine[] = chart.implants
    ? [{ procedureId: chart.deepestPd >= 6 ? 'peri-ns' : 'peri-muc', quantity: 1 }]
    : []

  add(3, {
    id: 'hygiene-gbt',
    phase: 'hygiene',
    title: {
      en: 'GBT / cause-related hygiene',
      hr: 'GBT / uzročna higijena',
    },
    note: {
      en:
        'Same week as the exam when diaries allow; otherwise within 7 days. Biofilm disclosure, motivation, AIRFLOW/PIEZON. Surgery is not planned before inflammation is controlled.',
      hr:
        'Isti tjedan kao pregled ako raspored dopušta; inače unutar 7 dana. Očitavanje biofilma, motivacija, AIRFLOW/PIEZON. Kirurgija se ne planira prije kontrole upale.',
    },
    lines: [{ procedureId: 'gbt', quantity: 1 }, ...periImplantHygiene],
  })

  if (srpPatternUsed === 'fmd') {
    add(1, {
      id: 'fmd',
      phase: 'nonsurgical',
      title: {
        en: 'Full-mouth disinfection (24-hour protocol)',
        hr: 'Dezinfekcija cijelih usta (protokol 24 h)',
      },
      note: {
        en:
          'Compressed SRP within 24 hours with antiseptics. Chosen only when the patient can tolerate a long sitting and will return for hygiene reinforcement.',
        hr:
          'Sažeti SRP unutar 24 sata s antisepticima. Birati samo ako pacijent podnosi dugo sjedenje i dolazi na pojačanje higijene.',
      },
      lines: [{ procedureId: 'fmd', quantity: 1 }],
    })
  } else {
    const srpVisits = srpVisitPlan(srpPatternUsed, chart, extent, stage)
    srpVisits.forEach((block, i) => {
      add(7, {
        id: `srp-${i + 1}`,
        phase: 'nonsurgical',
        title: block.title,
        note: block.note,
        lines: block.lines,
      })
    })
  }

  add(49, {
    id: 'reeval',
    phase: 'reeval',
    title: {
      en: 'Re-evaluation of cause-related therapy',
      hr: 'Reevaluacija uzročne terapije',
    },
    note: {
      en:
        '6–8 weeks after the last SRP/FMD. Re-probe, BOP, residual pocket map. Surgery is indicated only for remaining deep sites with adequate plaque control — not “because it is Stage III”.',
      hr:
        '6–8 tjedana nakon zadnjeg SRP/FMD. Ponovno sondiranje, BOP, karta rezidualnih džepova. Kirurgija samo za preostala duboka mjesta uz zadovoljavajuću higijenu — ne „zato što je stadij III“.',
    },
    lines: [{ procedureId: 'full-chart', quantity: 1 }],
  })

  const hopeless = estimateHopeless(stage, extent, chart)
  let lastSurgicalWasRegen = false

  if (hopeless > 0) {
    const socketN = Math.min(hopeless, extent === 'localised' ? 1 : 2)
    const lines: VisitLine[] = [
      { procedureId: 'ex-surg', quantity: hopeless },
      ...(chart.mobility ? [{ procedureId: 'splint-ribond', quantity: 1 }] : []),
      ...(socketN > 0 ? [{ procedureId: 'socket', quantity: socketN }] : []),
    ]
    add(14, {
      id: 'stage-iv-exit',
      phase: 'surgical',
      title: {
        en: 'Hopeless teeth, socket care and temporary stability',
        hr: 'Beznadni zubi, alveola i privremena stabilnost',
      },
      note: {
        en:
          'Stage IV: extract hopeless units, preserve selected sockets, and fibre-splint where mobility threatens function. Definitive prosthetics / orthodontics sit with the restorative team — not on this perio walkthrough.',
        hr:
          'Stadij IV: ekstrakcija beznadnih, preservacija odabranih alveola i vlaknasta šina ako pokretljivost ugrožava funkciju. Definitivna protetika / ortodoncija pripada restaurativnom timu — nije na ovom parodontološkom hodogramu.',
      },
      lines,
    })
  }

  const residualQuads = residualSurgicalQuads(stage, extent, chart)
  const canRegen = stage >= 3 && grade !== 'C' && !chart.smoker && (chart.sites7plus > 0 || chart.deepestPd >= 6)
  const useResective = (grade === 'C' || chart.smoker) && residualQuads > 0 && stage >= 3

  let regenScheduled = false
  if (residualQuads > 0) {
    for (let i = 0; i < residualQuads; i++) {
      const isRegenSite = canRegen && i === 0
      const gap = i === 0 ? 14 : 21
      if (isRegenSite) {
        regenScheduled = true
        lastSurgicalWasRegen = true
        add(gap, {
          id: `regen-${i + 1}`,
          phase: 'surgical',
          title: {
            en: 'Regenerative surgery — contained intrabony site',
            hr: 'Regenerativna kirurgija — sadržani intraosealni defekt',
          },
          note: {
            en:
              'Flap + enamel-matrix at a contained defect after inflammation control. Staged sextants: 2–4 weeks between fields. Do not promise regeneration in smokers or Grade C.',
            hr:
              'Režanj + emajl-matriks na sadržanom defektu nakon kontrole upale. Staged sekstanti: 2–4 tjedna između polja. Regeneraciju ne obećavati pušačima ni stupnju C.',
          },
          lines: [{ procedureId: 'emdogain', quantity: 1 }],
        })
      } else if (useResective) {
        add(gap, {
          id: `osseous-${i + 1}`,
          phase: 'surgical',
          title: {
            en: `Resective access — quadrant ${i + 1} of ${residualQuads}`,
            hr: `Resektivni pristup — kvadrant ${i + 1} od ${residualQuads}`,
          },
          note: {
            en:
              'Grade C / smoking: pocket reduction by osseous recontouring is more predictable than biologics. 2–4 weeks between staged quadrants.',
            hr:
              'Stupanj C / pušenje: redukcija džepa koštanim rekonturiranjem predvidljivija je od biologika. 2–4 tjedna između kvadranata.',
          },
          lines: [{ procedureId: 'osseous-quad', quantity: 1 }],
        })
      } else {
        add(gap, {
          id: `ofd-${i + 1}`,
          phase: 'surgical',
          title: {
            en: `Open-flap debridement — quadrant ${i + 1} of ${residualQuads}`,
            hr: `Režanjska obrada — kvadrant ${i + 1} od ${residualQuads}`,
          },
          note: {
            en:
              'Access flap for residual pockets after re-evaluation — not a heroic full-mouth session. 2–4 weeks between staged quadrants.',
            hr:
              'Pristupni režanj za rezidualne džepove nakon reevaluacije — ne herojska sjednica cijelih usta. 2–4 tjedna između kvadranata.',
          },
          lines: [{ procedureId: 'ofd-quad', quantity: 1 }],
        })
      }
    }
  }

  const surgeryScheduled = residualQuads > 0 || hopeless > 0

  const implantOk =
    stage === 4 && hopeless > 0 && grade !== 'C' && !chart.smoker && !chart.diabetes
  if (implantOk) {
    add(lastSurgicalWasRegen ? 180 : 90, {
      id: 'delayed-implant',
      phase: 'reconstructive',
      title: {
        en: 'Delayed implant in a perio-stable site',
        hr: 'Odgođeni implantat na parodontološki stabilnom mjestu',
      },
      note: {
        en: lastSurgicalWasRegen
          ? 'Wait ~6 months after regeneration before placing an implant in that site. Quote is per fixture; abutment and crown are prosthetic.'
          : 'Place only after periodontal stability. ~3 months after extraction/socket; abutment and crown are not on this list.',
        hr: lastSurgicalWasRegen
          ? 'Pričekati ~6 mjeseci nakon regeneracije prije implantata na tom mjestu. Cijena je po fiksturi; abatment i kruna su protetika.'
          : 'Postaviti tek nakon parodontološke stabilnosti. ~3 mjeseca nakon ekstrakcije/alveole; abatment i kruna nisu na ovom cjeniku.',
      },
      lines: [{ procedureId: 'implant-prem', quantity: 1 }],
    })
  } else if (stage === 4 && hopeless > 0) {
    notes.push({
      kind: 'caution',
      en:
        'Implant replacement is not auto-scheduled (Grade C, smoking, or diabetes). Reconstruct only after stability and host-risk counselling — do not oversell.',
      hr:
        'Nadomjestak implantatom nije automatski u planu (stupanj C, pušenje ili dijabetes). Rekonstrukcija tek nakon stabilnosti i razgovora o riziku domaćina — ne preprodavati.',
    })
  }

  if (stage >= 3 && grade !== 'C' && !chart.smoker) {
    notes.push({
      kind: 'info',
      en:
        'Mucogingival surgery (CTG / tunnel) is not booked automatically. Add only after inflammation control if recession or a thin phenotype still limits cleaning or aesthetics.',
      hr:
        'Mukogingivalna kirurgija (CTG / tunel) nije automatski naručena. Dodati tek nakon kontrole upale ako recesija ili tanki fenotip i dalje otežavaju higijenu ili estetiku.',
    })
  }

  const sptInterval = sptIntervalDays(grade, chart)
  const firstSptGap = surgeryScheduled ? 42 : 90
  for (let i = 0; i < 4; i++) {
    add(i === 0 ? firstSptGap : sptInterval, {
      id: `spt-${i + 1}`,
      phase: 'spt',
      title: {
        en: `Supportive periodontal therapy — visit ${i + 1} of 4 (year 1)`,
        hr: `Potporna terapija — posjet ${i + 1} od 4 (1. godina)`,
      },
      note: {
        en:
          i === 0
            ? `First SPT ${surgeryScheduled ? '6 weeks after last surgery' : '3 months after re-evaluation'}. Year-1 interval ${sptInterval === 70 ? '≈10 weeks (high risk)' : '3 months'}.`
            : `Stay on ${sptInterval === 70 ? '8–12 week' : '3-month'} recall in year 1. Year 2+ is risk-based (3–12 months), not “once a year by default”.`,
        hr:
          i === 0
            ? `Prvi SPT ${surgeryScheduled ? '6 tjedana nakon zadnje kirurgije' : '3 mjeseca nakon reevaluacije'}. Interval 1. godine ${sptInterval === 70 ? '≈10 tjedana (visoki rizik)' : '3 mjeseca'}.`
            : `U 1. godini ostati na ${sptInterval === 70 ? '8–12 tjedana' : '3 mjeseca'}. Od 2. godine interval prema riziku (3–12 mjeseci), ne „jednom godišnje po defaultu“.`,
      },
      lines: [{ procedureId: 'spt', quantity: 1 }],
    })
  }

  if (input.chartingMode === 'estimate') {
    notes.unshift({
      kind: 'info',
      en:
        'No chart was entered — pocket counts and imaging are estimated from Stage/Grade. Visit 1 still records a real six-point chart before this sequence is confirmed.',
      hr:
        'Kartica nije unesena — broj džepova i snimanje procijenjeni su iz stadija/stupnja. Posjet 1 i dalje snima pravu šestotočkastu karticu prije potvrde ovog niza.',
    })
  }

  if (grade === 'C' || chart.smoker) {
    notes.push({
      kind: 'host',
      en:
        'Grade C and/or smoking: expect a longer SPT horizon, guarded regenerative prognosis, and smoking-cessation counselling. Do not sell Emdogain as a predictable fix.',
      hr:
        'Stupanj C i/ili pušenje: dulji SPT, oprezna prognoza regeneracije i savjet prestanka pušenja. Emdogain ne prodavati kao predvidljivo rješenje.',
    })
  }
  if (chart.diabetes) {
    notes.push({
      kind: 'host',
      en:
        'Diabetes: confirm glycaemic control with the physician. Healing and SPT intervals are tighter; implants are deferred unless the medical picture is stable.',
      hr:
        'Dijabetes: potvrditi glikemijsku kontrolu s liječnikom. Cijeljenje i SPT su stroži; implantati se odgađaju dok medicinska slika nije stabilna.',
    })
  }
  if (stage <= 2 && residualQuads === 0) {
    notes.push({
      kind: 'info',
      en: 'Stage I–II: non-surgical therapy plus SPT is the default. Surgery is uncommon unless deep residual sites or furcation appear at re-evaluation.',
      hr: 'Stadij I–II: nekirurška terapija plus SPT je standard. Kirurgija je rijetka osim ako na reevaluaciji ostanu duboki džepovi ili furkacije.',
    })
  }

  return {
    diagnosis: {
      en: `${extent === 'localised' ? 'Localised' : 'Generalised'} periodontitis, Stage ${roman(stage)} Grade ${grade} (EFP 2018)`,
      hr: `${extent === 'localised' ? 'Lokalizirani' : 'Generalizirani'} parodontitis, stadij ${roman(stage)} stupanj ${grade} (EFP 2018)`,
    },
    pathway: pathwayCopy(stage, srpPatternUsed, surgeryScheduled, regenScheduled),
    chart,
    visits,
    notes,
    srpPatternUsed,
    surgeryScheduled,
    regenScheduled,
    firstYearSptIntervalDays: sptInterval,
  }
}

function estimateFromSeverity(extent: Extent, stage: Stage, grade: Grade): ResolvedChart {
  const gen = extent === 'generalised'
  const gradeBump = grade === 'C' ? 10 : grade === 'A' ? -8 : 0
  const byStage: Record<Stage, Omit<ResolvedChart, 'estimatedFields' | 'smoker' | 'diabetes' | 'implants'>> = {
    1: {
      bopPercent: gen ? 22 : 14,
      deepestPd: 4,
      sites56: gen ? 6 : 3,
      sites7plus: 0,
      furcation: false,
      mobility: false,
      toothCount: 28,
    },
    2: {
      bopPercent: gen ? 32 : 20,
      deepestPd: 5,
      sites56: gen ? 12 : 5,
      sites7plus: 0,
      furcation: false,
      mobility: false,
      toothCount: 28,
    },
    3: {
      bopPercent: gen ? 42 : 28,
      deepestPd: 7,
      sites56: gen ? 16 : 7,
      sites7plus: gen ? 6 : 2,
      furcation: gen,
      mobility: false,
      toothCount: 26,
    },
    4: {
      bopPercent: gen ? 52 : 34,
      deepestPd: 8,
      sites56: gen ? 18 : 8,
      sites7plus: gen ? 10 : 3,
      furcation: true,
      mobility: true,
      toothCount: gen ? 20 : 24,
    },
  }
  const base = byStage[stage]
  return {
    ...base,
    bopPercent: clamp(base.bopPercent + gradeBump, 8, 90),
    smoker: grade === 'C',
    diabetes: false,
    implants: false,
    estimatedFields: [],
  }
}

function resolveSrpPattern(input: ProtocolInput, chart: ResolvedChart): Exclude<SrpPattern, 'auto'> {
  if (input.srpPattern !== 'auto') return input.srpPattern
  const deep = chart.sites56 + chart.sites7plus
  if (input.extent === 'localised' && deep <= 3 && input.stage <= 2) return 'quadrant'
  if (input.extent === 'localised') return 'quadrant'
  if (input.stage >= 2 || deep >= 8) return 'halfmouth'
  return 'quadrant'
}

function srpVisitPlan(
  pattern: 'quadrant' | 'halfmouth',
  chart: ResolvedChart,
  extent: Extent,
  stage: Stage,
): { title: { en: string; hr: string }; note: { en: string; hr: string }; lines: VisitLine[] }[] {
  const deep = chart.sites56 + chart.sites7plus
  if (extent === 'localised' && deep > 0 && deep <= 3 && stage <= 2) {
    return [
      {
        title: {
          en: 'Site-specific SRP (localised)',
          hr: 'SRP po zubu (lokalizirano)',
        },
        note: {
          en: 'Few involved teeth — closed debridement per tooth rather than a full quadrant sitting.',
          hr: 'Malo zahvaćenih zuba — zatvorena obrada po zubu umjesto cijelog kvadranta.',
        },
        lines: [{ procedureId: 'srp-tooth', quantity: Math.max(deep, 1) }],
      },
    ]
  }

  const quadCount =
    extent === 'localised' ? (stage <= 2 && deep <= 6 ? 1 : 2) : pattern === 'halfmouth' ? 4 : stage === 1 ? 2 : 4

  if (pattern === 'halfmouth' && quadCount >= 3) {
    return [1, 2].map((n) => ({
      title: {
        en: `Half-mouth SRP — sitting ${n} of 2`,
        hr: `SRP polovice usta — sjednica ${n} od 2`,
      },
      note: {
        en:
          'Two quadrants in one visit (not all four). 7-day gap between half-mouths. A single heroic four-quadrant sitting is reserved for the named FMD protocol.',
        hr:
          'Dva kvadranta u jednom posjetu (ne sva četiri). Razmak 7 dana između polovica. Jedna herojska sjednica sva četiri kvadranta ostaje za imenovani FMD protokol.',
      },
      lines: [{ procedureId: 'srp-quad', quantity: 2 }],
    }))
  }

  return Array.from({ length: Math.max(quadCount, 1) }, (_, i) => ({
    title: {
      en: `SRP — quadrant ${i + 1} of ${Math.max(quadCount, 1)}`,
      hr: `SRP — kvadrant ${i + 1} od ${Math.max(quadCount, 1)}`,
    },
    note: {
      en: 'Closed cause-related therapy, one quadrant per visit, 7 days between sittings.',
      hr: 'Zatvorena uzročna terapija, jedan kvadrant po posjetu, 7 dana između sjednica.',
    },
    lines: [{ procedureId: 'srp-quad', quantity: 1 }],
  }))
}

function imagingLines(stage: Stage, extent: Extent, chart: ResolvedChart): VisitLine[] {
  const lines: VisitLine[] = [{ procedureId: 'opg', quantity: 1 }]
  const needCbct =
    stage >= 3 || chart.furcation || chart.implants || chart.deepestPd >= 7 || chart.sites7plus > 0
  if (!needCbct) return lines
  if (stage === 4 && extent === 'generalised') {
    lines.push({ procedureId: 'cbct-full', quantity: 1 })
  } else {
    lines.push({ procedureId: 'cbct-seg', quantity: 1 })
  }
  return lines
}

function residualSurgicalQuads(stage: Stage, extent: Extent, chart: ResolvedChart): number {
  if (stage <= 1) return 0
  if (stage === 2) {
    if (chart.sites7plus > 0 || chart.furcation || chart.deepestPd >= 7) return 1
    return 0
  }
  if (stage === 3) {
    if (extent === 'localised') return 1
    return chart.sites7plus >= 8 ? 2 : 1
  }
  return extent === 'localised' ? 1 : 2
}

function estimateHopeless(stage: Stage, extent: Extent, chart: ResolvedChart): number {
  if (stage < 4) return 0
  const lost = Math.max(0, 28 - chart.toothCount)
  const extra = chart.mobility ? (extent === 'localised' ? 2 : 3) : extent === 'localised' ? 1 : 2
  return clamp(Math.max(extra - Math.min(lost, 2), 1), 1, 4)
}

function sptIntervalDays(grade: Grade, chart: ResolvedChart): number {
  if (grade === 'C' || chart.smoker || chart.diabetes) return 70
  if (grade === 'A') return 90
  return 90
}

function pathwayCopy(
  stage: Stage,
  srp: Exclude<SrpPattern, 'auto'>,
  surgery: boolean,
  regen: boolean,
): { en: string; hr: string } {
  const srpBit =
    srp === 'fmd'
      ? { en: 'FMD', hr: 'FMD' }
      : srp === 'halfmouth'
        ? { en: 'staged half-mouth SRP', hr: 'stupnjeviti SRP polovica usta' }
        : { en: 'staged quadrant SRP', hr: 'stupnjeviti SRP po kvadrantu' }
  if (stage <= 2 && !surgery) {
    return {
      en: `Diagnosis → GBT → ${srpBit.en} → re-evaluation (6–8 weeks) → SPT year 1`,
      hr: `Dijagnoza → GBT → ${srpBit.hr} → reevaluacija (6–8 tjedana) → SPT 1. godina`,
    }
  }
  return {
    en: `Diagnosis → GBT → ${srpBit.en} → re-evaluation → ${regen ? 'regen / ' : ''}surgery (staged) → SPT year 1`,
    hr: `Dijagnoza → GBT → ${srpBit.hr} → reevaluacija → ${regen ? 'regeneracija / ' : ''}kirurgija (stupnjevito) → SPT 1. godina`,
  }
}

function roman(stage: Stage): string {
  return (['I', 'II', 'III', 'IV'] as const)[stage - 1]
}

function croatianWeeks(n: number): string {
  if (n === 1) return 'tjedan'
  if (n >= 2 && n <= 4) return 'tjedna'
  return 'tjedana'
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}
