import { describe, expect, it } from 'vitest'

import { PHASE1_SPOTS } from '@/data/phase1-siaga'
import { PHASE2_CARDS } from '@/data/phase2-darurat'
import { PHASE3_SPOTS } from '@/data/phase3-pemulihan'
import { ceilingsFor } from '@/engine/ceilings'
import { DEFAULT_CONFIG } from '@/engine/config'
import { createReducer, optionsOnCard } from '@/engine/reducer'
import { competencyBars, endingTier } from '@/engine/scoring'
import { createInitialState, type GameState } from '@/engine/state'

const config = DEFAULT_CONFIG
const reduce = createReducer(config)
const run = (s: GameState, ...as: Parameters<typeof reduce>[1][]) => as.reduce(reduce, s)

const playMap = (s: GameState, spots: typeof PHASE1_SPOTS, pick: (id: string) => number) => {
  for (const spot of spots) {
    const i = pick(spot.id)
    const cost = spot.options[i]!.hourCost
    if (cost > s.hoursLeft) continue
    s = run(
      s,
      { type: 'OPEN_SPOT', spotId: spot.id },
      { type: 'CHOOSE_MAP_OPTION', optionIndex: i },
    )
  }
  return run(s, { type: 'FINISH_MAP' })
}

const advanceRecap = (s: GameState) => {
  while (s.screen.startsWith('recap')) s = run(s, { type: 'RECAP_NEXT' })
  return s
}

/** Play phase 2, always taking the best option available (unlocked if offered). */
const playCrisisWell = (s: GameState) => {
  for (let i = 0; i < PHASE2_CARDS.length; i++) {
    const card = PHASE2_CARDS[i]!
    const best = optionsOnCard(card, s.prepTags).length - 1
    const pick = best >= card.options.length ? best : card.correctOptionIndex
    s = run(
      s,
      { type: 'CHOOSE_CRISIS_OPTION', optionIndex: pick, timedOut: false },
      { type: 'NEXT_CARD' },
    )
  }
  return s
}

const barsOf = (s: GameState) => competencyBars(s.competency, ceilingsFor(config).ceilings)

describe('whole runs', () => {
  it('the old rush exploit no longer reaches the top ending', () => {
    // Skip every map action, then play the crisis flawlessly. Under the old rules
    // this scored 185/260 and graded Pahlawan.
    let s = run(createInitialState(config), { type: 'START' })
    s = advanceRecap(playMap(s, PHASE1_SPOTS, () => 2))
    s = advanceRecap(playCrisisWell(s))
    s = advanceRecap(playMap(s, PHASE3_SPOTS, () => 2))

    expect(s.screen).toBe('end')
    expect(s.hoursLeft).toBe(config.prepHours) // every hour banked, worth nothing
    expect(endingTier(barsOf(s))).toBe('duka')
  })

  it('a thorough run reaches Pahlawan', () => {
    let s = run(createInitialState(config), { type: 'START' })
    s = advanceRecap(playMap(s, PHASE1_SPOTS, () => 0))
    s = advanceRecap(playCrisisWell(s))
    s = advanceRecap(playMap(s, PHASE3_SPOTS, () => 0))

    expect(endingTier(barsOf(s))).toBe('pahlawan')
  })

  it('preparation measurably changes how phase 2 goes', () => {
    const prepared = advanceRecap(
      playMap(run(createInitialState(config), { type: 'START' }), PHASE1_SPOTS, () => 0),
    )
    const unprepared = advanceRecap(
      playMap(run(createInitialState(config), { type: 'START' }), PHASE1_SPOTS, () => 2),
    )

    const a = playCrisisWell(prepared)
    const b = playCrisisWell(unprepared)

    expect(prepared.prepTags.length).toBeGreaterThan(3)
    expect(unprepared.prepTags).toEqual([])
    // Same flawless play, better outcome, purely because of phase 1.
    expect(a.competency.rentan).toBeGreaterThan(b.competency.rentan)
  })
})
