import type { CurrencyCode, Observation } from '../types'
import { toEur } from '../lib/format'

let n = 0
function obs(
  clinicId: string,
  procedureId: string,
  originalAmount: number,
  originalCurrency: CurrencyCode,
  opts?: { estimated?: boolean; note?: string; rangeHigh?: number },
): Observation {
  n += 1
  const rangeHighEur =
    opts?.rangeHigh != null ? toEur(opts.rangeHigh, originalCurrency) : undefined
  return {
    id: `o${n}`,
    clinicId,
    procedureId,
    originalAmount,
    originalCurrency,
    eur: toEur(originalAmount, originalCurrency),
    rangeHighEur,
    estimated: opts?.estimated ?? false,
    note: opts?.note,
  }
}

export const observations: Observation[] = [
  // —— Croatia: Jovičević Zagreb ——
  obs('jovic', 'perio-exam', 55, 'EUR', { note: 'Listed as specialist examination (diagnostics).' }),
  obs('jovic', 'opg', 30, 'EUR'),
  obs('jovic', 'cbct-seg', 40, 'EUR'),
  obs('jovic', 'cbct-full', 80, 'EUR', { note: 'Published as CBCT jaw scan.' }),
  obs('jovic', 'prophy', 60, 'EUR', { note: 'Dental scale cleaning.' }),
  obs('jovic', 'airflow', 15, 'EUR', { note: 'Sandblasting — unusually low; likely add-on not a full session.' }),
  obs('jovic', 'srp-arch', 340, 'EUR', { note: 'Scraping and polishing roots per jaw (higher of two listed values).' }),
  obs('jovic', 'srp-arch', 270, 'EUR', { note: 'Second listed per-jaw root planing tariff.' }),
  obs('jovic', 'spt', 90, 'EUR', { note: 'Parodontological recall.' }),
  obs('jovic', 'emdogain', 800, 'EUR', {
    note: 'Listed only as “regenerative therapy” — mapped to EMD-class site; material not specified.',
  }),
  obs('jovic', 'recession-quad', 400, 'EUR', { note: 'Overlap of recessions per quadrant.' }),
  obs('jovic', 'cl-est', 400, 'EUR', { note: 'Clinical extension of tooth crown 3–3.' }),
  obs('jovic', 'cl-est', 530, 'EUR', { note: 'Gummy smile correction 6–6.' }),
  obs('jovic', 'splint-ribond', 280, 'EUR'),
  obs('jovic', 'membrane', 200, 'EUR', { note: 'Collagen membrane (surgery section).' }),
  obs('jovic', 'ex-simple', 30, 'EUR'),
  obs('jovic', 'ex-surg', 80, 'EUR', { note: 'Complicated extraction + suture.' }),
  obs('jovic', 'implant-prem', 750, 'EUR', { note: 'Straumann premium implant, fixture.' }),

  // —— B.DENT Zagreb ——
  obs('bdent', 'srp-tooth', 80, 'EUR', { note: 'Gingival curettage per tooth — high vs regional per-tooth norms.' }),
  obs('bdent', 'srp-quad', 140, 'EUR'),
  obs('bdent', 'spt', 60, 'EUR'),
  obs('bdent', 'prophy', 40, 'EUR', { note: 'Deep scaling and sandblasting per jaw.' }),
  obs('bdent', 'ex-simple', 100, 'EUR'),
  obs('bdent', 'implant-prem', 790, 'EUR', { note: 'Nobel Biocare premium implant.' }),

  // —— Esthetic Dental Center Zagreb ——
  obs('esthetic', 'prophy', 60, 'EUR'),
  obs('esthetic', 'airflow', 60, 'EUR', { note: 'Tooth sandblasting.' }),
  obs('esthetic', 'gbt', 130, 'EUR', {
    note: '“Minimally invasive hygiene – Acteon Protocol” used as GBT-class analogue.',
  }),
  obs('esthetic', 'srp-tooth', 40, 'EUR'),
  obs('esthetic', 'srp-arch', 465, 'EUR', { note: 'Minimally invasive deep cleaning – full arch.' }),
  obs('esthetic', 'ofd-quad', 265, 'EUR', { note: 'Open curettage per quadrant.' }),
  obs('esthetic', 'ging-tooth', 55, 'EUR'),
  obs('esthetic', 'recession-quad', 600, 'EUR', {
    note: 'Periodontal surgery (crown lengthening, recession coverage) per quadrant — bundled line.',
  }),
  obs('esthetic', 'cl-est', 600, 'EUR', { note: 'Same bundled perio-surgery quadrant tariff.' }),
  obs('esthetic', 'opg', 40, 'EUR'),
  obs('esthetic', 'cbct-seg', 30, 'EUR', { note: 'CBCT per tooth.' }),
  obs('esthetic', 'cbct-full', 110, 'EUR'),
  obs('esthetic', 'ex-simple', 65, 'EUR'),
  obs('esthetic', 'ex-surg', 90, 'EUR', { note: 'Complicated extraction.' }),
  obs('esthetic', 'sedation', 600, 'EUR', { note: 'Session price, not strictly per hour.' }),
  obs('esthetic', 'graft-bone', 350, 'EUR', { note: 'Bone augmentation with membrane (1 g).' }),
  obs('esthetic', 'dsd', 200, 'EUR'),
  obs('esthetic', 'implant-prem', 850, 'EUR', { note: 'Straumann/Nobel list price before promo.' }),

  // —— Videntis Zagreb ——
  obs('videntis', 'consult', 0, 'EUR', { note: 'Professional consultations listed as free.' }),
  obs('videntis', 'perio-exam', 60, 'EUR', { note: 'Initial specialist check-up.' }),
  obs('videntis', 'prophy', 85, 'EUR', { note: 'Professional teeth cleaning, first visit.' }),
  obs('videntis', 'srp-tooth', 40, 'EUR'),
  obs('videntis', 'ging-tooth', 70, 'EUR'),
  obs('videntis', 'ozone', 20, 'EUR'),
  obs('videntis', 'prf', 130, 'EUR', { note: 'PRF membrane.' }),
  obs('videntis', 'ex-simple', 70, 'EUR'),
  obs('videntis', 'ex-surg', 100, 'EUR'),
  obs('videntis', 'implant-prem', 800, 'EUR', { note: 'Straumann SLActive.' }),

  // —— Gašparac Zagreb ——
  obs('gasparac', 'srp-quad', 110, 'EUR', { note: 'Classic closed curettage per quadrant.' }),
  obs('gasparac', 'ofd-quad', 250, 'EUR', { note: 'Open (surgical) curettage per quadrant.' }),
  obs('gasparac', 'cl-func', 115, 'EUR', { note: 'Surgical crown lengthening — unit not fully specified.' }),
  obs('gasparac', 'prophy', 50, 'EUR'),
  obs('gasparac', 'airflow', 30, 'EUR'),
  obs('gasparac', 'opg', 27, 'EUR'),
  obs('gasparac', 'ex-simple', 60, 'EUR'),
  obs('gasparac', 'ex-surg', 180, 'EUR', { note: 'Operative extraction.' }),
  obs('gasparac', 'graft-bone', 240, 'EUR', { note: 'From-price for artificial bone regeneration.' }),
  obs('gasparac', 'prf', 110, 'EUR'),
  obs('gasparac', 'dsd', 150, 'EUR'),
  obs('gasparac', 'implant-prem', 770, 'EUR', { note: 'Straumann implant.' }),

  // —— Unique Smile Zagreb ——
  obs('unique', 'consult', 20, 'EUR'),
  obs('unique', 'prophy', 50, 'EUR'),
  obs('unique', 'srp-quad', 100, 'EUR'),
  obs('unique', 'srp-tooth', 30, 'EUR', { note: 'Pocket curettage.' }),
  obs('unique', 'fmd', 500, 'EUR', { note: 'Listed as “initial periodontal therapy” — mapped to FMD-class course.' }),
  obs('unique', 'ex-simple', 50, 'EUR'),
  obs('unique', 'ex-surg', 80, 'EUR'),

  // —— Dr.O Zagreb ——
  obs('dro', 'consult', 50, 'EUR'),
  obs('dro', 'prophy', 50, 'EUR'),
  obs('dro', 'airflow', 50, 'EUR'),
  obs('dro', 'srp-arch', 300, 'EUR'),
  obs('dro', 'srp-tooth', 40, 'EUR', { note: 'Pocket cleaning.' }),
  obs('dro', 'cl-func', 50, 'EUR', { note: 'Clinical crown lengthening (procedure).' }),
  obs('dro', 'cl-est', 150, 'EUR', { note: 'Surgical crown lengthening per jaw.' }),
  obs('dro', 'ctg-tooth', 200, 'EUR', { note: 'Recession coverage — unit not fully specified; treated as per-case/tooth.' }),
  obs('dro', 'ging-tooth', 50, 'EUR'),
  obs('dro', 'ging-quad', 150, 'EUR'),
  obs('dro', 'frenectomy', 100, 'EUR', { note: 'Frenulotomy.' }),
  obs('dro', 'frenectomy', 200, 'EUR', { note: 'Frenectomy.' }),
  obs('dro', 'ex-simple', 50, 'EUR'),
  obs('dro', 'ex-surg', 100, 'EUR'),
  obs('dro', 'graft-bone', 250, 'EUR'),
  obs('dro', 'membrane', 350, 'EUR', { note: 'Resorbable membrane with pins.' }),
  obs('dro', 'prf', 300, 'EUR', { note: 'PRGF Endoret tissue regeneration.' }),
  obs('dro', 'peri-ns', 150, 'EUR', { note: 'Sanacija periimplantitisa per implant — likely limited non-surgical.' }),
  obs('dro', 'sedation', 400, 'EUR'),
  obs('dro', 'opg', 40, 'EUR'),
  obs('dro', 'cbct-full', 90, 'EUR'),
  obs('dro', 'implant-prem', 800, 'EUR', { note: 'Straumann.' }),
  obs('dro', 'implant-std', 700, 'EUR', { note: 'Neodent / Astra.' }),

  // —— Dental Mimica ——
  obs('mimica', 'prophy', 55, 'EUR'),
  obs('mimica', 'airflow', 40, 'EUR'),
  obs('mimica', 'srp-tooth', 20, 'EUR'),
  obs('mimica', 'fmd', 400, 'EUR', {
    note: 'Parodontalna th. (čzk + kiretaža) €400–900; lower bound used.',
    rangeHigh: 900,
  }),
  obs('mimica', 'splint-tooth', 30, 'EUR'),
  obs('mimica', 'ofd-quad', 300, 'EUR', { note: 'Flap operation — field size not specified.' }),
  obs('mimica', 'gtr-small', 300, 'EUR', { note: 'Guided bone and tissue regeneration — size not specified.' }),
  obs('mimica', 'cl-func', 200, 'EUR', { note: 'From-price per tooth.' }),
  obs('mimica', 'recession-quad', 700, 'EUR', { note: 'Root coverage €700–1,000.', rangeHigh: 1000 }),
  obs('mimica', 'membrane', 280, 'EUR', { note: 'Membrane placement €280–340.', rangeHigh: 340 }),
  obs('mimica', 'frenectomy', 200, 'EUR'),
  obs('mimica', 'vestibulo', 400, 'EUR'),
  obs('mimica', 'socket', 200, 'EUR', { note: 'Alveolar augmentation.' }),
  obs('mimica', 'ex-simple', 60, 'EUR'),
  obs('mimica', 'ex-surg', 100, 'EUR'),
  obs('mimica', 'cbct-full', 80, 'EUR', { note: 'CBCT listed €30–80; upper used for dual-jaw analogue.', rangeHigh: 80 }),
  obs('mimica', 'implant-prem', 750, 'EUR'),

  // —— Orto Nova Rijeka (strongest HR perio menu) ——
  obs('ortonova', 'srp-tooth', 30, 'EUR', { note: 'Initial periodontal therapy per tooth.' }),
  obs('ortonova', 'srp-quad', 200, 'EUR'),
  obs('ortonova', 'srp-arch', 300, 'EUR'),
  obs('ortonova', 'vector', 100, 'EUR', { note: 'From-price, Vector TM.' }),
  obs('ortonova', 'fgg-small', 300, 'EUR'),
  obs('ortonova', 'fgg-large', 500, 'EUR'),
  obs('ortonova', 'ctg-tooth', 200, 'EUR', { note: 'Recession coverage with graft, per tooth.' }),
  obs('ortonova', 'gtr-small', 400, 'EUR'),
  obs('ortonova', 'gtr-large', 600, 'EUR'),
  obs('ortonova', 'prophy', 45, 'EUR'),
  obs('ortonova', 'airflow', 25, 'EUR'),
  obs('ortonova', 'ging-tooth', 40, 'EUR', { note: 'Laser gingivectomy per tooth.' }),
  obs('ortonova', 'opg', 35, 'EUR'),
  obs('ortonova', 'cbct-seg', 50, 'EUR'),
  obs('ortonova', 'cbct-full', 150, 'EUR'),
  obs('ortonova', 'ex-simple', 55, 'EUR'),
  obs('ortonova', 'ex-surg', 150, 'EUR'),
  obs('ortonova', 'graft-bone', 200, 'EUR', { note: 'Bone + membrane per tooth, from-price.' }),
  obs('ortonova', 'prf', 210, 'EUR'),
  obs('ortonova', 'sedation', 280, 'EUR'),
  obs('ortonova', 'implant-prem', 850, 'EUR', { note: 'NobelActive.' }),
  obs('ortonova', 'implant-std', 535, 'EUR', { note: 'Neodent.' }),

  // —— Swiss Dental HR ——
  obs('swiss', 'srp-quad', 86, 'EUR'),
  obs('swiss', 'ofd-quad', 450, 'EUR', { note: 'Operative curettage per quadrant — high vs Croatian peers.' }),
  obs('swiss', 'fmd', 520, 'EUR', { note: 'Periodontitis therapy, whole mouth.' }),

  // —— OrthoDental Slovenia ——
  obs('orthodental', 'perio-exam', 120, 'EUR'),
  obs('orthodental', 'srp-quad', 150, 'EUR'),
  obs('orthodental', 'srp-tooth', 30, 'EUR'),
  obs('orthodental', 'laser-perio', 230, 'EUR'),
  obs('orthodental', 'ofd-quad', 360, 'EUR', { note: 'Flap surgery per sextant — mapped to quadrant/sextant surgical access.' }),
  obs('orthodental', 'prophy', 60, 'EUR', { note: 'Hygiene package (from related SI page).' }),
  obs('orthodental', 'airflow', 50, 'EUR', { note: 'Sandblasting per jaw (from related SI page).' }),
  obs('orthodental', 'ging-tooth', 100, 'EUR', { note: 'From related Slovenian price page.' }),
  obs('orthodental', 'cbct-full', 80, 'EUR'),

  // —— PotočnikMikuž SI specialist ——
  obs('potocnik', 'perio-exam', 100, 'EUR', { note: '45 min specialist visit; imaging extra.' }),
  obs('potocnik', 'srp-tooth', 40, 'EUR'),
  obs('potocnik', 'frenectomy', 150, 'EUR'),
  obs('potocnik', 'ofd-quad', 320, 'EUR', { note: 'Flap surgery €320–550.', rangeHigh: 550 }),
  obs('potocnik', 'gtr-small', 380, 'EUR'),
  obs('potocnik', 'cl-func', 330, 'EUR', { note: 'Surgical crown lengthening €330–550.', rangeHigh: 550 }),
  obs('potocnik', 'peri-surg', 500, 'EUR'),

  // —— DCT Krško ——
  obs('dct', 'consult', 35, 'EUR'),
  obs('dct', 'perio-exam', 50, 'EUR'),
  obs('dct', 'opg', 25, 'EUR'),
  obs('dct', 'cbct-seg', 50, 'EUR'),
  obs('dct', 'cbct-full', 110, 'EUR'),
  obs('dct', 'prophy', 25, 'EUR', { note: 'Soft and hard plaque per jaw.' }),
  obs('dct', 'airflow', 20, 'EUR', { note: 'Sanding per jaw.' }),
  obs('dct', 'srp-tooth', 10, 'EUR', { note: 'Curettage of a periodontal pocket — ordinary-clinic low outlier.' }),
  obs('dct', 'ging-tooth', 30, 'EUR'),
  obs('dct', 'cl-func', 100, 'EUR'),
  obs('dct', 'ofd-quad', 150, 'EUR', { note: 'Lobe (flap) surgery per quadrant €150–200.', rangeHigh: 200 }),
  obs('dct', 'graft-bone', 390, 'EUR', { note: 'Bone substitute and membrane (combined).' }),
  obs('dct', 'frenectomy', 100, 'EUR', { note: 'Soft-tissue surgery (frenectomy, fibroma).' }),
  obs('dct', 'ex-simple', 30, 'EUR', { note: '€30–50.', rangeHigh: 50 }),
  obs('dct', 'ex-surg', 70, 'EUR'),
  obs('dct', 'implant-std', 550, 'EUR', { note: 'Neodent.' }),

  // —— SanusDent SI ——
  obs('sanus', 'consult', 30, 'EUR'),
  obs('sanus', 'perio-exam', 50, 'EUR', { note: 'Periodontal disease measurements.' }),
  obs('sanus', 'prophy', 40, 'EUR', { note: 'Calculus removal and polish per arch.' }),
  obs('sanus', 'airflow', 25, 'EUR', { note: 'Per arch.' }),
  obs('sanus', 'srp-tooth', 15, 'EUR'),
  obs('sanus', 'fmd', 150, 'EUR', { note: 'FMD — one dental arch only, not full mouth.' }),
  obs('sanus', 'opg', 25, 'EUR'),
  obs('sanus', 'cbct-seg', 50, 'EUR', { note: 'CBCT from-price.' }),
  obs('sanus', 'ex-simple', 70, 'EUR'),
  obs('sanus', 'graft-bone', 150, 'EUR', { note: 'Bone addition from-price.' }),
  obs('sanus', 'implant-std', 650, 'EUR'),

  // —— Sorident Italy ——
  obs('sorident', 'perio-exam', 50, 'EUR', { note: 'Specialist visit.' }),
  obs('sorident', 'prophy', 70, 'EUR'),
  obs('sorident', 'opg', 50, 'EUR'),
  obs('sorident', 'srp-quad', 80, 'EUR', { note: 'Closed curettage / root planing per quadrant.' }),
  obs('sorident', 'ofd-quad', 285, 'EUR', { note: 'Open curettage per quadrant.' }),
  obs('sorident', 'cl-func', 190, 'EUR', { note: 'Crown lengthening 1 tooth.' }),
  obs('sorident', 'fgg-small', 370, 'EUR'),
  obs('sorident', 'ctg-tooth', 390, 'EUR', { note: 'Bilaminar graft with intra-oral harvest.' }),
  obs('sorident', 'tunnel', 285, 'EUR', { note: 'CAF or rotated flap — technique analogue.' }),
  obs('sorident', 'osseous-quad', 350, 'EUR'),
  obs('sorident', 'ging-tooth', 55, 'EUR'),
  obs('sorident', 'ging-quad', 190, 'EUR'),
  obs('sorident', 'gtr-small', 250, 'EUR', { note: 'GTR with resorbable membrane, biomaterial excluded.' }),
  obs('sorident', 'graft-bone', 190, 'EUR', { note: 'Osteo-substitute for one tooth.' }),
  obs('sorident', 'membrane', 290, 'EUR', { note: 'Resorbable membrane (implantology list).' }),
  obs('sorident', 'frenectomy', 90, 'EUR'),
  obs('sorident', 'ex-simple', 70, 'EUR'),
  obs('sorident', 'ex-surg', 90, 'EUR'),
  obs('sorident', 'sedation', 400, 'EUR', { note: 'From-price.' }),
  obs('sorident', 'implant-std', 550, 'EUR'),

  // —— Italian 2026 nomenclatore (benchmark) ——
  obs('andi2026', 'srp-quad', 100, 'EUR', {
    estimated: true,
    note: 'F.6.1 Scaling per emiarcata (half-arch) — mapped to quadrant for comparison.',
  }),
  obs('andi2026', 'ofd-quad', 190, 'EUR', {
    estimated: true,
    note: 'Mucogingival flap with apical reposition and open scaling.',
  }),
  obs('andi2026', 'tunnel', 250, 'EUR', {
    estimated: true,
    note: 'CAF / root coverage including CTG, any number of teeth — generous bundle vs per-tooth pricing.',
  }),
  obs('andi2026', 'ging-tooth', 40, 'EUR', { estimated: true }),
  obs('andi2026', 'ging-quad', 200, 'EUR', { estimated: true, note: 'Gingivectomy emiarcata.' }),
  obs('andi2026', 'osseous-quad', 300, 'EUR', { estimated: true, note: 'Resective osseous surgery per emiarcata.' }),
  obs('andi2026', 'cl-func', 200, 'EUR', { estimated: true, note: 'Crown lengthening regardless of tooth count.' }),
  obs('andi2026', 'gtr-small', 320, 'EUR', { estimated: true, note: 'Regenerative surgery with biomaterials per emiarcata.' }),
  obs('andi2026', 'ex-simple', 55, 'EUR', { estimated: true }),
  obs('andi2026', 'ex-surg', 150, 'EUR', { estimated: true, note: 'Surgical extraction including impacted thirds.' }),

  // —— FOXXI Budapest (HUF, list from 1 Jun 2026) ——
  obs('foxxi', 'consult', 30000, 'HUF'),
  obs('foxxi', 'perio-exam', 30000, 'HUF', { note: 'Periodontal assessment / control, 30 min.' }),
  obs('foxxi', 'opg', 10000, 'HUF'),
  obs('foxxi', 'gbt', 40000, 'HUF', {
    note: 'Complex hygiene package 60 min: US + Airflow + polish + advice — GBT-class analogue.',
  }),
  obs('foxxi', 'ohi', 45000, 'HUF', { note: 'iTOP 45 min.' }),
  obs('foxxi', 'srp-quad', 90000, 'HUF', { note: 'Closed curettage per quadrant.' }),
  obs('foxxi', 'ofd-quad', 165000, 'HUF', {
    note: 'Regenerative perio surgery / open curettage per region — may include biomaterial.',
  }),
  obs('foxxi', 'ex-simple', 45000, 'HUF', { note: 'From-price.' }),
  obs('foxxi', 'ex-surg', 70000, 'HUF', { note: 'From-price.' }),

  // —— Differental Budapest ——
  obs('differental', 'consult', 31000, 'HUF', { note: '€-equivalent of 31–36k HUF screening.', rangeHigh: 36000 }),
  obs('differental', 'full-chart', 9000, 'HUF', { note: 'Periodontal status recording per arch.' }),
  obs('differental', 'ohi', 26000, 'HUF'),
  obs('differental', 'opg', 9000, 'HUF'),
  obs('differental', 'cbct-full', 31000, 'HUF', { note: 'Upper of CT volume range 13–31k HUF.', rangeHigh: 31000 }),
  obs('differental', 'prophy', 20000, 'HUF', { note: 'Per jaw.' }),
  obs('differental', 'airflow', 26000, 'HUF', { note: 'Supragingival prophylaxis + air polish per jaw.' }),
  obs('differental', 'srp-tooth', 13000, 'HUF'),
  obs('differental', 'srp-arch', 100000, 'HUF', { note: 'Full-mouth closed curettage / side (arch).' }),
  obs('differental', 'ofd-quad', 152000, 'HUF', { note: 'Open curettage per sextant.' }),
  obs('differental', 'gtr-large', 194000, 'HUF', { note: 'Regenerative periodontal surgery per sextant.' }),
  obs('differental', 'recession-quad', 172000, 'HUF', {
    note: 'Surgical coverage of gum recession (up to 3–4 teeth) 172–211k HUF.',
    rangeHigh: 211000,
  }),
  obs('differental', 'splint-tooth', 17000, 'HUF', { rangeHigh: 24000 }),
  obs('differental', 'cl-func', 34000, 'HUF', { note: 'Crown lengthening per tooth 34–67k HUF.', rangeHigh: 67000 }),
  obs('differental', 'ex-simple', 29000, 'HUF', { rangeHigh: 36000 }),
  obs('differental', 'ex-surg', 43000, 'HUF'),
  obs('differental', 'implant-prem', 326000, 'HUF', { note: 'Ankylos or Nobel Biocare.' }),

  // —— Avicenna Budapest ——
  obs('avicenna', 'perio-exam', 20000, 'HUF', { note: 'Consultation with full-mouth status.' }),
  obs('avicenna', 'spt', 15000, 'HUF', { note: 'Periodontal follow-up, full mouth.' }),
  obs('avicenna', 'prophy', 40000, 'HUF', { note: 'Oral hygiene treatment by periodontist.' }),
  obs('avicenna', 'splint-tooth', 15000, 'HUF', { rangeHigh: 22000 }),
  obs('avicenna', 'srp-arch', 80000, 'HUF', { note: 'Subgingival curettage per half-jaw.' }),
  obs('avicenna', 'srp-tooth', 15000, 'HUF'),
  obs('avicenna', 'srp-quad', 50000, 'HUF'),
  obs('avicenna', 'local-abx', 8000, 'HUF', { note: 'Pocket treatment with medication.' }),
  obs('avicenna', 'ofd-quad', 100000, 'HUF'),
  obs('avicenna', 'ctg-tooth', 55000, 'HUF', { note: 'Recession coverage per tooth.' }),
  obs('avicenna', 'recession-quad', 100000, 'HUF'),

  // —— Egészség és Mosoly Budapest (specialist column) ——
  obs('mosoly', 'srp-tooth', 21000, 'HUF', { note: 'Specialist closed curettage per tooth.' }),
  obs('mosoly', 'srp-quad', 97000, 'HUF', { note: 'Specialist closed curettage per quarter-arch.' }),
  obs('mosoly', 'ofd-quad', 79000, 'HUF', { note: 'Open resective curettage from-price (specialist).' }),
  obs('mosoly', 'gtr-small', 114000, 'HUF', { note: 'Open regenerative curettage from-price (specialist).' }),
  obs('mosoly', 'splint-tooth', 27000, 'HUF'),
  obs('mosoly', 'local-abx', 9000, 'HUF', { note: 'Antiseptic pocket irrigation per tooth.' }),
  obs('mosoly', 'tunnel', 71000, 'HUF', { note: 'Gingivoplasty with displaced flap, from-price.' }),
  obs('mosoly', 'ctg-tooth', 90000, 'HUF', { note: 'Gingivoplasty with autograft, from-price.' }),

  // —— Cellavia Istanbul ——
  obs('cellavia', 'prophy', 100, 'EUR', { note: 'Scaling and calculus removal.' }),
  obs('cellavia', 'srp-arch', 620, 'EUR', { note: 'Curettage, single arch — high vs TR tourism peers; confirm case mix.' }),
  obs('cellavia', 'srp-tooth', 70, 'EUR'),
  obs('cellavia', 'ofd-quad', 90, 'EUR', {
    note: 'Flap including subgingival curettage, single tooth — mapped poorly to quadrant; treated as limited surgical access.',
  }),
  obs('cellavia', 'ex-simple', 90, 'EUR'),
  obs('cellavia', 'ex-surg', 180, 'EUR', { note: 'Complex impacted extraction.' }),
  obs('cellavia', 'implant-prem', 1000, 'EUR', { note: 'Straumann placement only.' }),
  obs('cellavia', 'implant-std', 350, 'EUR', { note: 'Osstem placement only.' }),

  // —— EsteQuality Istanbul (ranges → midpoint) ——
  obs('estequality', 'srp-quad', 115, 'EUR', {
    estimated: true,
    note: 'Published range €80–150 for deep cleaning; midpoint used.',
    rangeHigh: 150,
  }),
  obs('estequality', 'laser-perio', 185, 'EUR', {
    estimated: true,
    note: 'Laser gum treatment €120–250; midpoint.',
    rangeHigh: 250,
  }),
  obs('estequality', 'ctg-tooth', 325, 'EUR', {
    estimated: true,
    note: 'Gum graft surgery €250–400 per tooth/area; midpoint.',
    rangeHigh: 400,
  }),
  obs('estequality', 'perio-exam', 0, 'EUR', { note: 'Consultation & X-rays advertised as free.' }),

  // —— Austria AHR benchmark ——
  obs('ahr', 'perio-exam', 62, 'EUR', { estimated: true, note: 'AHR 2025/26 periodontal basic examination (PGU).' }),
  obs('ahr', 'prophy', 55, 'EUR', { estimated: true, note: 'Supragingival calculus removal per jaw.' }),
  obs('ahr', 'srp-quad', 105, 'EUR', { estimated: true, note: 'Subgingival calculus removal per quadrant (AHR).' }),
  obs('ahr', 'ging-tooth', 121, 'EUR', { estimated: true, note: 'Taschenabtragung (pocket reduction) AHR line.' }),

  // —— Vogdent Sarajevo ——
  obs('vogdent', 'perio-exam', 60, 'BAM', { note: 'Periodontal diagnosis with indices.' }),
  obs('vogdent', 'prophy', 50, 'BAM', { note: 'Supragingival calculus.' }),
  obs('vogdent', 'srp-arch', 100, 'BAM', { note: 'Subgingival calculus (unit: not fully specified).' }),
  obs('vogdent', 'airflow', 30, 'BAM'),
  obs('vogdent', 'cl-func', 240, 'BAM', { note: 'Crown lengthening 1–3 teeth.' }),
  obs('vogdent', 'srp-quad', 200, 'BAM', { note: 'Subgingival curettage per quadrant.' }),

  // —— Dental Oral Centar Belgrade ——
  obs('docbg', 'opg', 20, 'EUR'),
  obs('docbg', 'cbct-full', 83, 'EUR', { note: '3D large scan.' }),
  obs('docbg', 'perio-exam', 50, 'EUR', { note: 'Specialist examination.' }),
  obs('docbg', 'consult', 25, 'EUR'),
  obs('docbg', 'srp-arch', 200, 'EUR', { note: 'Causal therapy of periodontitis per jaw.' }),
  obs('docbg', 'srp-tooth', 30, 'EUR'),
  obs('docbg', 'ofd-quad', 40, 'EUR', { note: 'Flap per tooth — not a true quadrant price; kept as surgical-access analogue.' }),
  obs('docbg', 'gtr-small', 60, 'EUR', { note: 'Flap per tooth with artificial bone.' }),
  obs('docbg', 'recession-quad', 250, 'EUR', { note: 'SMAT / CAF + membrane lines at €250.' }),

  // —— Smile Studio Rijeka (user-adjacent Croatian public floor) ——
  obs('smile-rijeka', 'implant-std', 510, 'EUR', {
    note: 'Published “from” price: analysis + standard implant + surgical placement + post-op reviews. Ordinary-clinic floor, not a specialist perio quote.',
  }),

  // —— External PPP-dampened references for named lines missing in HR/SI/IT/HU/TR ——
  obs('ext-fee', 'endo-perio-quad', 340, 'EUR', {
    estimated: true,
    note: 'US Perioscopy add-on ~$200–500 + SRP midpoint, then ×0.45 toward HR AIC so it sits above Croatian specialist SRP, not at US list.',
  }),
  obs('ext-fee', 'eryag-pocket', 260, 'EUR', {
    estimated: true,
    note: 'Named Er:YAG session prior from regional laser lines + modest specialist lift; not a US LANAP invoice.',
  }),
  obs('ext-fee', 'ndyag-pocket', 310, 'EUR', {
    estimated: true,
    note: 'LANAP-class US fees are far above Croatian PPP; this is a damped analogue of regional laser + time, not $1,000+/quad US quotes.',
  }),
  obs('ext-fee', 'pinhole-class', 520, 'EUR', {
    estimated: true,
    note: 'US pinhole-class ~$1,000–3,000/quad; HR-equivalent used here is ~0.28 of the US midpoint so the line fits a Croatian specialist, not California.',
  }),
  obs('ext-fee', 'vista', 400, 'EUR', {
    estimated: true,
    note: 'Named VISTA sits slightly above regional tunnel/CTG analogues after PPP dampening.',
  }),
  obs('ext-fee', 'peri-implantoplasty', 220, 'EUR', {
    estimated: true,
    note: 'Stand-alone implantoplasty prior from peri-implant surgery comps; rarely itemised.',
  }),
  obs('ext-fee', 'spic', 150, 'EUR', {
    estimated: true,
    note: 'SPIC visit prior from SPT + GBT analogues (HR/SI specialist band).',
  }),
  obs('ext-fee', 'guided-muco', 340, 'EUR', {
    estimated: true,
    note: 'Digital mucogingival guide: DSD + tunnel time, PPP-dampened.',
  }),
  obs('ext-fee', 'mmist', 480, 'EUR', {
    estimated: true,
    note: 'M-MIST prior from small GTR + open-flap specialist medians.',
  }),
  obs('ext-fee', 'xeno-matrix', 420, 'EUR', {
    estimated: true,
    note: 'Collagen-matrix site: CTG analogue with material substituted for harvest time.',
  }),
  obs('ext-fee', 'host-sdd', 85, 'EUR', {
    estimated: true,
    note: 'SDD course + short monitoring visit; medication cost dominates.',
  }),
  obs('ext-fee', 'endo-dx', 160, 'EUR', {
    estimated: true,
    note: 'Diagnostic endoscopy session prior from specialist exam + charting time.',
  }),
  obs('ext-fee', 'scope-add', 110, 'EUR', {
    estimated: true,
    note: 'Microscope hour surcharge; must not double-count when already built into high-end surgical time.',
  }),
  obs('ext-fee', 'sctg-emd', 920, 'EUR', {
    estimated: true,
    note: 'Informed by user perio-case_2026-07-08.json (MCAT + dFGG + dual adjunctives) plus regional CTG/EMD comps, PPP-dampened.',
  }),
  obs('ext-fee', 'emdogain-bone', 980, 'EUR', {
    estimated: true,
    note: 'Combined EMD + graft site; user dual-adjunct case + Jovičević undifferentiated regenerative €800 as HR anchor.',
  }),
]
