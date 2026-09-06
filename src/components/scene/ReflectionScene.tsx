import { RECAP_SCENES, type RecapScene } from '@/engine/selectors'

import { Box } from './Box'

const INK = 'var(--color-text)'
const NIGHT_RAIN =
  'repeating-linear-gradient(112deg,transparent 0 7px,color-mix(in srgb,var(--color-neutral-100) 45%,transparent) 7px 9px,transparent 9px 20px)'

/** An open eye that blinks on its own rhythm. */
const Eye = ({
  side,
  top,
  w,
  h,
  pupilX,
  pupilSize,
  blink,
}: {
  side: 'left' | 'right'
  top: string
  w: string
  h: string
  pupilX: string
  pupilSize: string
  blink: string
}) => (
  <Box
    y={top}
    w={w}
    h={h}
    style={{
      [side]: side === 'left' ? '19%' : '19%',
      borderRadius: '50%',
      background: 'var(--color-neutral-100)',
      border: `1.2px solid ${INK}`,
      overflow: 'hidden',
      animation: blink,
    }}
  >
    <Box
      x={pupilX}
      y="30%"
      w={pupilSize}
      h={pupilSize}
      style={{ borderRadius: '50%', background: INK }}
    />
  </Box>
)

/** The tarpaulin shelter and the silhouettes of other families at the posko. */
const PoskoBackdrop = () => {
  const roofClip =
    'polygon(0 0,100% 0,100% 52%,86% 68%,72% 50%,56% 70%,40% 48%,24% 66%,10% 46%,0 60%)'
  return (
    <>
      <Box
        x={-40}
        y={-10}
        w={1400}
        h={120}
        style={{ background: 'var(--color-accent-800)', clipPath: roofClip }}
      />
      <Box
        x={-40}
        y={-10}
        w={1400}
        h={120}
        style={{
          background:
            'repeating-linear-gradient(90deg,transparent 0 46px,color-mix(in srgb,var(--color-neutral-100) 12%,transparent) 46px 50px)',
          clipPath: roofClip,
        }}
      />
      {/* rain still falling past the open side */}
      <Box
        y={60}
        w={190}
        h={300}
        style={{
          right: 0,
          background:
            'repeating-linear-gradient(108deg,transparent 0 8px,color-mix(in srgb,var(--color-neutral-100) 26%,transparent) 8px 10px,transparent 10px 22px)',
          backgroundSize: '60px 240px',
          animation: 'rainfall .5s linear infinite',
          opacity: 0.5,
        }}
      />
      <Box
        x={150}
        w={74}
        h={44}
        style={{ bottom: 78, borderRadius: 6, background: 'var(--color-neutral-800)' }}
      />
      <Box
        x={236}
        w={52}
        h={32}
        style={{ bottom: 78, borderRadius: 5, background: 'var(--color-neutral-600)' }}
      />
      <Box
        w={88}
        h={38}
        style={{ right: 230, bottom: 78, borderRadius: 6, background: 'var(--color-neutral-800)' }}
      />
      <Box
        x={120}
        y={104}
        w={9}
        h={200}
        style={{ background: 'var(--color-neutral-800)', opacity: 0.55 }}
      />
      <Box
        x={1120}
        y={104}
        w={9}
        h={220}
        style={{ background: 'var(--color-neutral-800)', opacity: 0.55 }}
      />
      <Box x={170} y={150} style={{ display: 'flex', gap: 56, opacity: 0.28 }}>
        {[
          { w: 56, h: 120, r: 28 },
          { w: 48, h: 104, r: 24 },
          { w: 60, h: 128, r: 30 },
        ].map((s) => (
          <div
            key={s.w}
            style={{
              width: s.w,
              height: s.h,
              borderRadius: `${s.r}px ${s.r}px 0 0`,
              background: 'var(--color-neutral-900)',
            }}
          />
        ))}
      </Box>
      <Box y={168} style={{ right: 120, display: 'flex', gap: 44, opacity: 0.24 }}>
        {[
          { w: 52, h: 112, r: 26 },
          { w: 44, h: 96, r: 22 },
        ].map((s) => (
          <div
            key={s.w}
            style={{
              width: s.w,
              height: s.h,
              borderRadius: `${s.r}px ${s.r}px 0 0`,
              background: 'var(--color-neutral-900)',
            }}
          />
        ))}
      </Box>
    </>
  )
}

/** The family's own front room at night, rain against the window. */
const HomeBackdrop = () => (
  <>
    <Box
      x={0}
      y={0}
      w={1280}
      h={340}
      style={{ background: 'var(--color-neutral-800)', opacity: 0.35 }}
    />
    <Box
      x={920}
      y={70}
      w={200}
      h={150}
      style={{
        background: 'var(--color-neutral-900)',
        border: '8px solid var(--color-neutral-700)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: NIGHT_RAIN,
          backgroundSize: '60px 240px',
          animation: 'rainfall .5s linear infinite',
        }}
      />
    </Box>
  </>
)

/** Whoever is doing the talking this round, drawn large and mid-sentence. */
const Speaker = ({ scene, who }: { scene: RecapScene; who: 'recap1' | 'recap2' | 'recap3' }) => (
  <div
    style={{
      position: 'absolute',
      left: 420,
      bottom: 74,
      width: 0,
      height: 0,
      transform: `scale(3.1) ${scene.transform}`,
      transformOrigin: 'bottom center',
    }}
  >
    <div
      style={{
        position: 'absolute',
        left: -15,
        bottom: 0,
        width: 30,
        height: 66,
        animation: 'bob 3.4s ease-in-out infinite',
      }}
    >
      <Box x={6} y={47} w={7} h={19} style={{ background: scene.pants }} />
      <Box x={17} y={47} w={7} h={19} style={{ background: scene.pants }} />
      <Box
        x={5}
        y={64}
        w={9}
        h={3}
        style={{ borderRadius: 2, background: 'var(--color-neutral-900)' }}
      />
      <Box
        x={16}
        y={64}
        w={9}
        h={3}
        style={{ borderRadius: 2, background: 'var(--color-neutral-900)' }}
      />

      {scene.skirt.on ? (
        <Box
          x={0}
          y={45}
          w={30}
          h={17}
          style={{
            background: scene.skirt.color,
            clipPath: 'polygon(18% 0,82% 0,100% 100%,0 100%)',
          }}
        />
      ) : null}

      <Box
        x={2}
        y={20}
        w={26}
        h={28}
        style={{ borderRadius: '5px 5px 3px 3px', background: scene.shirt }}
      />
      <Box
        x={25}
        y={23}
        w={7}
        h={24}
        style={{
          borderRadius: 4,
          background: scene.shirt,
          transformOrigin: 'top center',
          animation: 'gestur 2.8s ease-in-out infinite',
        }}
      />
      <Box
        x={-3}
        y={23}
        w={7}
        h={24}
        style={{ borderRadius: 4, background: scene.shirt, transformOrigin: 'top center' }}
      />

      <Box
        x={5}
        y={0}
        w={20}
        h={20}
        style={{
          borderRadius: '50%',
          background: 'var(--color-neutral-200)',
          border: `2.5px solid ${INK}`,
        }}
      >
        {who === 'recap2' && (
          <>
            <Box
              x="-9%"
              y="-17%"
              w="118%"
              h="50%"
              style={{ borderRadius: '52% 52% 8% 8%', background: scene.hair }}
            />
            <Box
              x="30%"
              y="60%"
              w="40%"
              h="8%"
              style={{ borderRadius: 2, background: scene.hair }}
            />
          </>
        )}
        {who === 'recap1' && (
          <>
            <Box
              x="-9%"
              y="-17%"
              w="118%"
              h="46%"
              style={{ borderRadius: '54% 54% 10% 10%', background: scene.hair }}
            />
            <Box
              y="-4%"
              w="44%"
              h="44%"
              style={{ right: '-20%', borderRadius: '50%', background: scene.hair }}
            />
          </>
        )}
        {who === 'recap3' && (
          <>
            <Box
              x="-9%"
              y="-17%"
              w="118%"
              h="44%"
              style={{ borderRadius: '54% 54% 10% 10%', background: scene.hair }}
            />
            <Box
              y="-2%"
              w="40%"
              h="40%"
              style={{ right: '-18%', borderRadius: '50%', background: scene.hair }}
            />
            <Box
              x="9%"
              y="36%"
              w="34%"
              h="34%"
              style={{ border: `1.2px solid ${INK}`, borderRadius: '50%' }}
            />
            <Box
              y="36%"
              w="34%"
              h="34%"
              style={{ right: '9%', border: `1.2px solid ${INK}`, borderRadius: '50%' }}
            />
            <Box x="43%" y="51%" w="14%" h="1.2px" style={{ background: INK }} />
            <Box
              x="13%"
              y="82%"
              w="20%"
              h="1.2px"
              style={{ background: 'color-mix(in srgb,var(--color-text) 45%,transparent)' }}
            />
            <Box
              y="82%"
              w="20%"
              h="1.2px"
              style={{
                right: '13%',
                background: 'color-mix(in srgb,var(--color-text) 45%,transparent)',
              }}
            />
          </>
        )}

        <Box
          x="19%"
          y="30%"
          w="24%"
          h="5%"
          style={{ borderRadius: 2, background: INK, opacity: 0.7 }}
        />
        <Box
          y="30%"
          w="24%"
          h="5%"
          style={{ right: '19%', borderRadius: 2, background: INK, opacity: 0.7 }}
        />
        <Eye
          side="left"
          top="42%"
          w="20%"
          h="22%"
          pupilX="26%"
          pupilSize="52%"
          blink="kedip 5.4s ease-in-out infinite"
        />
        <Eye
          side="right"
          top="42%"
          w="20%"
          h="22%"
          pupilX="22%"
          pupilSize="52%"
          blink="kedip 5.4s ease-in-out infinite"
        />
        <Box
          x="47%"
          y="56%"
          w="7%"
          h="12%"
          style={{
            borderRadius: 1,
            background: 'color-mix(in srgb,var(--color-text) 40%,transparent)',
          }}
        />
        {/* the mouth, moving — they are mid-sentence */}
        <Box
          x="38%"
          y="72%"
          w="24%"
          h="12%"
          style={{
            borderRadius: '40%',
            background: INK,
            transformOrigin: 'center top',
            animation: 'bicara .62s ease-in-out infinite',
          }}
        />
      </Box>
    </div>
  </div>
)

/** Dito, sitting and listening. */
const Dito = () => (
  <div
    style={{
      position: 'absolute',
      left: 760,
      bottom: 74,
      width: 0,
      height: 0,
      transform: 'scale(2.4)',
      transformOrigin: 'bottom center',
    }}
  >
    <div
      style={{
        position: 'absolute',
        left: -15,
        bottom: 0,
        width: 30,
        height: 66,
        animation: 'bob 4.2s ease-in-out infinite -1s',
      }}
    >
      <Box
        x={2}
        y={20}
        w={26}
        h={28}
        style={{ borderRadius: '5px 5px 3px 3px', background: 'var(--color-accent-400)' }}
      />
      <Box
        x={5}
        y={0}
        w={20}
        h={20}
        style={{
          borderRadius: '50%',
          background: 'var(--color-neutral-200)',
          border: `2.5px solid ${INK}`,
          transform: 'rotate(-8deg)',
        }}
      >
        <Box
          x="-9%"
          y="-17%"
          w="118%"
          h="48%"
          style={{ borderRadius: '52% 52% 8% 8%', background: 'var(--color-neutral-900)' }}
        />
        <Box
          x="20%"
          y="31%"
          w="23%"
          h="5%"
          style={{ borderRadius: 2, background: INK, opacity: 0.7 }}
        />
        <Box
          y="31%"
          w="23%"
          h="5%"
          style={{ right: '20%', borderRadius: 2, background: INK, opacity: 0.7 }}
        />
        <Box
          y="43%"
          w="19%"
          h="21%"
          style={{
            left: '20%',
            borderRadius: '50%',
            background: 'var(--color-neutral-100)',
            border: `1.2px solid ${INK}`,
            overflow: 'hidden',
            animation: 'kedip 4.1s ease-in-out infinite',
          }}
        >
          <Box x="18%" y="28%" w="54%" h="54%" style={{ borderRadius: '50%', background: INK }} />
        </Box>
        <Box
          y="43%"
          w="19%"
          h="21%"
          style={{
            right: '20%',
            borderRadius: '50%',
            background: 'var(--color-neutral-100)',
            border: `1.2px solid ${INK}`,
            overflow: 'hidden',
            animation: 'kedip 4.1s ease-in-out infinite',
          }}
        >
          <Box x="14%" y="28%" w="54%" h="54%" style={{ borderRadius: '50%', background: INK }} />
        </Box>
        <Box
          x="47%"
          y="57%"
          w="7%"
          h="11%"
          style={{
            borderRadius: 1,
            background: 'color-mix(in srgb,var(--color-text) 40%,transparent)',
          }}
        />
        <Box
          x="34%"
          y="74%"
          w="32%"
          h="11%"
          style={{ borderBottom: `1.4px solid ${INK}`, borderRadius: '0 0 80% 80%' }}
        />
      </Box>
      <Box
        x={25}
        y={24}
        w={7}
        h={22}
        style={{
          borderRadius: 4,
          background: 'var(--color-accent-400)',
          transform: 'rotate(-16deg)',
          transformOrigin: 'top center',
        }}
      />
      <Box
        x={-3}
        y={24}
        w={7}
        h={22}
        style={{
          borderRadius: 4,
          background: 'var(--color-accent-400)',
          transform: 'rotate(14deg)',
          transformOrigin: 'top center',
        }}
      />
      <Box x={5} y={47} w={8} h={19} style={{ background: 'var(--color-neutral-900)' }} />
      <Box x={17} y={47} w={8} h={19} style={{ background: 'var(--color-neutral-900)' }} />
    </div>
  </div>
)

/**
 * Between phases the village drops away and the game becomes a two-shot: one adult
 * talking Dito through what just happened. It is where the teaching lands.
 */
export const ReflectionScene = ({ screen }: { screen: 'recap1' | 'recap2' | 'recap3' }) => {
  const scene = RECAP_SCENES[screen]

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: scene.background,
        animation: 'fadeIn .7s ease',
        overflow: 'hidden',
      }}
    >
      {scene.backdrop === 'posko' ? <PoskoBackdrop /> : <HomeBackdrop />}

      <Box x={0} w={1280} h={150} style={{ bottom: 0, background: scene.floor }} />
      <Box x={0} w={1280} h={3} style={{ bottom: 148, background: 'var(--color-neutral-600)' }} />
      <Box
        x={300}
        w={680}
        h={22}
        style={{
          bottom: 60,
          borderRadius: 4,
          background: 'var(--color-process-yellow)',
          opacity: 0.75,
        }}
      />

      {/* the lantern, and the pool of light it throws */}
      <Box x={scene.lanternX} w={44} h={60} style={{ bottom: 82 }}>
        <Box
          x={6}
          y={10}
          w={32}
          h={44}
          style={{
            borderRadius: 6,
            background: 'var(--color-process-yellow)',
            animation: 'lantern 2.6s ease-in-out infinite',
          }}
        />
        <Box
          x={14}
          y={0}
          w={16}
          h={12}
          style={{
            border: '3px solid var(--color-neutral-800)',
            borderBottom: 0,
            borderRadius: '8px 8px 0 0',
          }}
        />
        <Box
          x={-90}
          y={-50}
          w={224}
          h={224}
          style={{
            borderRadius: '50%',
            background:
              'radial-gradient(circle,color-mix(in srgb,var(--color-process-yellow) 45%,transparent),transparent 70%)',
            animation: 'lantern 2.6s ease-in-out infinite',
          }}
        />
      </Box>

      <Speaker scene={scene} who={screen} />
      <Dito />

      <Box
        x={36}
        y={22}
        style={{
          fontSize: 'var(--fs-meta)',
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          color: 'var(--color-neutral-100)',
          opacity: 0.85,
        }}
      >
        {scene.kicker} · {scene.speaker} berbicara pada Dito
      </Box>

      {/* newsprint halftone over the whole reflection */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage:
            'radial-gradient(color-mix(in srgb,var(--color-text) 55%,transparent) .6px,transparent .85px)',
          backgroundSize: '4px 4px',
          opacity: 0.13,
          mixBlendMode: 'multiply',
        }}
      />
    </div>
  )
}
