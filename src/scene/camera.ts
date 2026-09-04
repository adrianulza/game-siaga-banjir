import { PHASE2_CARDS } from '@/data/phase2-darurat'
import type { CameraShot } from '@/data/types'
import { spotsForScreen } from '@/engine/reducer'
import { isMapScreen, type GameState } from '@/engine/state'

/** Fallback framing: the whole village, seen wide. */
const WIDE: CameraShot = { x: 1290, zoom: 0.56, y: 440 }

/**
 * Where the camera sits for the current state. Opening a map spot pushes in on it;
 * each crisis card carries its own framing.
 */
export const cameraFor = (state: GameState): CameraShot => {
  const screen = state.screen

  if (screen === 'over') return { x: 900, zoom: 0.95, y: 494 }
  if (screen === 'p2')
    return PHASE2_CARDS[state.cardIndex]?.camera ?? { x: 1240, zoom: 0.9, y: 520 }

  if (isMapScreen(screen) && state.openSpotId) {
    const spot = spotsForScreen(screen).find((s) => s.id === state.openSpotId)
    if (spot) return spot.camera
  }

  if (isMapScreen(screen) || screen === 'end') return WIDE
  return { x: 1290, zoom: 0.55, y: 440 }
}

/** The recap screens use a taller viewport than the rest. */
export const sceneHeight = (state: GameState) => (state.screen.startsWith('recap') ? 556 : 436)

/**
 * CSS transform for one parallax layer.
 *
 * `parallax` is how much the layer tracks the camera: 0 pins it to the viewport,
 * 1 makes it move with the world. The 640 is half the 1280px stage.
 */
export const layerTransform = (camera: CameraShot, height: number, parallax: number) => {
  const z = camera.zoom
  const x = 640 - camera.x * parallax * z
  const y = height / 2 - camera.y * z
  return `translate(${x}px,${y}px) scale(${z})`
}
