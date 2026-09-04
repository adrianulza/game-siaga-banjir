import { describe, expect, it } from 'vitest'

import { PHASE1_SPOTS } from '@/data/phase1-siaga'
import { PHASE2_CARDS } from '@/data/phase2-darurat'
import { PHASE3_SPOTS } from '@/data/phase3-pemulihan'
import { COMPETENCY_IDS, PREP_TAG_IDS, type MapSpot } from '@/data/types'
import { ceilingsFor } from '@/engine/ceilings'
import { DEFAULT_CONFIG } from '@/engine/config'

const config = DEFAULT_CONFIG

/** Cheapest hours to take every spot's best option. */
const bestHours = (spots: readonly MapSpot[]) =>
  spots.reduce((n, s) => n + (s.options[0]?.hourCost ?? 0), 0)

describe('competency ceilings', () => {
  const { ceilings, allFourImpossible, bestWeakestBar } = ceilingsFor(config)

  it('matches the figures the awards were calibrated against', () => {
    // If this fails, the content changed: re-read the numbers before adjusting them,
    // because they set every player's grade.
    expect(ceilings).toEqual({ informasi: 80, logistik: 54, rentan: 93, mitigasi: 82 })
  })

  it('leaves every competency reachable', () => {
    for (const id of COMPETENCY_IDS) expect(ceilings[id]).toBeGreaterThan(0)
  })

  it('cannot be maxed on all four at once — that is the trade-off', () => {
    expect(allFourImpossible).toBe(true)
    expect(bestWeakestBar).toBe(85)
  })

  it('makes phase 1 the phase that forces a choice', () => {
    // All six best options cost more than the budget, so a run holds at most five
    // prep tags and must decide which preparation to skip.
    expect(bestHours(PHASE1_SPOTS)).toBeGreaterThan(config.prepHours)
  })

  it('keeps phase 3 affordable, so recovery is not a second scarcity puzzle', () => {
    // If a future edit raises a phase-3 hour cost past the budget, the ceilings move
    // and the grade curve shifts with them. Fail loudly instead.
    expect(bestHours(PHASE3_SPOTS)).toBeLessThanOrEqual(config.prepHours)
  })

  it('is memoised per hour budget', () => {
    expect(ceilingsFor(config)).toBe(ceilingsFor({ ...config, dramatic: false }))
  })
})

describe('scoring content', () => {
  it('gives every prep tag both a source in phase 1 and a use in phase 2', () => {
    const granted = new Set(
      PHASE1_SPOTS.flatMap((s) => s.options.flatMap((o) => o.grantsTags ?? [])),
    )
    const used = new Set([
      ...PHASE2_CARDS.flatMap((c) => (c.lockedOptions ?? []).map((o) => o.requiresTag)),
      ...PHASE2_CARDS.flatMap((c) => (c.shields ?? []).map((x) => x.requiresTag)),
      ...PHASE2_CARDS.flatMap((c) => (c.extraSeconds ?? []).map((x) => x.requiresTag)),
    ])

    for (const tag of PREP_TAG_IDS) {
      expect(granted.has(tag), `${tag} is never earned`).toBe(true)
      expect(used.has(tag), `${tag} never pays off`).toBe(true)
    }
  })

  it('only ever awards competency for a phase-1 spot best option tag', () => {
    for (const spot of PHASE1_SPOTS) {
      for (const [i, option] of spot.options.entries()) {
        if (i > 0) expect(option.grantsTags, `${spot.id} option ${i}`).toBeUndefined()
      }
    }
  })

  it('never awards negative competency — strikes and safety do the punishing', () => {
    const everyAward = [
      ...[...PHASE1_SPOTS, ...PHASE3_SPOTS].flatMap((s) => s.options),
      ...PHASE2_CARDS.flatMap((c) => [...c.options, ...(c.lockedOptions ?? [])]),
    ].flatMap((o) => Object.values(o.award ?? {}))

    expect(everyAward.length).toBeGreaterThan(0)
    for (const value of everyAward) expect(value).toBeGreaterThan(0)
  })

  it('makes the unlocked option worth more than the answer it replaces', () => {
    for (const card of PHASE2_CARDS) {
      const correct = card.options[card.correctOptionIndex]!
      for (const locked of card.lockedOptions ?? []) {
        expect(locked.safetyDelta, card.title).toBeGreaterThanOrEqual(correct.safetyDelta)
      }
    }
  })

  it('only shields options that are actually wrong', () => {
    for (const card of PHASE2_CARDS) {
      for (const shield of card.shields ?? []) {
        expect(shield.optionIndex, card.title).not.toBe(card.correctOptionIndex)
        expect(card.options[shield.optionIndex]!.safetyDelta).toBeLessThan(0)
        expect(shield.multiplier).toBeGreaterThan(0)
        expect(shield.multiplier).toBeLessThan(1)
      }
    }
  })
})
