import { describe, expect, it } from 'vitest'

import { PHASE1_SPOTS } from '@/data/phase1-siaga'
import { PHASE2_CARDS } from '@/data/phase2-darurat'
import { PHASE3_SPOTS } from '@/data/phase3-pemulihan'
import { FLOOD_HEIGHTS, GROUND_Y, RIVER_FILL } from '@/data/world'
import { DEFAULT_CONFIG } from '@/engine/config'
import { createInitialState, type GameState, type ScreenId } from '@/engine/state'
import { cameraFor, layerTransform, sceneHeight } from '@/scene/camera'
import { floodHeight, floodSurfaceY, isSpilling, riverFill, waterSurfaceY } from '@/scene/water'
import { rainLevel, skyPalette, weatherLevel, windStrength } from '@/scene/weather'

const config = DEFAULT_CONFIG
const at = (over: Partial<GameState> = {}): GameState => ({
  ...createInitialState(config),
  ...over,
})

const ALL_SCREENS: ScreenId[] = [
  'intro',
  'p1',
  'recap1',
  'p2',
  'recap2',
  'p3',
  'recap3',
  'over',
  'end',
]

describe('camera', () => {
  it('frames the village wide on the map screens and the ending', () => {
    for (const screen of ['p1', 'p3', 'end'] as const) {
      expect(cameraFor(at({ screen }))).toEqual({ x: 1290, zoom: 0.56, y: 440 })
    }
  })

  it('pushes in on the open spot', () => {
    for (const spot of PHASE1_SPOTS) {
      expect(cameraFor(at({ screen: 'p1', openSpotId: spot.id }))).toEqual(spot.camera)
    }
    for (const spot of PHASE3_SPOTS) {
      expect(cameraFor(at({ screen: 'p3', openSpotId: spot.id }))).toEqual(spot.camera)
    }
  })

  it('falls back to the wide shot for an unknown spot id', () => {
    expect(cameraFor(at({ screen: 'p1', openSpotId: 'tidak-ada' }))).toEqual({
      x: 1290,
      zoom: 0.56,
      y: 440,
    })
  })

  it('uses each crisis card own framing', () => {
    PHASE2_CARDS.forEach((card, i) => {
      expect(cameraFor(at({ screen: 'p2', cardIndex: i }))).toEqual(card.camera)
    })
  })

  it('closes in for the game over screen', () => {
    expect(cameraFor(at({ screen: 'over' }))).toEqual({ x: 900, zoom: 0.95, y: 494 })
  })

  it('gives the recap screens a taller viewport', () => {
    expect(sceneHeight(at({ screen: 'recap1' }))).toBe(556)
    expect(sceneHeight(at({ screen: 'p1' }))).toBe(436)
  })

  it('offsets a parallax layer against the camera', () => {
    const camera = { x: 1000, zoom: 0.5, y: 400 }
    // A layer pinned to the viewport ignores the camera x entirely.
    expect(layerTransform(camera, 436, 0)).toBe('translate(640px,18px) scale(0.5)')
    // A full-parallax layer tracks it: 640 - 1000*1*0.5 = 140.
    expect(layerTransform(camera, 436, 1)).toBe('translate(140px,18px) scale(0.5)')
  })
})

describe('weather', () => {
  it('runs clear at the intro and ending, worst during the flood night', () => {
    expect(weatherLevel(at({ screen: 'intro' }), config)).toBe(0)
    expect(weatherLevel(at({ screen: 'end' }), config)).toBe(0)
    expect(weatherLevel(at({ screen: 'p2' }), config)).toBe(3)
    expect(weatherLevel(at({ screen: 'recap1' }), config)).toBe(3)
    expect(weatherLevel(at({ screen: 'over' }), config)).toBe(3)
  })

  it('darkens phase 1 once half the hour budget is spent', () => {
    expect(weatherLevel(at({ screen: 'p1', hoursLeft: config.prepHours }), config)).toBe(1)
    expect(weatherLevel(at({ screen: 'p1', hoursLeft: config.prepHours / 2 }), config)).toBe(2)
    expect(weatherLevel(at({ screen: 'p1', hoursLeft: 0 }), config)).toBe(2)
  })

  it('gives every screen a defined sky palette', () => {
    for (const screen of ALL_SCREENS) {
      const palette = skyPalette(weatherLevel(at({ screen }), config))
      expect(palette.top).toBeTruthy()
      expect(palette.bottom).toBeTruthy()
      expect(palette.cloud).toBeTruthy()
    }
  })

  it('scales wind with the weather', () => {
    expect(windStrength(0)).toBe(1)
    expect(windStrength(1)).toBe(1)
    expect(windStrength(2)).toBe(2)
    expect(windStrength(3)).toBe(3)
  })

  it('keeps rain between a drizzle and a downpour on every screen', () => {
    for (const screen of ALL_SCREENS) {
      const level = rainLevel(at({ screen, hoursLeft: 0 }), config)
      expect(level).toBeGreaterThanOrEqual(0)
      expect(level).toBeLessThanOrEqual(1)
    }
  })

  it('builds rain through phase 1 and phase 2', () => {
    expect(rainLevel(at({ screen: 'intro' }), config)).toBeCloseTo(0.08)
    expect(rainLevel(at({ screen: 'p1', hoursLeft: config.prepHours }), config)).toBeCloseTo(0.18)
    expect(rainLevel(at({ screen: 'p1', hoursLeft: 0 }), config)).toBeCloseTo(0.53)
    expect(rainLevel(at({ screen: 'p2', cardIndex: 0 }), config)).toBeCloseTo(0.55)
    // Caps at card 5 so it does not exceed 1.
    expect(rainLevel(at({ screen: 'p2', cardIndex: 5 }), config)).toBeCloseTo(1)
    expect(rainLevel(at({ screen: 'p2', cardIndex: 7 }), config)).toBeCloseTo(1)
    expect(rainLevel(at({ screen: 'over' }), config)).toBeCloseTo(0.95)
  })
})

describe('water', () => {
  it('fills the channel as phase 1 progresses', () => {
    expect(riverFill(at({ screen: 'p1', hoursLeft: config.prepHours }), config)).toBeCloseTo(0.34)
    expect(riverFill(at({ screen: 'p1', hoursLeft: 0 }), config)).toBeCloseTo(0.62)
  })

  it('follows the per-card fill table in phase 2', () => {
    PHASE2_CARDS.forEach((_, i) => {
      expect(riverFill(at({ screen: 'p2', cardIndex: i }), config)).toBe(RIVER_FILL[i])
    })
  })

  it('is brim full on the game over screen', () => {
    expect(riverFill(at({ screen: 'over' }), config)).toBe(1)
  })

  it('raises the surface as the channel fills', () => {
    expect(waterSurfaceY(0)).toBe(690)
    expect(waterSurfaceY(1)).toBe(494)
    // Higher fill means a smaller y — the surface moves up the screen.
    expect(waterSurfaceY(0.8)).toBeLessThan(waterSurfaceY(0.4))
  })

  it('spills over the levee only when nearly full', () => {
    expect(isSpilling(0.89)).toBe(false)
    expect(isSpilling(0.9)).toBe(true)
    expect(isSpilling(1)).toBe(true)
  })

  it('stands flood water over the village only where the story calls for it', () => {
    expect(floodHeight(at({ screen: 'p1' }))).toBe(0)
    expect(floodHeight(at({ screen: 'p3' }))).toBe(0)
    expect(floodHeight(at({ screen: 'recap2' }))).toBe(46)
    expect(floodHeight(at({ screen: 'over' }))).toBe(176)
    PHASE2_CARDS.forEach((_, i) => {
      expect(floodHeight(at({ screen: 'p2', cardIndex: i }))).toBe(FLOOD_HEIGHTS[i])
    })
  })

  it('rises monotonically through the flood night', () => {
    const heights = PHASE2_CARDS.map((_, i) => floodHeight(at({ screen: 'p2', cardIndex: i })))
    for (let i = 1; i < heights.length; i++) {
      expect(heights[i]!).toBeGreaterThan(heights[i - 1]!)
    }
  })

  it('places the flood surface above ground level', () => {
    expect(floodSurfaceY(at({ screen: 'over' }))).toBe(GROUND_Y - 176)
    expect(floodSurfaceY(at({ screen: 'intro' }))).toBe(GROUND_Y)
  })
})
