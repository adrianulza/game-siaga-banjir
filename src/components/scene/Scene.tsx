import { PHASE2_CARDS } from '@/data/phase2-darurat'
import { mapDecisionMs } from '@/engine/config'
import { cardDecisionMs, spotsForScreen } from '@/engine/reducer'
import { competencyReport, timerDisplay } from '@/engine/selectors'
import { isMapScreen, isRecapScreen } from '@/engine/state'
import { useGame } from '@/hooks/useGame'
import { actorsFor } from '@/scene/actors'
import { cameraFor, layerTransform, sceneHeight } from '@/scene/camera'
import { spotPins } from '@/scene/props'
import { skyPalette, weatherLevel, windStrength } from '@/scene/weather'

import { Actor } from './Actor'
import { Box } from './Box'
import { ReflectionScene } from './ReflectionScene'
import { River } from './River'
import { Village } from './Village'

const PAN = 'transform 1.15s cubic-bezier(.4,0,.2,1)'

const SCORE_LABEL: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: '.09em',
  textTransform: 'uppercase',
  color: 'var(--color-neutral-700)',
}

/**
 * One score, as a rule and a filled length. These sit over the scene the whole
 * run — Keselamatan uses the red fill, the four competencies the accent one.
 */
const ScoreBar = ({
  label,
  value,
  fill,
  popping,
}: {
  label: string
  value: number
  fill?: string
  popping: boolean
}) => (
  <div style={{ display: 'grid', gap: 2, animation: popping ? 'pop .46s ease' : 'none' }}>
    <div style={{ ...SCORE_LABEL, display: 'flex', justifyContent: 'space-between', gap: 10 }}>
      <span>{label}</span>
      <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>{value}</span>
    </div>
    <div style={{ height: 4, background: 'var(--color-neutral-300)' }}>
      <div
        style={{
          height: '100%',
          width: `${value}%`,
          background: fill ?? 'var(--color-accent-700)',
          transition: 'width .35s ease',
        }}
      />
    </div>
  </div>
)

/** Keselamatan and the four competency bars, pinned over the scene's top-right corner. */
const ScoreBars = () => {
  const { state, config, pops } = useGame()
  return (
    <div
      style={{
        position: 'absolute',
        right: 16,
        top: 16,
        display: 'grid',
        gap: 6,
        minWidth: 168,
        padding: '10px 14px',
        background: 'color-mix(in srgb,var(--color-bg) 88%,transparent)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <ScoreBar
        label="Keselamatan"
        value={state.safety}
        fill={state.safety <= 50 ? 'var(--color-danger)' : 'var(--color-accent-700)'}
        popping={pops.safety}
      />
      {competencyReport(state, config).map((bar) => (
        <ScoreBar key={bar.id} label={bar.label} value={bar.value} popping={pops[bar.id]} />
      ))}
    </div>
  )
}

/** Three drifting cloud banks, on their own slower parallax than the ridge. */
const Clouds = ({ x, color }: { x: number; color: string }) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      top: 0,
      width: '100%',
      height: '100%',
      transform: `translateX(${x}px)`,
      transition: 'transform 1.2s cubic-bezier(.4,0,.2,1)',
      color,
    }}
  >
    <Box x={0} y={18} style={{ animation: 'drift 60s linear infinite', opacity: 0.95 }}>
      <Box w={150} h={46} style={{ borderRadius: 40, background: 'currentColor' }} />
      <Box
        x={36}
        y={-30}
        w={82}
        h={82}
        style={{ borderRadius: '50%', background: 'currentColor' }}
      />
      <Box
        x={96}
        y={-14}
        w={54}
        h={54}
        style={{ borderRadius: '50%', background: 'currentColor' }}
      />
    </Box>
    <Box x={0} y={64} style={{ animation: 'drift 86s linear infinite -34s', opacity: 0.9 }}>
      <Box w={210} h={56} style={{ borderRadius: 44, background: 'currentColor' }} />
      <Box
        x={48}
        y={-38}
        w={104}
        h={104}
        style={{ borderRadius: '50%', background: 'currentColor' }}
      />
    </Box>
    <Box x={0} y={6} style={{ animation: 'drift 104s linear infinite -70s', opacity: 0.8 }}>
      <Box w={120} h={38} style={{ borderRadius: 40, background: 'currentColor' }} />
      <Box
        x={28}
        y={-24}
        w={62}
        h={62}
        style={{ borderRadius: '50%', background: 'currentColor' }}
      />
    </Box>
  </div>
)

/** Three rain sheets at different angles and speeds, plus lightning and vignette. */
const WeatherOverlay = ({ level, dramatic }: { level: number; dramatic: boolean }) => {
  const sheets = [
    {
      opacity: level >= 1 ? 1 : 0,
      speed: '.95s',
      gradient:
        'repeating-linear-gradient(100deg,transparent 0 10px,color-mix(in srgb,var(--color-text) 34%,transparent) 10px 11px,transparent 11px 26px)',
    },
    {
      opacity: level >= 2 ? 0.62 : 0,
      speed: '.58s',
      gradient:
        'repeating-linear-gradient(110deg,transparent 0 8px,color-mix(in srgb,var(--color-text) 42%,transparent) 8px 10px,transparent 10px 22px)',
    },
    {
      opacity: level >= 3 && dramatic ? 0.34 : 0,
      speed: '.34s',
      gradient:
        'repeating-linear-gradient(122deg,transparent 0 6px,color-mix(in srgb,var(--color-neutral-100) 60%,transparent) 6px 9px,transparent 9px 18px)',
    },
  ]

  return (
    <>
      {sheets.map((sheet) => (
        <div
          key={sheet.speed}
          style={{
            position: 'absolute',
            inset: -60,
            pointerEvents: 'none',
            background: sheet.gradient,
            backgroundSize: '70px 280px',
            animation: `rainfall ${sheet.speed} linear infinite`,
            opacity: sheet.opacity,
            transition: 'opacity 2s',
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'var(--color-neutral-100)',
          opacity: 0,
          animation: level === 3 && dramatic ? 'flash 5.5s linear infinite' : 'none',
        }}
      />
      {/* newsprint halftone: the whole scene is printed, not photographed */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage:
            'radial-gradient(color-mix(in srgb,var(--color-text) 62%,transparent) .6px,transparent .85px)',
          backgroundSize: '4px 4px',
          opacity: 0.15,
          mixBlendMode: 'multiply',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          boxShadow: 'inset 0 0 120px 20px color-mix(in srgb,var(--color-text) 28%,transparent)',
          opacity: level >= 2 ? 0.8 : 0.25,
          transition: 'opacity 2s',
        }}
      />
    </>
  )
}

/** The edition goes to press with mourning rules top and bottom. */
const GameOverPlate = () => (
  <>
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background:
          'linear-gradient(to bottom,color-mix(in srgb,var(--color-text) 55%,transparent),color-mix(in srgb,var(--color-text) 22%,transparent) 46%,color-mix(in srgb,var(--color-text) 62%,transparent))',
        animation: 'fadeIn 1.2s ease',
      }}
    />
    <Box
      x={0}
      y={0}
      h={11}
      style={{ right: 0, width: undefined, background: 'var(--color-text)' }}
    />
    <Box
      x={0}
      y={15}
      h={2}
      style={{ right: 0, width: undefined, background: 'var(--color-text)' }}
    />
    <Box
      x={0}
      h={11}
      style={{ right: 0, bottom: 0, width: undefined, background: 'var(--color-text)' }}
    />

    {/* a zero set as three misregistered process plates */}
    <Box
      y={44}
      style={{ right: 36, textAlign: 'right', animation: 'fadeUp 1s ease', pointerEvents: 'none' }}
    >
      <div style={{ position: 'relative', height: 118 }}>
        {[
          { right: 5, top: -4, color: 'var(--color-accent)', opacity: 0.75 },
          { right: -4, top: 3, color: 'var(--color-accent-2)', opacity: 0.7 },
          { right: 0, top: 0, color: 'var(--color-neutral-100)', opacity: 1 },
        ].map((plate) => (
          <div
            key={plate.color}
            style={{
              position: 'absolute',
              right: plate.right,
              top: plate.top,
              font: '600 128px/1 var(--font-heading)',
              color: plate.color,
              opacity: plate.opacity,
            }}
          >
            0
          </div>
        ))}
      </div>
      <div
        style={{
          fontSize: 12,
          letterSpacing: '.2em',
          textTransform: 'uppercase',
          color: 'var(--color-neutral-100)',
          opacity: 0.9,
          marginTop: 6,
        }}
      >
        Keselamatan habis
      </div>
    </Box>

    <Box x={34} y={44} style={{ animation: 'fadeUp 1.2s ease' }}>
      <div
        style={{ font: 'italic 600 46px/1 var(--font-heading)', color: 'var(--color-neutral-100)' }}
      >
        Permainan Berakhir
      </div>
      <div
        style={{
          width: 290,
          height: 2,
          background: 'var(--color-neutral-100)',
          opacity: 0.7,
          marginTop: 10,
        }}
      />
    </Box>
  </>
)

/** Clickable pins on the village map. They live in the world so they pan with it. */
const SpotPins = ({ zoom }: { zoom: number }) => {
  const { state, dispatch } = useGame()
  if (!isMapScreen(state.screen)) return null

  return (
    <>
      {spotPins(state, spotsForScreen(state.screen), zoom).map((pin) => (
        <button
          key={pin.id}
          type="button"
          disabled={pin.disabled}
          onClick={() => dispatch({ type: 'OPEN_SPOT', spotId: pin.id })}
          style={{
            position: 'absolute',
            left: pin.x,
            top: pin.y,
            transform: `translate(-50%,-50%) scale(${pin.inverseZoom})`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 5,
            background: 'none',
            border: 0,
            cursor: pin.disabled ? 'default' : 'pointer',
            padding: 0,
            opacity: pin.opacity,
            transition: 'opacity .5s,transform .9s cubic-bezier(.4,0,.2,1)',
          }}
        >
          <span
            className="spot-pin"
            style={
              {
                width: 38,
                height: 38,
                borderRadius: '50%',
                '--pin-bg': pin.background,
                color: 'var(--color-neutral-100)',
                display: 'grid',
                placeItems: 'center',
                font: '600 17px var(--font-heading)',
                boxShadow: 'var(--shadow-md)',
                animation: pin.animation,
              } as React.CSSProperties
            }
          >
            {pin.mark}
          </span>
          <span
            style={{
              background: 'var(--color-bg)',
              padding: '3px 10px',
              fontSize: 13,
              boxShadow: 'var(--shadow-sm)',
              whiteSpace: 'nowrap',
            }}
          >
            {pin.name}
          </span>
        </button>
      ))}
    </>
  )
}

/**
 * The side-scrolling world. Three parallax depths — clouds, distant ridge, and the
 * village itself — all driven by one camera, so opening a map spot or turning a
 * crisis card pans and zooms the whole scene together.
 */
export const Scene = ({ shaking }: { shaking: boolean }) => {
  const { state, config } = useGame()

  const level = weatherLevel(state, config)
  const sky = skyPalette(level)
  const camera = cameraFor(state)
  const height = sceneHeight(state)
  const wind = windStrength(level)

  const swayDuration = {
    1: ['4.4s', '5.2s', '3s'],
    2: ['2.4s', '2.8s', '1.6s'],
    3: ['1.1s', '.9s', '.7s'],
  }[wind]
  const treeAnim1 = `sway${wind} ${swayDuration[0]} ease-in-out infinite`
  const treeAnim2 = `sway${wind} ${swayDuration[1]} ease-in-out infinite -1s`
  const flagAnim = `sway${wind} ${swayDuration[2]} ease-in-out infinite`

  // Both phases are on a clock now: 20s (plus any the run's preparation bought)
  // on a crisis card, 30s once a map spot is open.
  const onCrisisCard = state.screen === 'p2'
  const onOpenSpot = isMapScreen(state.screen) && state.openSpotId !== null
  const timer = timerDisplay(
    state,
    onOpenSpot
      ? mapDecisionMs(config)
      : cardDecisionMs(PHASE2_CARDS[state.cardIndex], state.prepTags, config),
  )

  return (
    <div
      style={{
        position: 'relative',
        height,
        margin: '10px 36px 0',
        overflow: 'hidden',
        background: sky.top,
        transition: 'height .8s cubic-bezier(.4,0,.2,1),background 2.6s',
        animation: shaking ? 'shake .6s ease-in-out 2' : 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(to bottom,${sky.bottom},transparent 62%)`,
          opacity: level >= 2 ? 0.9 : 0.45,
          transition: 'opacity 2.6s',
        }}
      />
      <Box
        y={26}
        w={78}
        h={78}
        style={{
          left: 74,
          borderRadius: '50%',
          background: 'var(--color-process-yellow)',
          opacity: level === 0 ? 1 : 0,
          transition: 'opacity 2.4s',
        }}
      />
      <Box
        y={22}
        w={44}
        h={44}
        style={{
          left: 96,
          borderRadius: '50%',
          background: 'var(--color-neutral-200)',
          opacity: level === 3 ? 0.8 : 0,
          transition: 'opacity 2.4s',
        }}
      />

      <Clouds x={-camera.x * 0.12 * camera.zoom + 300} color={sky.cloud} />

      {/* distant ridge, at roughly a third of the village's parallax */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 2700,
          height: 900,
          transformOrigin: '0 0',
          transform: layerTransform(camera, height, 0.32),
          transition: PAN,
        }}
      >
        <Box
          x={-160}
          y={330}
          w={1200}
          h={640}
          style={{
            borderRadius: '60% 40% 0 0/94% 78% 0 0',
            background: 'var(--color-neutral-400)',
            opacity: 0.5,
          }}
        />
        <Box
          x={760}
          y={392}
          w={1500}
          h={560}
          style={{
            borderRadius: '44% 56% 0 0/88% 74% 0 0',
            background: 'var(--color-neutral-400)',
            opacity: 0.38,
          }}
        />
        <Box
          x={2000}
          y={366}
          w={1000}
          h={580}
          style={{
            borderRadius: '52% 48% 0 0/90% 80% 0 0',
            background: 'var(--color-neutral-400)',
            opacity: 0.44,
          }}
        />
      </div>

      {/* the village world */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 2700,
          height: 900,
          transformOrigin: '0 0',
          transform: layerTransform(camera, height, 1),
          transition: PAN,
        }}
      >
        <Village treeAnim1={treeAnim1} treeAnim2={treeAnim2} flagAnim={flagAnim} />
        <River />
        {actorsFor(state).map((actor) => (
          <Actor key={actor.id} a={actor} />
        ))}
        <SpotPins zoom={camera.zoom} />
      </div>

      <WeatherOverlay level={level} dramatic={config.dramatic} />

      {onCrisisCard || onOpenSpot ? (
        <>
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              height: 7,
              background: 'color-mix(in srgb,var(--color-text) 22%,transparent)',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${timer.percent}%`,
                background: timer.color,
                transition: 'width .1s linear',
              }}
            />
          </div>
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: 16,
              transform: 'translateX(-50%)',
            }}
          >
            {/* The tick animation scales this inner element; the wrapper above owns
                the centering transform so the two never fight over it. */}
            <div
              style={{
                font: '600 44px/1 var(--font-heading)',
                color: 'var(--color-neutral-100)',
                textShadow: '0 2px 8px rgba(0,0,0,.55)',
                animation: timer.animation,
              }}
            >
              {timer.seconds}
            </div>
          </div>
        </>
      ) : null}

      {/* The game-over plate already owns this corner with its own zero motif. */}
      {state.screen !== 'over' && state.screen !== 'intro' && <ScoreBars />}

      {state.screen === 'over' && <GameOverPlate />}
      {isRecapScreen(state.screen) && <ReflectionScene screen={state.screen} />}
    </div>
  )
}
