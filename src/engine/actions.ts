import type { PhaseNumber } from './state'

/** Every way the game state can change. */
export type GameAction =
  /** Intro to phase 1. */
  | { type: 'START' }
  /** Back to the intro screen, everything reset. */
  | { type: 'RESTART' }
  | { type: 'OPEN_SPOT'; spotId: string }
  | { type: 'CLOSE_SPOT' }
  /** Pick an option at the currently open map spot. */
  | { type: 'CHOOSE_MAP_OPTION'; optionIndex: number }
  /** Leave a map phase for its reflection screen. */
  | { type: 'FINISH_MAP' }
  /** Advance the reflection, or leave it for the next phase. */
  | { type: 'RECAP_NEXT' }
  /** Countdown pulse during phase 2. */
  | { type: 'TICK'; deltaMs: number }
  /** Pick an option on the current crisis card; timedOut when the clock chose. */
  | { type: 'CHOOSE_CRISIS_OPTION'; optionIndex: number; timedOut: boolean }
  /** Dismiss the feedback and move to the next card, the recap, or game over. */
  | { type: 'NEXT_CARD' }
  /** Commit the deferred game over raised by a fatal map choice. */
  | { type: 'COMMIT_GAME_OVER' }
  /** Replay the phase the player died in. */
  | { type: 'RETRY_PHASE' }
  /** Direct entry, used by tests and dev tooling. */
  | { type: 'GAME_OVER'; cause: string; fromPhase: PhaseNumber }
