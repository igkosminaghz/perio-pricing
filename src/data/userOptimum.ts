/**
 * Ingest of the user’s Croatian “optimum” planning file.
 *
 * Workspace search (root, data/, Downloads-like names, xlsx/csv/pdf/json/md/txt)
 * did not find a dedicated Croatian *price* spreadsheet. The closest user-authored
 * file used to find an optimum for a Croatian mucogingival case is:
 *
 *   C:\Users\igork\Downloads\perio-case_2026-07-08.json
 *
 * That JSON has no euro amounts. It specifies a high-skill recession plan
 * (MCAT tunnel, de-epithelialised FGG, dual adjunctives) that we use as
 * time/material priors for SCTG+Emdogain, VISTA, and combined biologics —
 * i.e. what a specialist Croatian clinic actually does when aiming for an
 * optimum, not a luxury-max quote.
 *
 * A second public Croatian number used here (not in that JSON): Smile Studio
 * Rijeka lists a standard implant from €510 (accessed via published implant page,
 * 21 Aug 2026). That is an ordinary-clinic floor, not a specialist ceiling.
 */

export const USER_OPTIMUM_SOURCE = {
  path: 'C:\\Users\\igork\\Downloads\\perio-case_2026-07-08.json',
  accessed: '2026-08-21',
  kind: 'mucogingival-surgical-optimum' as const,
  cairoRT: 'RT1',
  technique: 'MCAT',
  graftType: 'dFGG',
  adjunctive: 'both',
  note:
    'User case: maxillary RT1, 6 mm recession, MCAT + de-epithelialised FGG, Shanelec knot, dual biologic adjuncts. Used to raise chair-time and material priors for named tunnel/VISTA and SCTG+EMD lines — not as a list price.',
}

/** Extra chair minutes / material implied by the user’s Croatian optimum case. */
export const USER_SURGICAL_PRIORS: Record<
  string,
  { extraMinutes: number; extraMaterialEconomic: number; extraMaterialHighend: number; note: string }
> = {
  'sctg-emd': {
    extraMinutes: 20,
    extraMaterialEconomic: 160,
    extraMaterialHighend: 260,
    note: 'dFGG harvest + EMD (adjunctive: both) from perio-case_2026-07-08.json.',
  },
  vista: {
    extraMinutes: 15,
    extraMaterialEconomic: 20,
    extraMaterialHighend: 35,
    note: 'MCAT/VISTA-class vestibular tunnel; more release time than a simple CAF.',
  },
  'emdogain-bone': {
    extraMinutes: 15,
    extraMaterialEconomic: 80,
    extraMaterialHighend: 140,
    note: 'Dual adjunctive biologics in the user case → EMD + graft construct.',
  },
  'pinhole-class': {
    extraMinutes: 10,
    extraMaterialEconomic: 15,
    extraMaterialHighend: 25,
    note: 'Incision-free coronal advancement is technique-sensitive; still less graft material than dFGG.',
  },
}

/**
 * Weak price priors (EUR) used only when a procedure has few or no sourced fees.
 * Anchored to Croatian specialist chair economics, not US list prices.
 */
export const USER_WEAK_PRICE_PRIORS: Partial<Record<string, { economic: number; highend: number }>> = {
  'sctg-emd': { economic: 780, highend: 1120 },
  vista: { economic: 360, highend: 540 },
  'emdogain-bone': { economic: 860, highend: 1240 },
  'pinhole-class': { economic: 420, highend: 620 },
  'endo-perio-quad': { economic: 280, highend: 420 },
}
