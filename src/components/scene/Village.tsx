import { useGame } from '@/hooks/useGame'
import { floor2Occupied, kentonganSignal, landslide, marks } from '@/scene/props'
import { weatherLevel } from '@/scene/weather'

import { Box, Tree } from './Box'

const FADE_IN = 'fadeIn .6s ease'
const ROOF_DARK = 'var(--color-neutral-800)'

/** Lit windows go dark at the height of the storm, when the power fails. */
const useWindowColor = () => {
  const { state, config } = useGame()
  return weatherLevel(state, config) >= 3
    ? 'var(--color-neutral-800)'
    : 'var(--color-process-yellow)'
}

const Window = ({ x, y, w, h }: { x: number; y: number; w: number; h: number }) => (
  <Box
    x={x}
    y={y}
    w={w}
    h={h}
    style={{ background: useWindowColor(), transition: 'background 2s' }}
  />
)

// ----------------------------------------------------------------- slope ----

const Slope = () => {
  const { state } = useGame()
  const slide = landslide(state)
  const mark = marks(state)
  const slopeBase = { left: -40, top: 150, width: 700, height: 520 } as const

  return (
    <>
      <div
        style={{
          position: 'absolute',
          ...slopeBase,
          clipPath: 'polygon(0 0,100% 88%,100% 100%,0 100%)',
          background: 'var(--color-neutral-500)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          ...slopeBase,
          clipPath: 'polygon(0 0,100% 88%,100% 92%,0 6%)',
          background: 'var(--color-neutral-600)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          ...slopeBase,
          clipPath: 'polygon(30% 26%,62% 46%,62% 54%,30% 34%)',
          background: 'var(--color-neutral-400)',
          opacity: 0.8,
        }}
      />
      <Box
        x={56}
        y={330}
        w={170}
        h={52}
        style={{ borderRadius: '50%', background: 'var(--color-neutral-400)', opacity: 0.55 }}
      />
      <Box
        x={238}
        y={452}
        w={200}
        h={58}
        style={{ borderRadius: '50%', background: 'var(--color-neutral-400)', opacity: 0.45 }}
      />

      <Tree
        x={96}
        y={288}
        trunkW={9}
        trunkH={86}
        canopy={56}
        canopyBottom={70}
        transform={slide.treeTransform}
        transition="transform 1.6s cubic-bezier(.6,0,.9,.4)"
        trunkColor="var(--color-neutral-900)"
        canopyColor="var(--color-neutral-700)"
      />
      <Tree
        x={232}
        y={380}
        trunkW={10}
        trunkH={96}
        canopy={64}
        canopyBottom={78}
        transform={slide.treeTransform}
        transition="transform 1.9s cubic-bezier(.6,0,.9,.4)"
        trunkColor="var(--color-neutral-900)"
        canopyColor="var(--color-neutral-700)"
      />
      <Tree
        x={344}
        y={446}
        trunkW={9}
        trunkH={80}
        canopy={52}
        canopyBottom={64}
        transform={slide.treeTransform}
        transition="transform 2.2s cubic-bezier(.6,0,.9,.4)"
        trunkColor="var(--color-neutral-900)"
        canopyColor="var(--color-neutral-700)"
      />

      {/* jalan pintas — the shortcut across the slope the game warns against */}
      <Box
        x={80}
        y={322}
        w={430}
        h={170}
        style={{
          borderTop: '3px dashed var(--color-neutral-300)',
          transform: 'rotate(17deg)',
          transformOrigin: '0 0',
          opacity: 0.85,
        }}
      />

      {/* cracks: a warning before the slide, a scar after it */}
      <Box
        x={150}
        y={270}
        w={200}
        h={120}
        style={{ opacity: slide.crackOpacity, transition: 'opacity 1.4s' }}
      >
        {[
          { x: 0, y: 0, h: 82, rotate: 24, dur: '.9s' },
          { x: 54, y: 22, h: 64, rotate: -14, dur: '1.1s' },
          { x: 104, y: 6, h: 96, rotate: 31, dur: '1.3s' },
        ].map((crack) => (
          <Box
            key={crack.x}
            x={crack.x}
            y={crack.y}
            w={3}
            h={crack.h}
            style={{
              background: 'var(--color-neutral-900)',
              transform: `rotate(${crack.rotate}deg)`,
              transformOrigin: 'top center',
              animation: `grow ${crack.dur} ease-out`,
            }}
          />
        ))}
      </Box>

      {/* the landslide mass itself */}
      <div
        style={{
          position: 'absolute',
          left: 120,
          top: 250,
          width: 330,
          height: 230,
          clipPath: 'polygon(28% 0,100% 46%,100% 100%,6% 100%)',
          background: ROOF_DARK,
          transform: slide.transform,
          opacity: slide.opacity,
          transition: 'transform 2.1s cubic-bezier(.55,0,.9,.45),opacity .5s',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 120,
          top: 250,
          width: 330,
          height: 230,
          clipPath: 'polygon(28% 0,100% 46%,100% 54%,20% 12%)',
          background: 'var(--color-neutral-900)',
          transform: slide.transform,
          opacity: slide.opacity,
          transition: 'transform 2.1s cubic-bezier(.55,0,.9,.45),opacity .5s',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 300,
          top: 540,
          width: 340,
          height: 120,
          clipPath: 'polygon(0 100%,26% 22%,64% 6%,100% 62%,100% 100%)',
          background: ROOF_DARK,
          opacity: slide.opacity,
          transition: 'opacity 1.6s',
        }}
      />

      {/* replanted slope: vetiver and saplings, plus a hazard sign */}
      {mark.replanted ? (
        <Box x={130} y={330} w={380} h={180} style={{ animation: 'fadeIn .8s ease' }}>
          {[
            { x: 20, y: 36 },
            { x: 96, y: 76 },
            { x: 176, y: 112 },
            { x: 252, y: 146 },
          ].map((s) => (
            <Box
              key={s.x}
              x={s.x}
              y={s.y}
              w={8}
              h={34}
              style={{ background: 'var(--color-accent-700)', transform: 'rotate(12deg)' }}
            />
          ))}
          <Box x={296} y={60} w={6} h={60} style={{ background: ROOF_DARK }} />
          <Box x={274} y={44} w={52} h={20} style={{ background: 'var(--color-accent-2-600)' }} />
        </Box>
      ) : null}
    </>
  )
}

// ---------------------------------------------------------------- houses ----

const NenekHouse = () => {
  const { state } = useGame()
  const mark = marks(state)
  return (
    <Box x={400} y={472} w={150} h={148}>
      <div
        style={{
          position: 'absolute',
          left: -14,
          top: 0,
          width: 178,
          height: 52,
          clipPath: 'polygon(0 100%,50% 0,100% 100%)',
          background: ROOF_DARK,
        }}
      />
      <Box x={0} y={52} w={150} h={96} style={{ background: 'var(--color-neutral-100)' }} />
      <Box x={58} y={96} w={30} h={52} style={{ background: 'var(--color-accent-700)' }} />
      <Window x={14} y={70} w={26} h={24} />
      <Window x={108} y={70} w={26} h={24} />
      {mark.catCarrier ? (
        <Box
          x={104}
          y={120}
          w={36}
          h={28}
          style={{
            background: 'var(--color-neutral-300)',
            border: '2px solid var(--color-neutral-700)',
            animation: FADE_IN,
          }}
        />
      ) : null}
    </Box>
  )
}

const PlayerHouse = () => {
  const { state } = useGame()
  const mark = marks(state)
  const floor2 = floor2Occupied(state)

  return (
    <Box x={740} y={384} w={210} h={236}>
      <div
        style={{
          position: 'absolute',
          left: -22,
          top: 0,
          width: 254,
          height: 64,
          clipPath: 'polygon(0 100%,34% 0,66% 0,100% 100%)',
          background: ROOF_DARK,
        }}
      />
      <Box x={0} y={64} w={210} h={3} style={{ background: 'var(--color-neutral-400)' }} />
      <Box x={0} y={64} w={210} h={56} style={{ background: 'var(--color-neutral-100)' }} />
      <Window x={62} y={76} w={86} h={32} />
      <Box x={0} y={120} w={210} h={3} style={{ background: 'var(--color-neutral-400)' }} />
      <Box x={0} y={120} w={210} h={116} style={{ background: 'var(--color-neutral-100)' }} />
      <Box x={86} y={174} w={38} h={62} style={{ background: 'var(--color-accent-700)' }} />
      <Window x={18} y={142} w={34} h={30} />
      <Window x={158} y={142} w={34} h={30} />

      {/* the go-bag, packed and waiting by the door */}
      {mark.bag ? (
        <Box
          x={132}
          y={182}
          w={22}
          h={28}
          style={{
            borderRadius: '4px 4px 6px 6px',
            background: 'var(--color-accent-2-600)',
            animation: FADE_IN,
          }}
        >
          <Box
            x={4}
            y={-5}
            w={14}
            h={8}
            style={{
              border: '2px solid var(--color-accent-2-600)',
              borderBottom: 0,
              borderRadius: '6px 6px 0 0',
            }}
          />
        </Box>
      ) : null}

      {/* the family sheltering on lantai 2, seen through the window */}
      {floor2 ? (
        <Box x={66} y={80} w={78} h={24} style={{ animation: 'fadeIn .7s ease' }}>
          <Box
            x={0}
            y={7}
            w={13}
            h={13}
            style={{ borderRadius: '50%', background: 'var(--color-neutral-900)' }}
          />
          <Box
            x={30}
            y={2}
            w={14}
            h={14}
            style={{ borderRadius: '50%', background: 'var(--color-neutral-900)' }}
          />
          <Box
            x={58}
            y={9}
            w={12}
            h={12}
            style={{
              borderRadius: '50%',
              background: 'var(--color-neutral-900)',
              animation: 'panik 1.2s ease-in-out infinite',
            }}
          />
        </Box>
      ) : null}

      {mark.electronics ? (
        <Box
          x={150}
          y={88}
          w={44}
          h={18}
          style={{ background: 'var(--color-neutral-700)', animation: FADE_IN }}
        />
      ) : null}

      {/* washing hung out to dry once the flood has passed */}
      {mark.laundry ? (
        <Box x={216} y={152} w={130} h={40} style={{ animation: 'fadeIn .8s ease' }}>
          <Box x={0} y={0} w={130} h={2} style={{ background: 'var(--color-neutral-600)' }} />
          {[
            {
              x: 12,
              w: 24,
              h: 30,
              bg: 'var(--color-accent-300)',
              anim: 'sway2 3s ease-in-out infinite',
            },
            {
              x: 52,
              w: 20,
              h: 26,
              bg: 'var(--color-accent-2-300)',
              anim: 'sway2 3.6s ease-in-out infinite -1s',
            },
            {
              x: 88,
              w: 26,
              h: 32,
              bg: 'var(--color-neutral-200)',
              anim: 'sway2 4.2s ease-in-out infinite -2s',
            },
          ].map((item) => (
            <Box
              key={item.x}
              x={item.x}
              y={2}
              w={item.w}
              h={item.h}
              style={{ background: item.bg, transformOrigin: 'top center', animation: item.anim }}
            />
          ))}
        </Box>
      ) : null}
    </Box>
  )
}

const DartoHouse = () => {
  const { state } = useGame()
  const mark = marks(state)
  return (
    <Box x={1180} y={470} w={170} h={150}>
      <div
        style={{
          position: 'absolute',
          left: -18,
          top: 0,
          width: 206,
          height: 56,
          clipPath: 'polygon(0 100%,50% 0,100% 100%)',
          background: 'var(--color-neutral-700)',
        }}
      />
      <Box x={0} y={56} w={170} h={94} style={{ background: 'var(--color-neutral-200)' }} />
      <Box x={66} y={98} w={34} h={52} style={{ background: 'var(--color-accent-2-700)' }} />
      <Window x={16} y={74} w={30} h={26} />
      <Window x={124} y={74} w={30} h={26} />
      {/* smoke from the kitchen: the household is back on its feet */}
      {mark.dartoHelped ? (
        <Box
          x={-6}
          y={-30}
          w={40}
          h={30}
          style={{
            animation: 'smoke 4s ease-out infinite',
            background: 'var(--color-neutral-400)',
            borderRadius: '50%',
            opacity: 0.5,
          }}
        />
      ) : null}
    </Box>
  )
}

const BalaiWarga = ({ flagAnim }: { flagAnim: string }) => {
  const { state } = useGame()
  const mark = marks(state)
  return (
    <Box x={1520} y={430} w={290} h={190}>
      <div
        style={{
          position: 'absolute',
          left: -24,
          top: 0,
          width: 338,
          height: 58,
          clipPath: 'polygon(0 100%,50% 0,100% 100%)',
          background: 'var(--color-accent-700)',
        }}
      />
      <Box x={0} y={58} w={290} h={132} style={{ background: 'var(--color-neutral-100)' }} />
      <Box x={118} y={126} w={54} h={64} style={{ background: ROOF_DARK }} />
      <Window x={26} y={82} w={36} h={30} />
      <Window x={228} y={82} w={36} h={30} />

      {/* the evacuation map, pinned up after the siaga meeting */}
      {mark.evacuationMap ? (
        <Box
          x={186}
          y={80}
          w={56}
          h={38}
          style={{
            background: 'var(--color-neutral-200)',
            border: '2px solid var(--color-accent-700)',
            animation: FADE_IN,
          }}
        >
          <Box x={6} y={14} w={40} h={2} style={{ background: 'var(--color-accent-2-600)' }} />
          <Box x={34} y={6} w={2} h={22} style={{ background: 'var(--color-accent-700)' }} />
        </Box>
      ) : null}

      <Box x={8} y={-92} w={5} h={92} style={{ background: ROOF_DARK }} />
      <Box
        x={13}
        y={-88}
        w={44}
        h={28}
        style={{
          background: 'var(--color-accent-2)',
          transformOrigin: 'left center',
          animation: flagAnim,
        }}
      />
    </Box>
  )
}

/** The bamboo slit drum. Struck in a rapid roll, it means danger. */
const Kentongan = () => {
  const { state } = useGame()
  const signal = kentonganSignal(state)
  const ring = {
    borderRadius: '50%',
    border: '3px solid var(--color-accent-2)',
    opacity: 0,
  } as const

  return (
    <Box x={1466} y={520} w={40} h={100}>
      <Box x={16} y={34} w={6} h={66} style={{ background: ROOF_DARK }} />
      <Box
        x={2}
        y={6}
        w={34}
        h={34}
        style={{
          borderRadius: 5,
          background: 'var(--color-neutral-700)',
          animation: signal.animation,
        }}
      />
      <Box x={-42} y={-16} w={120} h={120} style={{ ...ring, animation: signal.ring1 }} />
      <Box x={-42} y={-16} w={120} h={120} style={{ ...ring, animation: signal.ring2 }} />
    </Box>
  )
}

// ---------------------------------------------------------------- ground ----

const GroundStrip = ({ x, w }: { x: number; w: number }) => (
  <>
    <Box x={x} y={620} w={w} h={280} style={{ background: 'var(--color-neutral-300)' }} />
    <Box x={x} y={620} w={w} h={4} style={{ background: 'var(--color-neutral-500)' }} />
    <Box
      x={x}
      y={672}
      w={w}
      h={26}
      style={{ background: 'var(--color-neutral-400)', opacity: 0.8 }}
    />
  </>
)

/** The whole inhabited side of the world: slope, ground, houses, trees. */
export const Village = ({
  treeAnim1,
  treeAnim2,
  flagAnim,
}: {
  treeAnim1: string
  treeAnim2: string
  flagAnim: string
}) => {
  const { state } = useGame()
  const mark = marks(state)

  return (
    <>
      <Slope />
      <NenekHouse />

      {/* the ground, split around the gap where Nenek's house sits */}
      <GroundStrip x={-500} w={1040} />
      <GroundStrip x={520} w={1420} />

      {/* selokan: silted up by default, running clear once it has been cleaned */}
      <Box x={640} y={640} w={700} h={22} style={{ background: 'var(--color-neutral-500)' }} />
      <Box
        x={640}
        y={640}
        w={700}
        h={22}
        style={{ background: mark.ditchFill, transition: 'background 1s' }}
      />

      <PlayerHouse />

      {/* the well, capped after the flood so nobody drinks from it */}
      <Box x={640} y={576} w={64} h={44}>
        <Box
          x={0}
          y={12}
          w={64}
          h={32}
          style={{ borderRadius: 6, background: 'var(--color-neutral-500)' }}
        />
        <Box
          x={6}
          y={6}
          w={52}
          h={12}
          style={{ borderRadius: 6, background: 'var(--color-neutral-700)' }}
        />
        {mark.well ? (
          <Box
            x={-4}
            y={-2}
            w={72}
            h={12}
            style={{
              borderRadius: 4,
              background: 'var(--color-accent-700)',
              animation: FADE_IN,
            }}
          />
        ) : null}
      </Box>

      {/* the fence Oyen gets stranded on */}
      <Box x={970} y={556} w={150} h={64}>
        <Box x={0} y={14} w={150} h={5} style={{ background: 'var(--color-neutral-700)' }} />
        <Box x={0} y={34} w={150} h={5} style={{ background: 'var(--color-neutral-700)' }} />
        {[4, 70, 138].map((x) => (
          <Box key={x} x={x} y={0} w={7} h={64} style={{ background: ROOF_DARK }} />
        ))}
      </Box>

      <DartoHouse />
      <BalaiWarga flagAnim={flagAnim} />
      <Kentongan />

      <Tree
        x={588}
        y={620}
        trunkW={11}
        trunkH={120}
        canopy={76}
        canopyBottom={96}
        animation={treeAnim1}
      />
      <Tree
        x={1094}
        y={620}
        trunkW={12}
        trunkH={130}
        canopy={88}
        canopyBottom={104}
        animation={treeAnim2}
      />
      <Tree
        x={1416}
        y={620}
        trunkW={10}
        trunkH={112}
        canopy={68}
        canopyBottom={90}
        animation={treeAnim1}
      />
      <Tree
        x={1880}
        y={618}
        trunkW={11}
        trunkH={124}
        canopy={72}
        canopyBottom={98}
        animation={treeAnim2}
      />
    </>
  )
}
