/**
 * Tunable rules of play. These were the original's `data-props` editor knobs; the
 * min/max metadata is kept because it documents the intended ranges and can drive a
 * dev-only settings drawer.
 */
export interface GameConfig {
  /** Seconds allowed per phase-2 crisis decision. */
  decisionSeconds: number
  /** Hour budget for each map phase. */
  prepHours: number
  /** Screen shake, thunder, and other theatrics. */
  dramatic: boolean
}

export const DEFAULT_CONFIG: GameConfig = {
  decisionSeconds: 15,
  prepHours: 10,
  dramatic: true,
}

export const CONFIG_SCHEMA = {
  decisionSeconds: { min: 5, max: 40, unit: 'detik', section: 'Aturan main' },
  prepHours: { min: 4, max: 16, unit: 'jam', section: 'Aturan main' },
  dramatic: { section: 'Animasi' },
} as const

/** Decision window in milliseconds. */
export const decisionMs = (config: GameConfig) => config.decisionSeconds * 1000
