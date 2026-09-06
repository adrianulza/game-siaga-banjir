/**
 * @vitest-environment jsdom
 *
 * Stage fitting and the portrait gate. The scale maths is the part that decides
 * whether the game is legible on a phone, and the rotate prompt is the only thing
 * standing between a portrait player and an unplayable strip of village — both are
 * invisible to the engine tests, which never look at the viewport.
 */
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { App } from '@/App'
import { createInitialState, type GameState, type ScreenId } from '@/engine/state'
import { DEFAULT_CONFIG } from '@/engine/config'
import { sceneHeight } from '@/scene/camera'
import { MAX_STAGE_HEIGHT, MIN_STAGE_HEIGHT, STAGE_WIDTH } from '@/hooks/useStageScale'

const at = (patch: Partial<GameState> & { screen: ScreenId }): GameState => ({
  ...createInitialState(DEFAULT_CONFIG),
  ...patch,
})

/** Put the jsdom window at a given viewport and let the resize listeners see it. */
const setViewport = (width: number, height: number) => {
  window.innerWidth = width
  window.innerHeight = height
  // act() so the resulting re-render is flushed before the assertion looks.
  act(() => {
    window.dispatchEvent(new Event('resize'))
  })
}

beforeEach(() => {
  vi.stubGlobal('AudioContext', undefined)
  // The hook prefers visualViewport; jsdom has none, so innerWidth/Height is read.
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    cb(0)
    return 0
  })
  vi.stubGlobal('cancelAnimationFrame', () => {})
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  setViewport(1024, 768)
})

describe('stage fitting', () => {
  it('keeps the authored height on a desktop-shaped viewport', () => {
    // 1600x1000 is 1.6:1, exactly the authored ratio — nothing to give up.
    expect(Math.min(MAX_STAGE_HEIGHT, (1000 / 1600) * STAGE_WIDTH)).toBe(MAX_STAGE_HEIGHT)
  })

  it('shortens the stage rather than letterboxing a phone held sideways', () => {
    // A 844x390 phone is 2.16:1. Held at 800 tall the fit would be 390/800 = 0.49;
    // shortening to the floor gets it to 0.61 and the type ramp stays readable.
    const naive = 390 / MAX_STAGE_HEIGHT
    const fitted = Math.min(844 / STAGE_WIDTH, 390 / MIN_STAGE_HEIGHT)
    expect(naive).toBeCloseTo(0.4875, 4)
    expect(fitted).toBeGreaterThan(naive)
    expect(fitted).toBeCloseTo(0.6094, 4)
  })

  it('gives the whole shortfall to the scene, not the masthead or the panel', () => {
    expect(sceneHeight(at({ screen: 'p1' }), MAX_STAGE_HEIGHT)).toBe(436)
    expect(sceneHeight(at({ screen: 'p1' }), MIN_STAGE_HEIGHT)).toBe(
      436 - (MAX_STAGE_HEIGHT - MIN_STAGE_HEIGHT),
    )
    expect(sceneHeight(at({ screen: 'recap1' }), MIN_STAGE_HEIGHT)).toBe(
      556 - (MAX_STAGE_HEIGHT - MIN_STAGE_HEIGHT),
    )
  })

  it('defaults to the authored height when no stage height is given', () => {
    expect(sceneHeight(at({ screen: 'p1' }))).toBe(436)
    expect(sceneHeight(at({ screen: 'recap1' }))).toBe(556)
  })

  it('costs the scene nothing beyond the stage shortfall', () => {
    // The panel is `flex: 1` off a zero basis, so anything the scene gives up that
    // the panel does not need becomes dead whitespace. Only the shortfall comes out.
    expect(sceneHeight(at({ screen: 'p1' }), MAX_STAGE_HEIGHT)).toBe(436)
  })

  it('never lets the village collapse to a slit', () => {
    expect(sceneHeight(at({ screen: 'p1' }), MIN_STAGE_HEIGHT)).toBeGreaterThanOrEqual(200)
  })
})

describe('the portrait gate', () => {
  it('stays out of the way in landscape', () => {
    setViewport(1024, 768)
    render(<App />)
    expect(screen.queryByRole('alertdialog')).toBeNull()
    expect(screen.getByRole('button', { name: 'Mulai Bermain' })).toBeTruthy()
  })

  it('covers the game and asks — in Bahasa Indonesia — for landscape', () => {
    setViewport(390, 844)
    render(<App />)

    const dialog = screen.getByRole('alertdialog')
    expect(dialog.textContent).toContain('Putar Layar Anda')
    expect(dialog.textContent).toContain('lanskap')
    expect(dialog.textContent).toContain('kunci rotasi layar')
  })

  it('lifts as soon as the device is turned, without losing the run', () => {
    setViewport(390, 844)
    render(<App />)
    expect(screen.queryByRole('alertdialog')).not.toBeNull()

    setViewport(844, 390)
    expect(screen.queryByRole('alertdialog')).toBeNull()
    // The stage was hidden, never unmounted, so the intro is still the live screen.
    expect(screen.getByRole('button', { name: 'Mulai Bermain' })).toBeTruthy()
  })

  it('hides the stage from assistive tech while the prompt is up', () => {
    setViewport(390, 844)
    const { container } = render(<App />)
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull()
  })
})
