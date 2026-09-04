import { beforeEach, describe, expect, it } from 'vitest'

import { PHASE1_SPOTS } from '@/data/phase1-siaga'
import { PHASE2_CARDS } from '@/data/phase2-darurat'
import { PHASE3_SPOTS } from '@/data/phase3-pemulihan'
import type { GameAction } from '@/engine/actions'
import { DEFAULT_CONFIG, decisionMs } from '@/engine/config'
import { createReducer, spotsForScreen } from '@/engine/reducer'
import {
  clampSafety,
  crisisTimeBonus,
  endingTier,
  mapFinishBonus,
  onTimeDecisions,
  safeFamilyCount,
  totalScore,
} from '@/engine/scoring'
import { createInitialState, type GameState } from '@/engine/state'

const config = DEFAULT_CONFIG
const reduce = createReducer(config)

/** Apply a sequence of actions from a starting state. */
const run = (state: GameState, ...actions: GameAction[]) => actions.reduce(reduce, state)

let initial: GameState

beforeEach(() => {
  initial = createInitialState(config)
})

describe('initial state', () => {
  it('starts on the intro with a full hour budget and neutral safety', () => {
    expect(initial.screen).toBe('intro')
    expect(initial.hoursLeft).toBe(config.prepHours)
    expect(initial.safety).toBe(50)
    expect(initial.preparedness).toBe(0)
    expect(initial.timePoints).toBe(0)
    expect(initial.timeLeftMs).toBe(decisionMs(config))
    expect(Object.values(initial.family).every((s) => s === 'aman')).toBe(true)
  })
})

describe('START and RESTART', () => {
  it('START opens phase 1 with a fresh run', () => {
    const s = run(initial, { type: 'START' })
    expect(s.screen).toBe('p1')
    expect(s.hoursLeft).toBe(config.prepHours)
    expect(s.safety).toBe(50)
    expect(s.soundEpoch).toBeGreaterThan(initial.soundEpoch)
  })

  it('RESTART clears progress and returns to the intro', () => {
    const played = run(
      initial,
      { type: 'START' },
      { type: 'OPEN_SPOT', spotId: 'dapur' },
      {
        type: 'CHOOSE_MAP_OPTION',
        optionIndex: 0,
      },
    )
    expect(played.preparedness).toBeGreaterThan(0)

    const s = run(played, { type: 'RESTART' })
    expect(s.screen).toBe('intro')
    expect(s.preparedness).toBe(0)
    expect(s.mapChoices).toEqual({})
  })
})

describe('map phase choices', () => {
  const openPhase1 = () => run(initial, { type: 'START' })

  it('spends hours, earns preparedness, and records the choice', () => {
    const spot = PHASE1_SPOTS.find((s) => s.id === 'dapur')!
    const option = spot.options[0]!

    const s = run(
      openPhase1(),
      { type: 'OPEN_SPOT', spotId: 'dapur' },
      { type: 'CHOOSE_MAP_OPTION', optionIndex: 0 },
    )

    expect(s.hoursLeft).toBe(config.prepHours - option.hourCost)
    expect(s.preparedness).toBe(option.prepPoints)
    expect(s.mapChoices).toEqual({ dapur: 0 })
    expect(s.openSpotId).toBeNull()
  })

  it('never lets the hour budget go negative', () => {
    let s = { ...openPhase1(), hoursLeft: 1 }
    s = run(
      s,
      { type: 'OPEN_SPOT', spotId: 'dapur' },
      { type: 'CHOOSE_MAP_OPTION', optionIndex: 0 },
    )
    expect(s.hoursLeft).toBe(0)
  })

  it('applies family effects from the chosen option', () => {
    const s = run(
      { ...openPhase1(), screen: 'p3' },
      { type: 'OPEN_SPOT', spotId: 'darto' },
      { type: 'CHOOSE_MAP_OPTION', optionIndex: 0 },
    )
    expect(s.family.tetangga).toBe('aman')
  })

  it('ignores a choice when no spot is open', () => {
    const s = run(openPhase1(), { type: 'CHOOSE_MAP_OPTION', optionIndex: 0 })
    expect(s).toEqual(openPhase1())
  })

  it('defers game over when safety hits zero, quoting the exact cause', () => {
    const spot = PHASE1_SPOTS.find((s) => s.id === 'sungai')!
    const risky = spot.options[1]!
    expect(risky.safetyDelta).toBe(-5)

    const s = run(
      { ...openPhase1(), safety: 5 },
      { type: 'OPEN_SPOT', spotId: 'sungai' },
      { type: 'CHOOSE_MAP_OPTION', optionIndex: 1 },
    )

    expect(s.safety).toBe(0)
    expect(s.screen).toBe('p1') // not yet — the effect layer commits after 900ms
    expect(s.pendingGameOver).toEqual({
      cause: `Di “${spot.name}”, kamu memilih: ${risky.text}`,
      fromPhase: 1,
    })
  })

  it('COMMIT_GAME_OVER moves to the over screen and worries everyone still safe', () => {
    const pending = run(
      { ...run(initial, { type: 'START' }), safety: 5 },
      { type: 'OPEN_SPOT', spotId: 'sungai' },
      { type: 'CHOOSE_MAP_OPTION', optionIndex: 1 },
    )
    const withHurt: GameState = { ...pending, family: { ...pending.family, nenek: 'terluka' } }

    const s = run(withHurt, { type: 'COMMIT_GAME_OVER' })
    expect(s.screen).toBe('over')
    expect(s.overFromPhase).toBe(1)
    expect(s.family.ibu).toBe('cemas')
    // An existing injury is not overwritten by the blanket worry.
    expect(s.family.nenek).toBe('terluka')
    expect(s.pendingGameOver).toBeNull()
  })

  it('phase 3 attributes its game over to phase 3', () => {
    const s = run(
      { ...initial, screen: 'p3', safety: 5 },
      { type: 'OPEN_SPOT', spotId: 'air' },
      { type: 'CHOOSE_MAP_OPTION', optionIndex: 1 },
    )
    expect(s.pendingGameOver?.fromPhase).toBe(3)
  })
})

describe('map recap', () => {
  it('produces an opener, one line per spot, and a closer', () => {
    const s = run({ ...initial, screen: 'p1' }, { type: 'FINISH_MAP' })
    expect(s.screen).toBe('recap1')
    expect(s.recapLines).toHaveLength(PHASE1_SPOTS.length + 2)
    expect(s.recapIndex).toBe(0)
  })

  it('uses the regret line for spots that were never visited', () => {
    const s = run({ ...initial, screen: 'p1' }, { type: 'FINISH_MAP' })
    expect(s.recapLines[1]).toContain('Kita tidak sempat ke')
  })

  it('uses the chosen option feedback for visited spots', () => {
    const spot = PHASE1_SPOTS[0]!
    const s = run(
      { ...initial, screen: 'p1', mapChoices: { [spot.id]: 0 } },
      { type: 'FINISH_MAP' },
    )
    expect(s.recapLines[1]).toBe(spot.options[0]!.feedback)
  })

  it('converts leftover hours to time points at 3/hour in phase 1 and 2/hour in phase 3', () => {
    const p1 = run({ ...initial, screen: 'p1', hoursLeft: 4 }, { type: 'FINISH_MAP' })
    expect(p1.timePoints).toBe(12)

    const p3 = run({ ...initial, screen: 'p3', hoursLeft: 4 }, { type: 'FINISH_MAP' })
    expect(p3.screen).toBe('recap3')
    expect(p3.timePoints).toBe(8)
  })
})

describe('recap navigation', () => {
  it('advances line by line before leaving the screen', () => {
    const recap = run({ ...initial, screen: 'p1' }, { type: 'FINISH_MAP' })
    const s = run(recap, { type: 'RECAP_NEXT' })
    expect(s.screen).toBe('recap1')
    expect(s.recapIndex).toBe(1)
  })

  it('recap1 leads into phase 2 with a fresh clock', () => {
    const recap = run({ ...initial, screen: 'p1' }, { type: 'FINISH_MAP' })
    const s = run({ ...recap, recapIndex: recap.recapLines.length - 1 }, { type: 'RECAP_NEXT' })
    expect(s.screen).toBe('p2')
    expect(s.cardIndex).toBe(0)
    expect(s.timeLeftMs).toBe(decisionMs(config))
    expect(s.crisisLog).toEqual([])
  })

  it('recap2 leads into phase 3 with the hour budget restored', () => {
    const s = run(
      { ...initial, screen: 'recap2', recapLines: ['a'], recapIndex: 0, hoursLeft: 0 },
      { type: 'RECAP_NEXT' },
    )
    expect(s.screen).toBe('p3')
    expect(s.hoursLeft).toBe(config.prepHours)
    expect(s.mapChoices).toEqual({})
  })

  it('recap3 leads to the ending', () => {
    const s = run(
      { ...initial, screen: 'recap3', recapLines: ['a'], recapIndex: 0 },
      { type: 'RECAP_NEXT' },
    )
    expect(s.screen).toBe('end')
  })
})

describe('crisis phase', () => {
  const inPhase2 = (over: Partial<GameState> = {}): GameState => ({
    ...initial,
    screen: 'p2',
    cardIndex: 0,
    timeLeftMs: decisionMs(config),
    ...over,
  })

  it('a choice moves safety, logs the pick, and shows feedback', () => {
    const card = PHASE2_CARDS[0]!
    const option = card.options[0]!

    const s = run(inPhase2(), { type: 'CHOOSE_CRISIS_OPTION', optionIndex: 0, timedOut: false })
    expect(s.safety).toBe(clampSafety(50 + option.safetyDelta))
    expect(s.crisisLog).toEqual([{ optionIndex: 0, timedOut: false }])
    expect(s.feedback?.text).toBe(option.feedback)
    expect(s.feedback?.delta).toBe(option.safetyDelta)
    expect(s.feedback?.fatal).toBe(false)
    expect(s.feedback?.cause).toBe(`Saat “${card.title}”, kamu memilih: ${option.text}`)
  })

  it('banks unused seconds only when the player chose in time', () => {
    const decided = run(inPhase2({ timeLeftMs: 9000 }), {
      type: 'CHOOSE_CRISIS_OPTION',
      optionIndex: 0,
      timedOut: false,
    })
    expect(decided.timeBonusSeconds).toBe(9)

    const expired = run(inPhase2({ timeLeftMs: 9000 }), {
      type: 'CHOOSE_CRISIS_OPTION',
      optionIndex: 0,
      timedOut: true,
    })
    expect(expired.timeBonusSeconds).toBe(0)
  })

  it('prefixes the feedback when the clock decided', () => {
    const s = run(inPhase2(), { type: 'CHOOSE_CRISIS_OPTION', optionIndex: 0, timedOut: true })
    expect(s.feedback?.text.startsWith('Kamu terlalu lama ragu')).toBe(true)
  })

  it('marks the feedback fatal when safety is exhausted', () => {
    const s = run(inPhase2({ safety: 5 }), {
      type: 'CHOOSE_CRISIS_OPTION',
      optionIndex: 2,
      timedOut: false,
    })
    expect(s.safety).toBe(0)
    expect(s.feedback?.fatal).toBe(true)
  })

  it('a fatal card sends NEXT_CARD to the game over screen, blamed on phase 2', () => {
    const fatal = run(inPhase2({ safety: 5 }), {
      type: 'CHOOSE_CRISIS_OPTION',
      optionIndex: 2,
      timedOut: false,
    })
    const s = run(fatal, { type: 'NEXT_CARD' })
    expect(s.screen).toBe('over')
    expect(s.overFromPhase).toBe(2)
    expect(s.overCause).toBe(fatal.feedback!.cause)
  })
})

describe('countdown', () => {
  const inPhase2 = (over: Partial<GameState> = {}): GameState => ({
    ...initial,
    screen: 'p2',
    timeLeftMs: decisionMs(config),
    ...over,
  })

  it('drains the clock', () => {
    const s = run(inPhase2(), { type: 'TICK', deltaMs: 100 })
    expect(s.timeLeftMs).toBe(decisionMs(config) - 100)
  })

  it('does nothing while feedback is on screen', () => {
    const paused = inPhase2({
      feedback: { text: 'x', delta: 0, fatal: false, cause: 'x' },
    })
    expect(run(paused, { type: 'TICK', deltaMs: 100 })).toEqual(paused)
  })

  it('does nothing outside phase 2', () => {
    const elsewhere = { ...initial, screen: 'p1' as const }
    expect(run(elsewhere, { type: 'TICK', deltaMs: 100 })).toEqual(elsewhere)
  })

  it('expiring picks the card timeout option and marks it timed out', () => {
    const card = PHASE2_CARDS[0]!
    const s = run(inPhase2({ timeLeftMs: 100 }), { type: 'TICK', deltaMs: 100 })
    expect(s.crisisLog).toEqual([{ optionIndex: card.timeoutOptionIndex, timedOut: true }])
    expect(s.timeBonusSeconds).toBe(0)
  })
})

describe('card progression', () => {
  const answered = (cardIndex: number): GameState => ({
    ...initial,
    screen: 'p2',
    cardIndex,
    feedback: { text: 'x', delta: 1, fatal: false, cause: 'x' },
  })

  it('moves to the next card and resets the clock', () => {
    const s = run(answered(0), { type: 'NEXT_CARD' })
    expect(s.cardIndex).toBe(1)
    expect(s.timeLeftMs).toBe(decisionMs(config))
    expect(s.feedback).toBeNull()
  })

  it('drops the hillside on card index 6 and keeps it down', () => {
    const s = run(answered(5), { type: 'NEXT_CARD' })
    expect(s.cardIndex).toBe(6)
    expect(s.landslideFallen).toBe(true)

    const later = run({ ...s, feedback: answered(6).feedback }, { type: 'NEXT_CARD' })
    expect(later.landslideFallen).toBe(true)
  })

  it('the last card leads to the phase 2 recap', () => {
    const s = run(answered(PHASE2_CARDS.length - 1), { type: 'NEXT_CARD' })
    expect(s.screen).toBe('recap2')
    expect(s.recapIndex).toBe(0)
  })

  it('awards the full speed bonus for instant decisions and none for a full stall', () => {
    const perfect = run(
      {
        ...answered(PHASE2_CARDS.length - 1),
        timeBonusSeconds: config.decisionSeconds * PHASE2_CARDS.length,
      },
      { type: 'NEXT_CARD' },
    )
    expect(perfect.timePoints).toBe(40)

    const stalled = run(
      { ...answered(PHASE2_CARDS.length - 1), timeBonusSeconds: 0 },
      { type: 'NEXT_CARD' },
    )
    expect(stalled.timePoints).toBe(0)
  })
})

describe('retrying a phase', () => {
  const dead = (fromPhase: 1 | 2 | 3): GameState => ({
    ...initial,
    screen: 'over',
    overFromPhase: fromPhase,
    safety: 0,
    family: { ...initial.family, nenek: 'terluka' },
  })

  it('restores phase 1 from the top', () => {
    const s = run(dead(1), { type: 'RETRY_PHASE' })
    expect(s.screen).toBe('p1')
    expect(s.safety).toBe(50)
    expect(s.hoursLeft).toBe(config.prepHours)
    expect(s.mapChoices).toEqual({})
    expect(s.family.nenek).toBe('aman')
    expect(s.landslideFallen).toBe(false)
  })

  it('restores phase 2 with a fresh clock and re-arms the sound director', () => {
    const s = run(dead(2), { type: 'RETRY_PHASE' })
    expect(s.screen).toBe('p2')
    expect(s.cardIndex).toBe(0)
    expect(s.timeLeftMs).toBe(decisionMs(config))
    expect(s.crisisLog).toEqual([])
    // Without this the kentongan would not sound again on a phase-2 retry.
    expect(s.soundEpoch).toBeGreaterThan(dead(2).soundEpoch)
  })

  it('restores phase 3 with the landslide already fallen', () => {
    const s = run(dead(3), { type: 'RETRY_PHASE' })
    expect(s.screen).toBe('p3')
    expect(s.landslideFallen).toBe(true)
  })
})

describe('scoring helpers', () => {
  it('clamps safety to 0..100', () => {
    expect(clampSafety(-20)).toBe(0)
    expect(clampSafety(140)).toBe(100)
    expect(clampSafety(37)).toBe(37)
  })

  it('sums the three tracked numbers', () => {
    expect(totalScore({ safety: 50, preparedness: 80, timePoints: 30 })).toBe(160)
  })

  it('grades the ending at the 70% and 45% marks', () => {
    expect(endingTier(260)).toBe('pahlawan')
    expect(endingTier(182)).toBe('pahlawan') // exactly 70%
    expect(endingTier(181)).toBe('tangguh')
    expect(endingTier(117)).toBe('tangguh') // exactly 45%
    expect(endingTier(116)).toBe('duka')
    expect(endingTier(0)).toBe('duka')
  })

  it('converts leftover hours per phase', () => {
    expect(mapFinishBonus(5, 1)).toBe(15)
    expect(mapFinishBonus(5, 3)).toBe(10)
  })

  it('scales the crisis time bonus to 40 points', () => {
    expect(crisisTimeBonus(120, 8, config)).toBe(40)
    expect(crisisTimeBonus(60, 8, config)).toBe(20)
    expect(crisisTimeBonus(0, 8, config)).toBe(0)
  })

  it('counts safe family members and on-time decisions', () => {
    expect(safeFamilyCount(initial.family)).toBe(6)
    expect(safeFamilyCount({ ...initial.family, oyen: 'cemas' })).toBe(5)
    expect(
      onTimeDecisions([
        { optionIndex: 0, timedOut: false },
        { optionIndex: 1, timedOut: true },
      ]),
    ).toBe(1)
  })
})

describe('spot lookup', () => {
  it('serves phase 3 spots on the p3 screen and phase 1 spots elsewhere', () => {
    expect(spotsForScreen('p3')).toBe(PHASE3_SPOTS)
    expect(spotsForScreen('p1')).toBe(PHASE1_SPOTS)
    expect(spotsForScreen('intro')).toBe(PHASE1_SPOTS)
  })
})
