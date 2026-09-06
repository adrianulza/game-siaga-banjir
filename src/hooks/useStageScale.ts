import { useEffect, useState } from 'react'

/**
 * The game is authored at a fixed 1280 wide and scaled to fit the viewport, so the
 * hand-placed village geometry stays in register at any window size.
 *
 * The *height* is not fixed. A phone in landscape is roughly 2.2:1 while the stage
 * is 1.6:1, so height is always the binding constraint and the scale collapses. We
 * let the authored height shrink toward the viewport's aspect ratio instead, down to
 * MIN_STAGE_HEIGHT — the scene absorbs the difference (see `sceneHeight`), which
 * crops the world vertically rather than shrinking the type.
 */
export const STAGE_WIDTH = 1280
export const MAX_STAGE_HEIGHT = 800
export const MIN_STAGE_HEIGHT = 640

/** Below this scale the authored 10-15px type is unreadable, so the compact ramp kicks in. */
const COMPACT_BELOW = 0.62

export type StageMetrics = {
  width: number
  height: number
  scale: number
  /** The viewport is taller than it is wide — the game asks the player to rotate. */
  portrait: boolean
  /** The stage is scaled down far enough that the type ramp needs to step up. */
  compact: boolean
}

const clamp = (min: number, value: number, max: number) => Math.min(max, Math.max(min, value))

const measure = (): StageMetrics => {
  // visualViewport tracks mobile Safari's collapsing URL bar; innerHeight does not.
  const vw = window.visualViewport?.width ?? window.innerWidth
  const vh = window.visualViewport?.height ?? window.innerHeight

  const height = clamp(MIN_STAGE_HEIGHT, (vh / vw) * STAGE_WIDTH, MAX_STAGE_HEIGHT)
  const scale = Math.min(vw / STAGE_WIDTH, vh / height)

  return { width: STAGE_WIDTH, height, scale, portrait: vh > vw, compact: scale < COMPACT_BELOW }
}

/** Stage geometry that fits inside the window without cropping it, kept live on resize. */
export const useStageScale = (): StageMetrics => {
  const [metrics, setMetrics] = useState(measure)

  useEffect(() => {
    let frame = 0
    const onResize = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => setMetrics(measure()))
    }

    onResize()
    window.addEventListener('resize', onResize)
    // iOS fires orientationchange before resize settles, so we listen for both.
    window.addEventListener('orientationchange', onResize)
    window.visualViewport?.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
      window.visualViewport?.removeEventListener('resize', onResize)
    }
  }, [])

  return metrics
}
