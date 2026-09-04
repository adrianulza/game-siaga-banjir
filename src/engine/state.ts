import { NO_COMPETENCY, type CompetencyScores, type PrepTagId } from '@/data/types'
import { INITIAL_FAMILY, type FamilyState } from '@/data/types'

import type { GameConfig } from './config'
import { decisionMs } from './config'

export type ScreenId =
  'intro' | 'p1' | 'recap1' | 'p2' | 'recap2' | 'p3' | 'recap3' | 'over' | 'end'

export type PhaseNumber = 1 | 2 | 3

/** Feedback shown after a phase-2 choice, before the next card. */
export interface CrisisFeedback {
  text: string
  delta: number
  /**
   * Safety hit zero or the third strike landed — "Lanjut" leads to the game-over
   * screen, not the next card.
   */
  fatal: boolean
  fatalReason: GameOverReason
  cause: string
}

export interface CrisisLogEntry {
  optionIndex: number
  timedOut: boolean
  /** An option index past the base three: the payoff for having prepared. */
  unlocked?: boolean
}

/** Why the run ended. The copy on the game-over screen differs for each. */
export type GameOverReason = 'safety' | 'strikes'

/** Three wrong crisis answers end the run. */
export const MAX_STRIKES = 3

/**
 * Everything the rules need to know. Deliberately excludes anything purely visual —
 * stage scale, score-pop animations, screen shake and mute all live in React, which
 * is what lets this whole module be tested in plain Node.
 */
export interface GameState {
  screen: ScreenId
  hoursLeft: number
  safety: number
  /** The score: raw points per competency, normalised to 0..100 only for display. */
  competency: CompetencyScores
  /** What phase 1 left the player holding; phase 2 reads it. */
  prepTags: readonly PrepTagId[]
  /** Wrong phase-2 answers so far. At MAX_STRIKES the run ends. */
  strikes: number
  /** spot id → index of the option chosen there. */
  mapChoices: Record<string, number>
  openSpotId: string | null
  cardIndex: number
  timeLeftMs: number
  feedback: CrisisFeedback | null
  crisisLog: CrisisLogEntry[]
  family: FamilyState
  recapLines: string[]
  recapIndex: number
  /** The hillside has come down; it stays down for the rest of the run. */
  landslideFallen: boolean
  overCause: string
  overFromPhase: PhaseNumber
  overReason: GameOverReason
  /**
   * Safety reached zero on a map screen. The original deferred the game-over screen
   * by 900ms so the player sees their choice land first; holding it here keeps the
   * reducer pure and leaves the delay to an effect.
   */
  pendingGameOver: { cause: string; fromPhase: PhaseNumber; reason: GameOverReason } | null
  /**
   * Bumped whenever a phase restarts onto the screen it already shows. The sound
   * director keys off screen/card changes, so without this a retry of phase 2 would
   * not re-fire the kentongan. The original faked it by poking its own last-screen
   * memo to 'over' and last-card to -1.
   */
  soundEpoch: number
}

export const createInitialState = (config: GameConfig): GameState => ({
  screen: 'intro',
  hoursLeft: config.prepHours,
  safety: 50,
  competency: { ...NO_COMPETENCY },
  prepTags: [],
  strikes: 0,
  mapChoices: {},
  openSpotId: null,
  cardIndex: 0,
  timeLeftMs: decisionMs(config),
  feedback: null,
  crisisLog: [],
  family: { ...INITIAL_FAMILY },
  recapLines: [],
  recapIndex: 0,
  landslideFallen: false,
  overCause: '',
  overFromPhase: 2,
  overReason: 'safety',
  pendingGameOver: null,
  soundEpoch: 0,
})

/** Phases 1 and 3 share the map screen; phase 2 is the timed crisis run. */
export const isMapScreen = (screen: ScreenId): screen is 'p1' | 'p3' =>
  screen === 'p1' || screen === 'p3'

export const isRecapScreen = (screen: ScreenId): screen is 'recap1' | 'recap2' | 'recap3' =>
  screen === 'recap1' || screen === 'recap2' || screen === 'recap3'
