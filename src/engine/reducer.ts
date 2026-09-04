import { PHASE1_SPOTS } from '@/data/phase1-siaga'
import { PHASE2_CARDS } from '@/data/phase2-darurat'
import { PHASE3_SPOTS } from '@/data/phase3-pemulihan'
import { INITIAL_FAMILY, type FamilyState, type MapSpot } from '@/data/types'

import type { GameAction } from './actions'
import { decisionMs, type GameConfig } from './config'
import { buildCrisisRecap, buildMapRecap } from './recap'
import { clampSafety, crisisTimeBonus, mapFinishBonus } from './scoring'
import { createInitialState, type GameState, type PhaseNumber, type ScreenId } from './state'

/** Phases 1 and 3 use different spot lists but identical rules. */
export const spotsForScreen = (screen: ScreenId): readonly MapSpot[] =>
  screen === 'p3' ? PHASE3_SPOTS : PHASE1_SPOTS

/** Everyone still safe becomes anxious when the run ends badly. */
const worryEveryone = (family: FamilyState): FamilyState =>
  Object.fromEntries(
    Object.entries(family).map(([id, status]) => [id, status === 'aman' ? 'cemas' : status]),
  ) as FamilyState

const enterGameOver = (state: GameState, cause: string, fromPhase: PhaseNumber): GameState => ({
  ...state,
  screen: 'over',
  feedback: null,
  openSpotId: null,
  overCause: cause,
  overFromPhase: fromPhase,
  family: worryEveryone(state.family),
  pendingGameOver: null,
})

/** Shared by an explicit pick and by the countdown expiring. */
const applyCrisisChoice = (state: GameState, optionIndex: number, timedOut: boolean): GameState => {
  const card = PHASE2_CARDS[state.cardIndex]
  const option = card?.options[optionIndex]
  if (!card || !option) return state

  const safety = clampSafety(state.safety + option.safetyDelta)
  const prefix = timedOut ? 'Kamu terlalu lama ragu — keadaan memutuskan untukmu. ' : ''

  return {
    ...state,
    safety,
    family: { ...state.family, ...option.family },
    timeBonusSeconds: state.timeBonusSeconds + (timedOut ? 0 : state.timeLeftMs / 1000),
    crisisLog: [...state.crisisLog, { optionIndex, timedOut }],
    feedback: {
      text: prefix + option.feedback,
      delta: option.safetyDelta,
      fatal: safety <= 0,
      cause: 'Saat “' + card.title + '”, kamu memilih: ' + option.text,
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
        return { ...state, openSpotId: action.spotId }

      case 'CLOSE_SPOT':
        return { ...state, openSpotId: null }

      case 'CHOOSE_MAP_OPTION': {
        const spot = spotsForScreen(state.screen).find((s) => s.id === state.openSpotId)
        const option = spot?.options[action.optionIndex]
        if (!spot || !option) return state

        const safety = clampSafety(state.safety + (option.safetyDelta ?? 0))
        const phase: PhaseNumber = state.screen === 'p3' ? 3 : 1

        return {
          ...state,
          hoursLeft: Math.max(0, state.hoursLeft - option.hourCost),
          preparedness: state.preparedness + option.prepPoints,
          safety,
          mapChoices: { ...state.mapChoices, [spot.id]: action.optionIndex },
          openSpotId: null,
          family: { ...state.family, ...option.family },
          // Deferred rather than immediate: the player watches the consequence land
          // on the map before the edition goes to press.
          pendingGameOver:
            safety <= 0
              ? { cause: 'Di “' + spot.name + '”, kamu memilih: ' + option.text, fromPhase: phase }
              : null,
        }
      }

      case 'COMMIT_GAME_OVER': {
        const pending = state.pendingGameOver
        if (!pending) return state
        return enterGameOver(state, pending.cause, pending.fromPhase)
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
          timePoints: state.timePoints + mapFinishBonus(state.hoursLeft, phase),
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
            timeLeftMs: decisionMs(config),
            feedback: null,
            crisisLog: [],
            timeBonusSeconds: 0,
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
        if (state.screen !== 'p2' || state.feedback) return state
        const remaining = state.timeLeftMs - action.deltaMs
        if (remaining > 0) return { ...state, timeLeftMs: remaining }

        const card = PHASE2_CARDS[state.cardIndex]
        if (!card) return state
        return applyCrisisChoice(state, card.timeoutOptionIndex, true)
      }

      case 'CHOOSE_CRISIS_OPTION':
        return applyCrisisChoice(state, action.optionIndex, action.timedOut)

      case 'NEXT_CARD': {
        const feedback = state.feedback
        if (feedback?.fatal) return enterGameOver(state, feedback.cause, 2)

        const next = state.cardIndex + 1
        if (next >= PHASE2_CARDS.length) {
          return {
            ...state,
            screen: 'recap2',
            recapLines: buildCrisisRecap(PHASE2_CARDS, state.crisisLog),
            recapIndex: 0,
            timePoints:
              state.timePoints +
              crisisTimeBonus(state.timeBonusSeconds, PHASE2_CARDS.length, config),
          }
        }
        return {
          ...state,
          cardIndex: next,
          timeLeftMs: decisionMs(config),
          feedback: null,
          // The hillside comes down on card 7 and stays down.
          landslideFallen: state.landslideFallen || next === 6,
        }
      }

      case 'RETRY_PHASE': {
        const phase = state.overFromPhase
        const common = {
          safety: 50,
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
            timeLeftMs: decisionMs(config),
            feedback: null,
            crisisLog: [],
            timeBonusSeconds: 0,
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
