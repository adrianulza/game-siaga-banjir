import { FLOOD_HEIGHTS, GROUND_Y } from '@/data/world'
import type { GameState } from '@/engine/state'

import { floodHeight, isSpilling, riverFill, waterSurfaceY } from './water'
import type { GameConfig } from '@/engine/config'

/**
 * Everything in the village that reacts to the story: the landslide, the boat, the
 * cat, and the small marks that appear where the player did something useful.
 */

// ------------------------------------------------------------- landslide ----

export const landslide = (state: GameState) => {
  const fallen = state.landslideFallen
  const straining = state.screen === 'p2' && state.cardIndex >= 4

  return {
    transform: fallen ? 'translate(96px,132px) rotate(9deg)' : 'none',
    opacity: fallen ? 1 : 0,
    // Trees on the slope lean as the ground strains, then topple with it.
    treeTransform: fallen ? 'rotate(26deg) translateY(10px)' : straining ? 'rotate(7deg)' : 'none',
    // Cracks show as a warning before the slide, and as a scar afterwards.
    crackOpacity: straining
      ? 1
      : fallen
        ? 0
        : state.screen === 'p3' || state.screen === 'recap3'
          ? 0.6
          : 0,
  }
}

// ------------------------------------------------------------------ boat ----

export const rescueBoat = (state: GameState) => {
  const arrived = state.screen === 'p2' && state.cardIndex >= 5
  return {
    x: arrived ? 960 : 1400,
    y: arrived ? GROUND_Y - (FLOOD_HEIGHTS[state.cardIndex] ?? 0) - 14 : 520,
    opacity: arrived ? 1 : 0,
  }
}

// ------------------------------------------------------------------ Oyen ----

export type OyenSpot = 'rumah' | 'pagar' | 'pohon' | 'gendong'

const oyenSpot = (state: GameState): OyenSpot => {
  if (state.screen === 'over') return 'pohon'
  if (state.screen !== 'p2') return 'rumah'
  if (state.cardIndex === 3) return 'pagar'
  if (state.cardIndex >= 4) return state.family.oyen === 'cemas' ? 'pohon' : 'gendong'
  return 'rumah'
}

const OYEN_POSITIONS: Record<OyenSpot, { x: number; y: number }> = {
  pagar: { x: 1044, y: 550 },
  pohon: { x: 1078, y: 430 },
  gendong: { x: 880, y: 470 },
  rumah: { x: 462, y: 596 },
}

export const oyen = (state: GameState) => {
  const spot = oyenSpot(state)
  return {
    ...OYEN_POSITIONS[spot],
    opacity: state.family.oyen === 'terluka' ? 0.4 : 1,
    // Stranded on the fence in the current, the cat shivers.
    animation:
      spot === 'pagar' ? 'catshiver .4s ease-in-out infinite' : 'bob 2.4s ease-in-out infinite',
  }
}

// --------------------------------------------------------------- signals ----

export const kentonganSignal = (state: GameState) => {
  const sounding = state.screen === 'p2' && state.cardIndex === 0
  return {
    animation: sounding ? 'panik .22s ease-in-out infinite' : 'none',
    ring1: sounding ? 'ring 1.8s ease-out infinite' : 'none',
    ring2: sounding ? 'ring 1.8s ease-out infinite -.9s' : 'none',
  }
}

// ----------------------------------------------------------------- water ----

export const waterLayers = (state: GameState, config: GameConfig) => {
  const fill = riverFill(state, config)
  const flood = floodHeight(state)
  const spilling = isSpilling(fill)

  return {
    // The river body is positioned inside a container offset 510px down.
    riverTop: waterSurfaceY(fill) - 510,
    floodTop: GROUND_Y - flood,
    floodOpacity: flood > 0 ? 0.94 : 0,
    // Once the village side is deep enough the sheeting spill is hidden by it.
    spillOpacity: spilling && 104 - flood > 8 ? 1 : 0,
    spillHeight: Math.max(8, 104 - flood),
  }
}

// ----------------------------------------------------------------- marks ----

/**
 * Small signs that the player acted: the go-bag by the door, electronics lifted,
 * sandbags on the levee, and so on. Each appears when option 0 — the good one —
 * was chosen at the matching spot.
 *
 * Note the phase-1 marks disappear once phase 3 begins, because entering phase 3
 * clears the choice record. That is the original's behaviour, preserved here.
 */
export const marks = (state: GameState) => {
  const inPhase3 = state.screen === 'p3' || state.screen === 'recap3' || state.screen === 'end'
  const chosePhase1 = (id: string) => state.mapChoices[id] === 0
  const chosePhase3 = (id: string) => inPhase3 && state.mapChoices[id] === 0

  return {
    bag: chosePhase1('dapur'),
    electronics: chosePhase1('atap'),
    ditchFill: chosePhase1('atap') ? 'var(--color-accent-300)' : 'var(--color-neutral-500)',
    sandbags: chosePhase1('sungai'),
    evacuationMap: chosePhase1('balai'),
    catCarrier: chosePhase1('nenek'),
    replanted: chosePhase3('lereng'),
    well: chosePhase3('air'),
    laundry: chosePhase3('rumah'),
    dartoHelped: chosePhase3('darto'),
  }
}

/** The family sheltering inside lantai 2 (second floor), glimpsed through the
 *  window while the flood rises below them. */
export const floor2Occupied = (state: GameState) =>
  state.screen === 'p2' && state.cardIndex >= 2 && state.cardIndex <= 4

// ------------------------------------------------------------- map spots ----

export interface SpotPin {
  id: string
  name: string
  x: number
  y: number
  /** Counter-scales the pin so it stays the same size as the camera zooms. */
  inverseZoom: number
  mark: string
  background: string
  animation: string
  opacity: number
  disabled: boolean
}

export const spotPins = (
  state: GameState,
  spots: readonly { id: string; name: string; hotspot: { x: number; y: number } }[],
  zoom: number,
): SpotPin[] =>
  spots.map((spot, i) => {
    const visited = state.mapChoices[spot.id] !== undefined
    const disabled = visited || state.hoursLeft <= 0
    return {
      id: spot.id,
      name: spot.name,
      x: spot.hotspot.x,
      y: spot.hotspot.y,
      inverseZoom: 1 / zoom,
      mark: visited ? '✓' : String(i + 1),
      background: visited ? 'var(--color-neutral-600)' : 'var(--color-pin)',
      animation: disabled ? 'none' : 'pulse 2s ease-out infinite',
      opacity: state.openSpotId
        ? state.openSpotId === spot.id
          ? 1
          : 0.2
        : disabled && !visited
          ? 0.4
          : 1,
      disabled,
    }
  })
