import {
  COMPETENCY_IDS,
  type CompetencyAward,
  type CompetencyId,
  type CompetencyScores,
  type FamilyState,
} from '@/data/types'

import type { CrisisLogEntry } from './state'

export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

/** Safety is always held to 0..100. */
export const clampSafety = (v: number) => clamp(v, 0, 100)

/** Add an option's award onto the running totals. Awards are never negative. */
export const addAward = (
  scores: CompetencyScores,
  award: CompetencyAward | undefined,
): CompetencyScores => {
  if (!award) return scores
  const next = { ...scores }
  for (const id of COMPETENCY_IDS) next[id] += award[id] ?? 0
  return next
}

/**
 * Raw points mean nothing on their own — each competency has a different attainable
 * ceiling, because the hour budget makes some of them cheaper to fill than others.
 * Normalising against those ceilings is what lets the four bars be compared, and
 * comparing them is the whole point: the ending is graded on the weakest one.
 */
export const competencyBars = (
  raw: CompetencyScores,
  ceilings: CompetencyScores,
): CompetencyScores =>
  Object.fromEntries(
    COMPETENCY_IDS.map((id) => [
      id,
      ceilings[id] > 0 ? clamp(Math.round((100 * raw[id]) / ceilings[id]), 0, 100) : 0,
    ]),
  ) as CompetencyScores

/** The bar that decides the ending. Ties resolve in COMPETENCY_IDS order. */
export const weakestCompetency = (bars: CompetencyScores): CompetencyId =>
  COMPETENCY_IDS.reduce((worst, id) => (bars[id] < bars[worst] ? id : worst), COMPETENCY_IDS[0])

export type EndingTier = 'pahlawan' | 'tangguh' | 'duka'

/**
 * Graded on the weakest bar, not the average: you cannot make up for abandoning
 * Nenek by cleaning gutters well.
 */
export const endingTier = (bars: CompetencyScores): EndingTier => {
  const weakest = bars[weakestCompetency(bars)]
  if (weakest >= 70) return 'pahlawan'
  if (weakest >= 45) return 'tangguh'
  return 'duka'
}

export const safeFamilyCount = (family: FamilyState) =>
  Object.values(family).filter((v) => v === 'aman').length

export const onTimeDecisions = (log: readonly CrisisLogEntry[]) =>
  log.filter((l) => !l.timedOut).length

/**
 * Crisis answers that were right, counting the ones preparation unlocked. Derived
 * from the log so the end screen needs no extra state.
 */
export const correctDecisions = (
  log: readonly CrisisLogEntry[],
  correctIndexes: readonly number[],
) => log.filter((l, i) => l.unlocked || l.optionIndex === correctIndexes[i]).length
