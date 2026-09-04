import { Masthead } from '@/components/Masthead'
import { BottomPanel } from '@/components/panels/BottomPanel'
import { Scene } from '@/components/scene/Scene'
import { GameProvider, useGame } from '@/hooks/useGame'
import { STAGE_HEIGHT, STAGE_WIDTH, useStageScale } from '@/hooks/useStageScale'

/**
 * The game is authored on a fixed 1280x800 stage and scaled to the viewport, so the
 * hand-placed village geometry stays in register at any window size.
 */
const Stage = () => {
  const scale = useStageScale()
  const { shaking } = useGame()

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--color-bg)',
        color: 'var(--color-text)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: `calc(50% - ${STAGE_WIDTH / 2}px)`,
          top: `calc(50% - ${STAGE_HEIGHT / 2}px)`,
          width: STAGE_WIDTH,
          height: STAGE_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: 'center',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Masthead />
        <Scene shaking={shaking} />
        <BottomPanel />
      </div>
    </div>
  )
}

export const App = () => (
  <GameProvider>
    <Stage />
  </GameProvider>
)
