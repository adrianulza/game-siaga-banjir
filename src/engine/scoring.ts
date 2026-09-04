import type { FamilyState } from '@/data/types'

import type { GameConfig } from './config'
import type { CrisisLogEntry, GameState } from './state'

export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

/** Safety is always held to 0..100. */
export const clampSafety = (v: number) => clamp(v, 0, 100)

/** The three tracked numbers sum to the final score. */
export const totalScore = (s: Pick<GameState, 'safety' | 'preparedness' | 'timePoints'>) =>
  s.safety + s.preparedness + s.timePoints

/** Best achievable total, used to grade the ending. */
export const MAX_SCORE = 260

export type EndingTier = 'pahlawan' | 'tangguh' | 'duka'

export const endingTier = (total: number): EndingTier => {
  const pct = total / MAX_SCORE
  if (pct >= 0.7) return 'pahlawan'
  if (pct >= 0.45) return 'tangguh'
  return 'duka'
}

/** Leftover hours convert to time points: 3 per hour in phase 1, 2 in phase 3. */
export const mapFinishBonus = (hoursLeft: number, phase: 1 | 3) =>
  phase === 1 ? hoursLeft * 3 : hoursLeft * 2

/**
 * Phase-2 speed bonus: the share of the total available thinking time left unused,
 * scaled to 40 points.
 */
export const crisisTimeBonus = (timeBonusSeconds: number, cardCount: number, config: GameConfig) =>
  Math.round((timeBonusSeconds / (config.decisionSeconds * cardCount)) * 40)

export const safeFamilyCount = (family: FamilyState) =>
  Object.values(family).filter((v) => v === 'aman').length

export const onTimeDecisions = (log: readonly CrisisLogEntry[]) =>
  log.filter((l) => !l.timedOut).length
