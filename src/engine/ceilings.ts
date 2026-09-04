import { PHASE1_SPOTS } from '@/data/phase1-siaga'
import { PHASE2_CARDS } from '@/data/phase2-darurat'
import { PHASE3_SPOTS } from '@/data/phase3-pemulihan'
import {
  COMPETENCY_IDS,
  NO_COMPETENCY,
  type CompetencyAward,
  type CompetencyScores,
  type MapSpot,
  type PrepTagId,
} from '@/data/types'

import type { GameConfig } from './config'
import { addAward } from './scoring'

/**
 * How many raw points of each competency a single run can actually reach.
 *
 * These are computed rather than written down, because writing them down is how a
 * scoring system rots: change one hour cost and the hand-kept constant is silently
 * wrong, which shifts every player's grade. The search is small enough to just run —
 * 3^6 option combinations per map phase, filtered by the hour budget.
 */
export interface Ceilings {
  ceilings: CompetencyScores
  /** True when no single run can max every bar — the trade-off the design wants. */
  allFourImpossible: boolean
  /** The highest weakest-bar any run can reach, as a percentage. */
  bestWeakestBar: number
}

interface Combo {
  scores: CompetencyScores
  tags: readonly PrepTagId[]
}

/** Every affordable way to play one map phase, with what it earns and leaves behind. */
const mapCombos = (spots: readonly MapSpot[], hourBudget: number): Combo[] => {
  const out: Combo[] = []
  const total = 3 ** spots.length

  for (let mask = 0; mask < total; mask++) {
    let hours = 0
    let scores = NO_COMPETENCY
    const tags: PrepTagId[] = []
    let affordable = true

    for (let i = 0, rest = mask; i < spots.length; i++, rest = Math.floor(rest / 3)) {
      const option = spots[i]?.options[rest % 3]
      if (!option) continue
      hours += option.hourCost
      if (hours > hourBudget) {
        affordable = false
        break
      }
      scores = addAward(scores, option.award)
      if (option.grantsTags) tags.push(...option.grantsTags)
    }

    if (affordable) out.push({ scores, tags })
  }
  return out
}

/** A flawless phase 2, taking every unlock the run's tags reveal. */
const crisisBest = (tags: readonly PrepTagId[]): CompetencyScores => {
  let scores = NO_COMPETENCY

  for (const card of PHASE2_CARDS) {
    const correct = card.options[card.correctOptionIndex]
    const unlocked = (card.lockedOptions ?? []).filter((o) => tags.includes(o.requiresTag))
    // An unlocked option is always the better answer, but take the best of whatever
    // is on offer in case a future edit changes that.
    const candidates = [...(correct ? [correct] : []), ...unlocked]
    const best = candidates.reduce<CompetencyAward | undefined>(
      (a, b) => (awardWeight(b.award) > awardWeight(a) ? b.award : a),
      undefined,
    )
    scores = addAward(scores, best)
  }
  return scores
}

const awardWeight = (award: CompetencyAward | undefined) =>
  award ? COMPETENCY_IDS.reduce((n, id) => n + (award[id] ?? 0), 0) : -1

const add = (a: CompetencyScores, b: CompetencyScores): CompetencyScores =>
  Object.fromEntries(COMPETENCY_IDS.map((id) => [id, a[id] + b[id]])) as CompetencyScores

const cache = new Map<number, Ceilings>()

/**
 * Memoised per hour budget — the only config knob the answer depends on.
 *
 * Note the self-reference: phase-2 unlocks depend on which phase-1 tags a run holds,
 * so the ceiling of a competency depends on how the hours were spent. The full cross
 * product is enumerated rather than approximated.
 */
export const ceilingsFor = (config: GameConfig): Ceilings => {
  const cached = cache.get(config.prepHours)
  if (cached) return cached

  const phase1 = mapCombos(PHASE1_SPOTS, config.prepHours)
  const phase3 = mapCombos(PHASE3_SPOTS, config.prepHours)

  const runs: CompetencyScores[] = []
  for (const a of phase1) {
    const withCrisis = add(a.scores, crisisBest(a.tags))
    for (const b of phase3) runs.push(add(withCrisis, b.scores))
  }

  const ceilings = Object.fromEntries(
    COMPETENCY_IDS.map((id) => [id, runs.reduce((max, r) => Math.max(max, r[id]), 0)]),
  ) as CompetencyScores

  let bestWeakestBar = 0
  for (const run of runs) {
    const weakest = Math.min(
      ...COMPETENCY_IDS.map((id) =>
        ceilings[id] > 0 ? Math.min(100, Math.round((100 * run[id]) / ceilings[id])) : 0,
      ),
    )
    if (weakest > bestWeakestBar) bestWeakestBar = weakest
  }

  const result: Ceilings = {
    ceilings,
    allFourImpossible: bestWeakestBar < 100,
    bestWeakestBar,
  }
  cache.set(config.prepHours, result)
  return result
}
