import { beforeEach, describe, expect, it } from 'vitest'

import { PHASE1_SPOTS } from '@/data/phase1-siaga'
import { PHASE2_CARDS } from '@/data/phase2-darurat'
import { PHASE3_SPOTS } from '@/data/phase3-pemulihan'
import type { GameAction } from '@/engine/actions'
import { NO_COMPETENCY } from '@/data/types'
import { DEFAULT_CONFIG, decisionMs, mapDecisionMs } from '@/engine/config'
import { cardDecisionMs, createReducer, optionsOnCard, spotsForScreen } from '@/engine/reducer'
import {
  addAward,
  clampSafety,
  competencyBars,
  correctDecisions,
  endingTier,
  onTimeDecisions,
  safeFamilyCount,
  weakestCompetency,
} from '@/engine/scoring'
import { createInitialState, MAX_STRIKES, type GameState } from '@/engine/state'

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
    expect(initial.competency).toEqual(NO_COMPETENCY)
    expect(initial.prepTags).toEqual([])
    expect(initial.strikes).toBe(0)
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
    expect(played.competency.logistik).toBeGreaterThan(0)

    const s = run(played, { type: 'RESTART' })
    expect(s.screen).toBe('intro')
    expect(s.competency).toEqual(NO_COMPETENCY)
    expect(s.prepTags).toEqual([])
    expect(s.mapChoices).toEqual({})
  })
})

describe('map phase choices', () => {
  const openPhase1 = () => run(initial, { type: 'START' })

  it('spends hours, earns competency, and records the choice', () => {
    const spot = PHASE1_SPOTS.find((s) => s.id === 'dapur')!
    const option = spot.options[0]!

    const s = run(
      openPhase1(),
      { type: 'OPEN_SPOT', spotId: 'dapur' },
      { type: 'CHOOSE_MAP_OPTION', optionIndex: 0 },
    )

    expect(s.hoursLeft).toBe(config.prepHours - option.hourCost)
    expect(s.competency).toEqual(addAward(NO_COMPETENCY, option.award))
    expect(s.mapChoices).toEqual({ dapur: 0 })
    expect(s.openSpotId).toBeNull()
  })

  it('banks the prep tag the best option leaves behind, and only that option', () => {
    const best = run(
      openPhase1(),
      { type: 'OPEN_SPOT', spotId: 'dapur' },
      { type: 'CHOOSE_MAP_OPTION', optionIndex: 0 },
    )
    expect(best.prepTags).toEqual(['tas-siaga'])

    const halfMeasure = run(
      openPhase1(),
      { type: 'OPEN_SPOT', spotId: 'dapur' },
      { type: 'CHOOSE_MAP_OPTION', optionIndex: 1 },
    )
    expect(halfMeasure.prepTags).toEqual([])
  })

  it('starts the 30 second spot clock when a spot opens', () => {
    const s = run(openPhase1(), { type: 'OPEN_SPOT', spotId: 'dapur' })
    expect(s.timeLeftMs).toBe(mapDecisionMs(config))
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
      reason: 'safety',
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

  it('gives leftover hours no score of their own — rushing the map buys nothing', () => {
    const rushed = run({ ...initial, screen: 'p1', hoursLeft: 10 }, { type: 'FINISH_MAP' })
    expect(rushed.competency).toEqual(NO_COMPETENCY)

    const p3 = run({ ...initial, screen: 'p3', hoursLeft: 4 }, { type: 'FINISH_MAP' })
    expect(p3.screen).toBe('recap3')
    expect(p3.competency).toEqual(NO_COMPETENCY)
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

  it('pays a correct answer in competency, not in saved seconds', () => {
    const card = PHASE2_CARDS[0]!
    const quick = run(inPhase2({ timeLeftMs: 19000 }), {
      type: 'CHOOSE_CRISIS_OPTION',
      optionIndex: 0,
      timedOut: false,
    })
    const slow = run(inPhase2({ timeLeftMs: 500 }), {
      type: 'CHOOSE_CRISIS_OPTION',
      optionIndex: 0,
      timedOut: false,
    })
    expect(quick.competency).toEqual(addAward(NO_COMPETENCY, card.options[0]!.award))
    expect(slow.competency).toEqual(quick.competency)
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
      feedback: { text: 'x', delta: 0, fatal: false, fatalReason: 'safety', cause: 'x' },
    })
    expect(run(paused, { type: 'TICK', deltaMs: 100 })).toEqual(paused)
  })

  it('does nothing on a map screen with no spot open', () => {
    const elsewhere = { ...initial, screen: 'p1' as const }
    expect(run(elsewhere, { type: 'TICK', deltaMs: 100 })).toEqual(elsewhere)
  })

  it('expiring picks the card timeout option and marks it timed out', () => {
    const card = PHASE2_CARDS[0]!
    const s = run(inPhase2({ timeLeftMs: 100 }), { type: 'TICK', deltaMs: 100 })
    expect(s.crisisLog).toEqual([{ optionIndex: card.timeoutOptionIndex, timedOut: true }])
  })

  it('drains the spot clock while a map spot is open', () => {
    const open = run(initial, { type: 'START' }, { type: 'OPEN_SPOT', spotId: 'dapur' })
    const s = run(open, { type: 'TICK', deltaMs: 100 })
    expect(s.timeLeftMs).toBe(mapDecisionMs(config) - 100)
  })

  it('a spot clock running out just closes the dialog — no hours, no points, no strike', () => {
    const open = run(initial, { type: 'START' }, { type: 'OPEN_SPOT', spotId: 'dapur' })
    const s = run({ ...open, timeLeftMs: 100 }, { type: 'TICK', deltaMs: 100 })

    expect(s.openSpotId).toBeNull()
    expect(s.hoursLeft).toBe(config.prepHours)
    expect(s.competency).toEqual(NO_COMPETENCY)
    expect(s.strikes).toBe(0)
    // Nothing was decided, so the spot is still there to come back to.
    expect(s.mapChoices).toEqual({})
  })
})

describe('card progression', () => {
  const answered = (cardIndex: number): GameState => ({
    ...initial,
    screen: 'p2',
    cardIndex,
    feedback: { text: 'x', delta: 1, fatal: false, fatalReason: 'safety', cause: 'x' },
  })

  it('moves to the next card and resets the clock', () => {
    const s = run(answered(0), { type: 'NEXT_CARD' })
    expect(s.cardIndex).toBe(1)
    expect(s.timeLeftMs).toBe(decisionMs(config))
    expect(s.feedback).toBeNull()
  })

  it('gives the next card the seconds the run had prepared for', () => {
    const prepared = run({ ...answered(0), prepTags: ['rumah-aman'] }, { type: 'NEXT_CARD' })
    // Card 2 pays 5 extra seconds to a player who secured the house.
    expect(prepared.timeLeftMs).toBe(decisionMs(config) + 5000)
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
    const s = run({ ...dead(2), strikes: 2 }, { type: 'RETRY_PHASE' })
    expect(s.screen).toBe('p2')
    expect(s.cardIndex).toBe(0)
    expect(s.timeLeftMs).toBe(decisionMs(config))
    expect(s.crisisLog).toEqual([])
    expect(s.strikes).toBe(0)
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

  it('adds awards without touching the competencies an option does not teach', () => {
    const s = addAward({ informasi: 5, logistik: 0, rentan: 0, mitigasi: 0 }, { informasi: 3 })
    expect(s).toEqual({ informasi: 8, logistik: 0, rentan: 0, mitigasi: 0 })
    expect(addAward(s, undefined)).toBe(s)
  })

  it('normalises raw points against each competency own ceiling', () => {
    const bars = competencyBars(
      { informasi: 40, logistik: 27, rentan: 0, mitigasi: 82 },
      { informasi: 80, logistik: 54, rentan: 93, mitigasi: 82 },
    )
    expect(bars).toEqual({ informasi: 50, logistik: 50, rentan: 0, mitigasi: 100 })
  })

  it('never lets a bar exceed 100, even if content out-runs the ceiling', () => {
    const bars = competencyBars(
      { informasi: 200, logistik: 0, rentan: 0, mitigasi: 0 },
      { informasi: 80, logistik: 54, rentan: 93, mitigasi: 82 },
    )
    expect(bars.informasi).toBe(100)
  })

  it('grades on the weakest bar, so one abandoned skill cannot be averaged away', () => {
    const strongExceptOne = { informasi: 100, logistik: 100, rentan: 20, mitigasi: 100 }
    expect(weakestCompetency(strongExceptOne)).toBe('rentan')
    expect(endingTier(strongExceptOne)).toBe('duka')

    expect(endingTier({ informasi: 70, logistik: 70, rentan: 70, mitigasi: 70 })).toBe('pahlawan')
    expect(endingTier({ informasi: 70, logistik: 70, rentan: 69, mitigasi: 70 })).toBe('tangguh')
    expect(endingTier({ informasi: 45, logistik: 99, rentan: 99, mitigasi: 99 })).toBe('tangguh')
    expect(endingTier({ informasi: 44, logistik: 99, rentan: 99, mitigasi: 99 })).toBe('duka')
  })

  it('counts a prepared answer as a correct one', () => {
    const correctIndexes = PHASE2_CARDS.map((c) => c.correctOptionIndex)
    expect(
      correctDecisions(
        [
          { optionIndex: 0, timedOut: false },
          { optionIndex: 2, timedOut: false },
          { optionIndex: 3, timedOut: false, unlocked: true },
        ],
        correctIndexes,
      ),
    ).toBe(2)
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

describe('preparation paying off in phase 2', () => {
  const inPhase2 = (over = {}) => ({
    ...initial,
    screen: 'p2' as const,
    timeLeftMs: decisionMs(config),
    ...over,
  })

  it('hides the unlocked option from a run that did not prepare', () => {
    const card = PHASE2_CARDS[2]!
    expect(optionsOnCard(card, [])).toHaveLength(3)
    expect(optionsOnCard(card, ['rencana-rentan'])).toHaveLength(4)
  })

  it('lets the prepared player take the fourth option, and counts it as correct', () => {
    const card = PHASE2_CARDS[2]!
    const unlocked = optionsOnCard(card, ['rencana-rentan'])[3]!

    const s = run(inPhase2({ cardIndex: 2, prepTags: ['rencana-rentan'] }), {
      type: 'CHOOSE_CRISIS_OPTION',
      optionIndex: 3,
      timedOut: false,
    })

    expect(s.strikes).toBe(0)
    expect(s.safety).toBe(50 + unlocked.safetyDelta)
    expect(s.competency).toEqual(addAward(NO_COMPETENCY, unlocked.award))
    expect(s.crisisLog).toEqual([{ optionIndex: 3, timedOut: false, unlocked: true }])
  })

  it('softens a wrong answer for a prepared player, but still strikes them', () => {
    const card = PHASE2_CARDS[1]!
    const raw = card.options[1]!.safetyDelta

    const unprepared = run(inPhase2({ cardIndex: 1 }), {
      type: 'CHOOSE_CRISIS_OPTION',
      optionIndex: 1,
      timedOut: false,
    })
    const shielded = run(inPhase2({ cardIndex: 1, prepTags: ['tas-siaga'] }), {
      type: 'CHOOSE_CRISIS_OPTION',
      optionIndex: 1,
      timedOut: false,
    })

    expect(unprepared.safety).toBe(50 + raw)
    expect(shielded.safety).toBe(50 + Math.round(raw * 0.5))
    expect(shielded.safety).toBeGreaterThan(unprepared.safety)
    // Softened is not forgiven.
    expect(shielded.strikes).toBe(1)
  })

  it('adds the prep seconds to the clock a card is worth', () => {
    expect(cardDecisionMs(PHASE2_CARDS[0], [], config)).toBe(decisionMs(config))
    expect(cardDecisionMs(PHASE2_CARDS[0], ['info-resmi'], config)).toBe(decisionMs(config) + 5000)
  })
})

describe('three strikes', () => {
  const inPhase2 = (over = {}) => ({
    ...initial,
    screen: 'p2' as const,
    timeLeftMs: decisionMs(config),
    ...over,
  })

  const wrongAnswer = (state: GameState) =>
    run(state, { type: 'CHOOSE_CRISIS_OPTION', optionIndex: 1, timedOut: false })

  it('leaves the count alone when the answer is right', () => {
    const s = run(inPhase2(), { type: 'CHOOSE_CRISIS_OPTION', optionIndex: 0, timedOut: false })
    expect(s.strikes).toBe(0)
  })

  it('counts every option that is not the right one', () => {
    const b = run(inPhase2(), { type: 'CHOOSE_CRISIS_OPTION', optionIndex: 1, timedOut: false })
    const c = run(inPhase2(), { type: 'CHOOSE_CRISIS_OPTION', optionIndex: 2, timedOut: false })
    expect(b.strikes).toBe(1)
    expect(c.strikes).toBe(1)
  })

  it('counts a timeout, since the clock never picks the right answer', () => {
    const s = run(inPhase2({ timeLeftMs: 100 }), { type: 'TICK', deltaMs: 100 })
    expect(s.strikes).toBe(1)
  })

  it('ends the run on the third one, with safety to spare', () => {
    let s = wrongAnswer(inPhase2({ safety: 100 }))
    expect(s.feedback?.fatal).toBe(false)

    s = wrongAnswer({ ...s, cardIndex: 1, feedback: null })
    expect(s.strikes).toBe(2)
    expect(s.feedback?.fatal).toBe(false)

    s = wrongAnswer({ ...s, cardIndex: 2, feedback: null })
    expect(s.strikes).toBe(MAX_STRIKES)
    expect(s.feedback?.fatal).toBe(true)
    expect(s.feedback?.fatalReason).toBe('strikes')
    expect(s.safety).toBeGreaterThan(0)

    const over = run(s, { type: 'NEXT_CARD' })
    expect(over.screen).toBe('over')
    expect(over.overReason).toBe('strikes')
    expect(over.overFromPhase).toBe(2)
  })

  it('blames safety, not strikes, when the meter empties first', () => {
    const s = run(inPhase2({ safety: 5 }), {
      type: 'CHOOSE_CRISIS_OPTION',
      optionIndex: 2,
      timedOut: false,
    })
    expect(s.feedback?.fatal).toBe(true)
    expect(s.feedback?.fatalReason).toBe('safety')
    expect(run(s, { type: 'NEXT_CARD' }).overReason).toBe('safety')
  })
})

describe('spot lookup', () => {
  it('serves phase 3 spots on the p3 screen and phase 1 spots elsewhere', () => {
    expect(spotsForScreen('p3')).toBe(PHASE3_SPOTS)
    expect(spotsForScreen('p1')).toBe(PHASE1_SPOTS)
    expect(spotsForScreen('intro')).toBe(PHASE1_SPOTS)
  })
})
