import { FLOOD_HEIGHTS, GROUND_Y, RIVER_FILL } from '@/data/world'
import type { GameConfig } from '@/engine/config'
import type { GameState } from '@/engine/state'

/**
 * The river is drawn as a trapezoidal channel cut below the village, so its surface
 * widens as it fills. `fill` is 0..1 of the channel depth; everything else about the
 * water derives from it.
 */
export const riverFill = (state: GameState, config: GameConfig): number => {
  switch (state.screen) {
    case 'p1':
      return 0.34 + ((config.prepHours - state.hoursLeft) / config.prepHours) * 0.28
    case 'p2':
      return RIVER_FILL[state.cardIndex] ?? 1
    case 'over':
      return 1
    case 'recap1':
      return 0.55
    case 'recap2':
      return 0.8
    case 'recap3':
    case 'p3':
      return 0.3
    default:
      return 0.28
  }
}

/** Surface height of the river in world coordinates. */
export const waterSurfaceY = (fill: number) => Math.round(690 - fill * 196)

/** How deep the flood stands over the village itself. */
export const floodHeight = (state: GameState): number => {
  if (state.screen === 'p2') return FLOOD_HEIGHTS[state.cardIndex] ?? 0
  if (state.screen === 'over') return 176
  if (state.screen === 'recap2') return 46
  return 0
}

/** Top of the standing flood water, in world coordinates. */
export const floodSurfaceY = (state: GameState) => GROUND_Y - floodHeight(state)

/** Past this the river tops the levee and sheets down the village side. */
export const isSpilling = (fill: number) => fill >= 0.9
