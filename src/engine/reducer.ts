import { PHASE1_SPOTS } from '@/data/phase1-siaga'
import { PHASE2_CARDS } from '@/data/phase2-darurat'
import { PHASE3_SPOTS } from '@/data/phase3-pemulihan'
import {
  INITIAL_FAMILY,
  type CrisisCard,
  type CrisisOption,
  type FamilyState,
  type MapSpot,
  type PrepTagId,
} from '@/data/types'

import type { GameAction } from './actions'
import { decisionMs, mapDecisionMs, type GameConfig } from './config'
import { buildCrisisRecap, buildMapRecap } from './recap'
import { addAward, clampSafety } from './scoring'
import {
  createInitialState,
  isMapScreen,
  MAX_STRIKES,
  type GameOverReason,
  type GameState,
  type PhaseNumber,
  type ScreenId,
} from './state'

/** Phases 1 and 3 use different spot lists but identical rules. */
export const spotsForScreen = (screen: ScreenId): readonly MapSpot[] =>
  screen === 'p3' ? PHASE3_SPOTS : PHASE1_SPOTS

/**
 * The options actually on the table: the three the card always offers, plus any a
 * prep tag has revealed. Locked options sit after the base three, so an index past
 * `options.length` identifies one.
 */
export const optionsOnCard = (
  card: CrisisCard,
  tags: readonly PrepTagId[],
): readonly CrisisOption[] => [
  ...card.options,
  ...(card.lockedOptions ?? []).filter((o) => tags.includes(o.requiresTag)),
]

/** Thinking time for a card, including any seconds the run's preparation bought. */
export const cardDecisionMs = (
  card: CrisisCard | undefined,
  tags: readonly PrepTagId[],
  config: GameConfig,
): number => {
  const bonus = (card?.extraSeconds ?? [])
    .filter((b) => tags.includes(b.requiresTag))
    .reduce((n, b) => n + b.seconds, 0)
  return decisionMs(config) + bonus * 1000
}

/**
 * Preparation softens a wrong answer, but never forgives it — the strike still
 * lands. Only negative deltas are shielded.
 */
const shieldedDelta = (card: CrisisCard, optionIndex: number, tags: readonly PrepTagId[]) => {
  const base = card.options[optionIndex]?.safetyDelta ?? 0
  if (base >= 0) return base
  const shield = (card.shields ?? []).find(
    (s) => s.optionIndex === optionIndex && tags.includes(s.requiresTag),
  )
  return shield ? Math.round(base * shield.multiplier) : base
}

/** Everyone still safe becomes anxious when the run ends badly. */
const worryEveryone = (family: FamilyState): FamilyState =>
  Object.fromEntries(
    Object.entries(family).map(([id, status]) => [id, status === 'aman' ? 'cemas' : status]),
  ) as FamilyState

const enterGameOver = (
  state: GameState,
  cause: string,
  fromPhase: PhaseNumber,
  reason: GameOverReason = 'safety',
): GameState => ({
  ...state,
  screen: 'over',
  feedback: null,
  openSpotId: null,
  overCause: cause,
  overFromPhase: fromPhase,
  overReason: reason,
  family: worryEveryone(state.family),
  pendingGameOver: null,
})

/** Shared by an explicit pick and by the countdown expiring. */
const applyCrisisChoice = (state: GameState, optionIndex: number, timedOut: boolean): GameState => {
  const card = PHASE2_CARDS[state.cardIndex]
  const available = card ? optionsOnCard(card, state.prepTags) : []
  const option = available[optionIndex]
  if (!card || !option) return state

  // An unlocked option sits past the base three; it is the payoff for having
  // prepared, so it answers the card correctly.
  const unlocked = optionIndex >= card.options.length
  const wrong = !unlocked && optionIndex !== card.correctOptionIndex
  const strikes = state.strikes + (wrong ? 1 : 0)

  const delta = unlocked ? option.safetyDelta : shieldedDelta(card, optionIndex, state.prepTags)
  const safety = clampSafety(state.safety + delta)
  const prefix = timedOut ? 'Kamu terlalu lama ragu — keadaan memutuskan untukmu. ' : ''
  const cause = 'Saat “' + card.title + '”, kamu memilih: ' + option.text

  return {
    ...state,
    safety,
    strikes,
    competency: addAward(state.competency, option.award),
    family: { ...state.family, ...option.family },
    crisisLog: [...state.crisisLog, { optionIndex, timedOut, ...(unlocked ? { unlocked } : {}) }],
    feedback: {
      text: prefix + option.feedback,
      delta,
      fatal: safety <= 0 || strikes >= MAX_STRIKES,
      fatalReason: safety <= 0 ? 'safety' : 'strikes',
      cause,
    },
  }
}

/**
 * The whole game as a pure function. No React, no DOM, no timers, no audio — the
 * effects those need are expressed as state the caller reacts to (pendingGameOver,
 * soundEpoch), which is what makes every rule here directly testable.
 */
export const createReducer =
  (config: GameConfig) =>
  (state: GameState, action: GameAction): GameState => {
    switch (action.type) {
      case 'START':
        return {
          ...createInitialState(config),
          screen: 'p1',
          soundEpoch: state.soundEpoch + 1,
        }

      case 'RESTART':
        return { ...createInitialState(config), soundEpoch: state.soundEpoch + 1 }

      case 'OPEN_SPOT':
        return { ...state, openSpotId: action.spotId, timeLeftMs: mapDecisionMs(config) }

      case 'CLOSE_SPOT':
        return { ...state, openSpotId: null }

      case 'CHOOSE_MAP_OPTION': {
        const spot = spotsForScreen(state.screen).find((s) => s.id === state.openSpotId)
        const option = spot?.options[action.optionIndex]
        if (!spot || !option) return state

        const newTags = (option.grantsTags ?? []).filter((t) => !state.prepTags.includes(t))

        return {
          ...state,
          hoursLeft: Math.max(0, state.hoursLeft - option.hourCost),
          competency: addAward(state.competency, option.award),
          prepTags: newTags.length ? [...state.prepTags, ...newTags] : state.prepTags,
          mapChoices: { ...state.mapChoices, [spot.id]: action.optionIndex },
          openSpotId: null,
          family: { ...state.family, ...option.family },
          // Phases 1 and 3 never touch safety — only phase 2 does.
          pendingGameOver: null,
        }
      }

      case 'COMMIT_GAME_OVER': {
        const pending = state.pendingGameOver
        if (!pending) return state
        return enterGameOver(state, pending.cause, pending.fromPhase, pending.reason)
      }

      case 'GAME_OVER':
        return enterGameOver(state, action.cause, action.fromPhase)

      case 'FINISH_MAP': {
        const phase = state.screen === 'p3' ? 3 : 1
        const lines = buildMapRecap(
          spotsForScreen(state.screen),
          state.mapChoices,
          state.hoursLeft,
          phase,
        )
        return {
          ...state,
          screen: phase === 1 ? 'recap1' : 'recap3',
          recapLines: lines,
          recapIndex: 0,
        }
      }

      case 'RECAP_NEXT': {
        if (state.recapIndex < state.recapLines.length - 1) {
          return { ...state, recapIndex: state.recapIndex + 1 }
        }
        if (state.screen === 'recap1') {
          return {
            ...state,
            screen: 'p2',
            cardIndex: 0,
            timeLeftMs: cardDecisionMs(PHASE2_CARDS[0], state.prepTags, config),
            feedback: null,
            crisisLog: [],
            strikes: 0,
          }
        }
        if (state.screen === 'recap2') {
          return {
            ...state,
            screen: 'p3',
            hoursLeft: config.prepHours,
            mapChoices: {},
            openSpotId: null,
            landslideFallen: false,
          }
        }
        return { ...state, screen: 'end' }
      }

      case 'TICK': {
        const onOpenSpot = isMapScreen(state.screen) && state.openSpotId !== null
        const onCrisisCard = state.screen === 'p2' && !state.feedback
        if (!onOpenSpot && !onCrisisCard) return state

        const remaining = state.timeLeftMs - action.deltaMs
        if (remaining > 0) return { ...state, timeLeftMs: remaining }

        // Dithering on the map costs nothing but the chance to decide now: the
        // dialog closes, no hours are spent, and the spot can be opened again.
        if (onOpenSpot) return { ...state, openSpotId: null }

        const card = PHASE2_CARDS[state.cardIndex]
        if (!card) return state
        return applyCrisisChoice(state, card.timeoutOptionIndex, true)
      }

      case 'CHOOSE_CRISIS_OPTION':
        return applyCrisisChoice(state, action.optionIndex, action.timedOut)

      case 'NEXT_CARD': {
        const feedback = state.feedback
        if (feedback?.fatal) return enterGameOver(state, feedback.cause, 2, feedback.fatalReason)

        const next = state.cardIndex + 1
        if (next >= PHASE2_CARDS.length) {
          return {
            ...state,
            screen: 'recap2',
            recapLines: buildCrisisRecap(PHASE2_CARDS, state.crisisLog),
            recapIndex: 0,
          }
        }
        return {
          ...state,
          cardIndex: next,
          timeLeftMs: cardDecisionMs(PHASE2_CARDS[next], state.prepTags, config),
          feedback: null,
          // The hillside comes down on card 7 and stays down.
          landslideFallen: state.landslideFallen || next === 6,
        }
      }

      case 'RETRY_PHASE': {
        const phase = state.overFromPhase
        const common = {
          safety: 100,
          strikes: 0,
          openSpotId: null,
          family: { ...INITIAL_FAMILY },
          pendingGameOver: null,
          // Force the sound director to re-fire: the screen may be unchanged.
          soundEpoch: state.soundEpoch + 1,
        }
        if (phase === 2) {
          return {
            ...state,
            ...common,
            screen: 'p2',
            cardIndex: 0,
            timeLeftMs: cardDecisionMs(PHASE2_CARDS[0], state.prepTags, config),
            feedback: null,
            crisisLog: [],
            landslideFallen: false,
          }
        }
        return {
          ...state,
          ...common,
          screen: phase === 3 ? 'p3' : 'p1',
          hoursLeft: config.prepHours,
          mapChoices: {},
          // Retrying phase 3 keeps the landslide that already came down in phase 2.
          landslideFallen: phase === 3,
        }
      }
    }
  }
