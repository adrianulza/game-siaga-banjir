/**
 * Tunable rules of play. These were the original's `data-props` editor knobs; the
 * min/max metadata is kept because it documents the intended ranges and can drive a
 * dev-only settings drawer.
 */
export interface GameConfig {
  /** Seconds allowed per phase-2 crisis decision, before any prep bonus. */
  crisisSeconds: number
  /** Seconds allowed to decide once a map spot is open, in phases 1 and 3. */
  mapSeconds: number
  /** Hour budget for each map phase. */
  prepHours: number
  /** Screen shake, thunder, and other theatrics. */
  dramatic: boolean
}

export const DEFAULT_CONFIG: GameConfig = {
  crisisSeconds: 20,
  mapSeconds: 30,
  prepHours: 10,
  dramatic: true,
}

export const CONFIG_SCHEMA = {
  crisisSeconds: { min: 5, max: 40, unit: 'detik', section: 'Aturan main' },
  mapSeconds: { min: 10, max: 90, unit: 'detik', section: 'Aturan main' },
  prepHours: { min: 4, max: 16, unit: 'jam', section: 'Aturan main' },
  dramatic: { section: 'Animasi' },
} as const

/** Crisis decision window in milliseconds, before any prep bonus. */
export const decisionMs = (config: GameConfig) => config.crisisSeconds * 1000

/** Map spot decision window in milliseconds. */
export const mapDecisionMs = (config: GameConfig) => config.mapSeconds * 1000
