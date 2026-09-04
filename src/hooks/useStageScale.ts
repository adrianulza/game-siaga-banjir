import { useEffect, useState } from 'react'

/** The game is authored at a fixed 1280x800 and scaled to fit the viewport. */
export const STAGE_WIDTH = 1280
export const STAGE_HEIGHT = 800

const measure = () => Math.min(window.innerWidth / STAGE_WIDTH, window.innerHeight / STAGE_HEIGHT)

/** Scale factor that fits the stage inside the window without cropping it. */
export const useStageScale = (): number => {
  const [scale, setScale] = useState(measure)

  useEffect(() => {
    const onResize = () => setScale(measure())
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return scale
}
