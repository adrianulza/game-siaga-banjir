import { CLOUD_COLOR, SKY_BOTTOM, SKY_TOP } from '@/data/world'
import type { GameConfig } from '@/engine/config'
import type { GameState, ScreenId } from '@/engine/state'

/**
 * Four weather steps drive the whole palette: 0 clear, 1 overcast, 2 storm,
 * 3 the worst of it. Everything visual about the sky reads off this one number.
 */
export type WeatherLevel = 0 | 1 | 2 | 3

export const weatherLevel = (state: GameState, config: GameConfig): WeatherLevel => {
  const hoursUsed = config.prepHours - state.hoursLeft

  const byScreen: Record<ScreenId, WeatherLevel> = {
    intro: 0,
    // Phase 1 darkens once the player has spent half the day preparing.
    p1: hoursUsed >= config.prepHours / 2 ? 2 : 1,
    recap1: 3,
    p2: 3,
    recap2: 2,
    p3: 1,
    recap3: 1,
    end: 0,
    over: 3,
  }
  return byScreen[state.screen]
}

/** Rain loudness, 0..1 — feeds the audio bed as well as the visual overlay. */
export const rainLevel = (state: GameState, config: GameConfig): number => {
  switch (state.screen) {
    case 'intro':
      return 0.08
    case 'p1':
      return 0.18 + ((config.prepHours - state.hoursLeft) / config.prepHours) * 0.35
    case 'recap1':
      return 0.7
    case 'p2':
      return 0.55 + Math.min(state.cardIndex, 5) * 0.09
    case 'recap2':
      return 0.5
    case 'over':
      return 0.95
    default:
      return 0.12
  }
}

/** How hard the trees and flag sway; keyed to the same four weather steps. */
export const windStrength = (level: WeatherLevel): 1 | 2 | 3 =>
  level >= 3 ? 3 : level === 2 ? 2 : 1

export interface SkyPalette {
  top: string
  bottom: string
  cloud: string
}

export const skyPalette = (level: WeatherLevel): SkyPalette => ({
  top: SKY_TOP[level],
  bottom: SKY_BOTTOM[level],
  cloud: CLOUD_COLOR[level],
})
