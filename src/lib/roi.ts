/**
 * Chair-hour economics for planning.
 *
 * High €/hour is a scheduling and pricelist-design metric. It is not a reason
 * to overtreat, upsell biologics, or stretch a visit. Clinical indication and
 * EFP-staged care come first; these helpers only show which already-indicated
 * items recover overhead more efficiently.
 */

export const ROI_PLANNING_NOTE =
  'High €/hour is planning, not a reason to overtreat. Use chair-hour net to staff and sequence indicated care — never to add procedures a patient does not need.'

export function chairHours(timeMinutes: number): number {
  if (!Number.isFinite(timeMinutes) || timeMinutes <= 0) return 0
  return timeMinutes / 60
}

/** (price − material) / (timeMinutes / 60). Returns 0 if time is zero. */
export function chairHourNet(price: number, material: number, timeMinutes: number): number {
  const hours = chairHours(timeMinutes)
  if (hours <= 0) return 0
  return (price - material) / hours
}

export interface RoiBreakdown {
  price: number
  material: number
  timeMinutes: number
  chairHours: number
  net: number
  eurPerHour: number
  materialShare: number
  note: string
}

export function roiBreakdown(price: number, material: number, timeMinutes: number): RoiBreakdown {
  const hours = chairHours(timeMinutes)
  const net = price - material
  const eurPerHour = hours > 0 ? net / hours : 0
  const materialShare = price > 0 ? material / price : 0
  return {
    price,
    material,
    timeMinutes,
    chairHours: Math.round(hours * 100) / 100,
    net: Math.round(net * 100) / 100,
    eurPerHour: Math.round(eurPerHour * 100) / 100,
    materialShare: Math.round(materialShare * 1000) / 1000,
    note: ROI_PLANNING_NOTE,
  }
}

export interface RoiComparable {
  id: string
  name: string
  price: number
  material: number
  timeMinutes: number
}

export interface RankedRoi extends RoiBreakdown {
  id: string
  name: string
  rank: number
  /** Longer visits that still beat the set’s median €/hour. */
  longVisitHighYield: boolean
}

/**
 * Rank procedures by net €/chair-hour so planners can see which longer
 * items actually earn more per hour than short, low-fee lines.
 */
export function compareChairHourRoi(items: RoiComparable[]): RankedRoi[] {
  const rows = items.map((item) => ({
    ...item,
    ...roiBreakdown(item.price, item.material, item.timeMinutes),
  }))
  const withTime = rows.filter((r) => r.timeMinutes > 0)
  const hourValues = withTime.map((r) => r.eurPerHour).sort((a, b) => a - b)
  const medianHour =
    hourValues.length === 0
      ? 0
      : hourValues.length % 2 === 1
        ? hourValues[Math.floor(hourValues.length / 2)]!
        : (hourValues[hourValues.length / 2 - 1]! + hourValues[hourValues.length / 2]!) / 2
  const medianMinutes =
    withTime.length === 0
      ? 0
      : [...withTime.map((r) => r.timeMinutes)].sort((a, b) => a - b)[Math.floor(withTime.length / 2)]!

  const ranked = [...rows].sort((a, b) => b.eurPerHour - a.eurPerHour)
  return ranked.map((row, i) => ({
    id: row.id,
    name: row.name,
    rank: i + 1,
    longVisitHighYield: row.timeMinutes > medianMinutes && row.eurPerHour > medianHour,
    price: row.price,
    material: row.material,
    timeMinutes: row.timeMinutes,
    chairHours: row.chairHours,
    net: row.net,
    eurPerHour: row.eurPerHour,
    materialShare: row.materialShare,
    note: ROI_PLANNING_NOTE,
  }))
}

export function procedureRoi(
  price: number,
  material: number,
  timeMinutes: number,
): { chairHourNet: number; breakdown: RoiBreakdown } {
  return {
    chairHourNet: chairHourNet(price, material, timeMinutes),
    breakdown: roiBreakdown(price, material, timeMinutes),
  }
}
