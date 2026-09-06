import { Masthead } from '@/components/Masthead'
import { RotatePrompt } from '@/components/RotatePrompt'
import { BottomPanel } from '@/components/panels/BottomPanel'
import { Scene } from '@/components/scene/Scene'
import { GameProvider, useGame } from '@/hooks/useGame'
import { STAGE_WIDTH, useStageScale } from '@/hooks/useStageScale'

/**
 * The game is authored on a 1280-wide stage and scaled to the viewport, so the
 * hand-placed village geometry stays in register at any window size. The stage height
 * flexes with the viewport's aspect ratio (see `useStageScale`) so a phone held
 * sideways does not letterbox the game down to an unreadable size.
 */
const Stage = () => {
  const { height, scale, portrait, compact } = useStageScale()
  const { shaking } = useGame()

  return (
    <div
      data-compact={compact || undefined}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--color-bg)',
        color: 'var(--color-text)',
        overflow: 'hidden',
      }}
    >
      <div
        // Hidden rather than unmounted while rotated, so a run in progress survives.
        aria-hidden={portrait || undefined}
        style={{
          position: 'absolute',
          left: `calc(50% - ${STAGE_WIDTH / 2}px)`,
          top: `calc(50% - ${height / 2}px)`,
          width: STAGE_WIDTH,
          height,
          transform: `scale(${scale})`,
          transformOrigin: 'center',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Masthead />
        <Scene shaking={shaking} stageHeight={height} />
        <BottomPanel />
      </div>

      {portrait ? <RotatePrompt /> : null}
    </div>
  )
}

export const App = () => (
  <GameProvider>
    <Stage />
  </GameProvider>
)
