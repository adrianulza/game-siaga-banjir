import { useGame } from '@/hooks/useGame'
import { marks, oyen, rescueBoat, waterLayers } from '@/scene/props'

import { Box } from './Box'

const CAT_COLOR = 'color-mix(in oklch,var(--color-process-yellow) 68%,var(--color-accent-2-600))'

/** The moving crest line drawn along the top of any body of water. */
const WaveCrest = ({
  radius,
  size,
  duration,
}: {
  radius: number
  size: string
  duration: string
}) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      top: -(radius + 1),
      height: (radius + 1) * 2,
      background: `radial-gradient(circle at 12px ${radius + 4}px,var(--color-accent-400) ${radius + 3}px,transparent ${radius + 4}px)`,
      backgroundSize: size,
      animation: `waveslide ${duration} linear infinite`,
    }}
  />
)

/**
 * The river is cut below the village as a trapezoidal channel with a levee on the
 * crest, so the water surface widens as the level rises — the same shape a real
 * cross-section drawing would use.
 */
export const River = () => {
  const { state, config } = useGame()
  const water = waterLayers(state, config)
  const mark = marks(state)
  const boat = rescueBoat(state)
  const cat = oyen(state)

  return (
    <>
      {/* the channel and its wetted perimeter */}
      <div
        style={{
          position: 'absolute',
          left: 1900,
          top: 460,
          width: 800,
          height: 440,
          clipPath:
            'polygon(0% 36.36%,11.25% 12.73%,30% 12.73%,43.75% 59.09%,56.25% 59.09%,68.75% 6.82%,100% 6.82%,100% 100%,0% 100%)',
          background: 'var(--color-neutral-500)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 1900,
          top: 460,
          width: 800,
          height: 440,
          clipPath:
            'polygon(30% 12.73%,43.75% 59.09%,56.25% 59.09%,68.75% 6.82%,67.5% 6.82%,55.625% 57.05%,44.375% 57.05%,31.375% 12.73%)',
          background: 'var(--color-neutral-600)',
        }}
      />

      {/* the water body, clipped to the trapezoid */}
      <div
        style={{
          position: 'absolute',
          left: 2140,
          top: 510,
          width: 310,
          height: 215,
          clipPath: 'polygon(0 0,97.2% 0,67.74% 97.67%,35.48% 97.67%)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            top: water.riverTop,
            background:
              'linear-gradient(to bottom,var(--color-accent-500),var(--color-accent-600))',
            transition: 'top 2.2s cubic-bezier(.4,0,.2,1)',
          }}
        >
          <WaveCrest radius={5} size="24px 12px" duration="1.1s" />
          <Box
            x={36}
            y={16}
            w={96}
            h={3}
            style={{
              borderRadius: 2,
              background: 'var(--color-accent-200)',
              opacity: 0.6,
              animation: 'debris 9s linear infinite',
            }}
          />
          <Box
            x={158}
            y={34}
            w={64}
            h={3}
            style={{
              borderRadius: 2,
              background: 'var(--color-accent-200)',
              opacity: 0.55,
              animation: 'debris 12s linear infinite -5s',
            }}
          />
        </div>
      </div>

      {/* crest road along the tanggul */}
      <Box x={1990} y={514} w={150} h={10} style={{ background: 'var(--color-neutral-700)' }} />

      {/* papan duga air — the staff gauge, with its yellow and red marks */}
      <Box
        x={2258}
        y={514}
        w={15}
        h={206}
        style={{
          background: 'var(--color-neutral-100)',
          border: '2px solid var(--color-neutral-800)',
        }}
      >
        <Box y={12} h={4} style={{ left: 0, right: 0, background: 'var(--color-accent-2-600)' }} />
        <Box
          y={82}
          h={4}
          style={{ left: 0, right: 0, background: 'var(--color-process-yellow)' }}
        />
        {[32, 52, 112, 142, 172].map((y) => (
          <Box key={y} x={0} y={y} w={6} h={3} style={{ background: 'var(--color-neutral-700)' }} />
        ))}
      </Box>

      {/* sandbags stacked on the levee */}
      {mark.sandbags ? (
        <Box x={1994} y={490} w={145} h={26} style={{ animation: 'fadeIn .7s ease' }}>
          {[0, 37, 74, 111].map((x) => (
            <Box
              key={`low-${x}`}
              x={x}
              y={12}
              w={34}
              h={14}
              style={{ borderRadius: 7, background: 'var(--color-neutral-600)' }}
            />
          ))}
          {[18, 55, 92].map((x) => (
            <Box
              key={`high-${x}`}
              x={x}
              y={0}
              w={34}
              h={14}
              style={{ borderRadius: 7, background: 'var(--color-neutral-700)' }}
            />
          ))}
        </Box>
      ) : null}

      {/* water topping the levee and sheeting down the village side */}
      <div
        style={{
          position: 'absolute',
          left: 1900,
          top: 514,
          width: 240,
          height: 106,
          clipPath: 'polygon(37.5% 0,100% 0,100% 100%,0 100%)',
          opacity: water.spillOpacity,
          transition: 'opacity 1.4s',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: water.spillHeight,
            background:
              'linear-gradient(to bottom,var(--color-accent-400),var(--color-accent-500))',
            backgroundSize: '100% 90px',
            animation: 'spill .6s linear infinite',
            transition: 'height 2s',
          }}
        />
      </div>

      {/* across the channel: high ground and the assembly point */}
      <Box x={2450} y={490} w={250} h={4} style={{ background: 'var(--color-neutral-600)' }} />
      <Box x={2500} y={392} w={200} h={70}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 112,
            height: 64,
            clipPath: 'polygon(50% 0,100% 100%,0 100%)',
            background: 'var(--color-accent-700)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 104,
            top: 16,
            width: 96,
            height: 48,
            clipPath: 'polygon(50% 0,100% 100%,0 100%)',
            background: 'var(--color-accent-2-700)',
          }}
        />
      </Box>
      <Box x={2484} y={380} w={5} h={110} style={{ background: 'var(--color-neutral-800)' }} />
      <Box
        x={2470}
        y={356}
        w={112}
        h={24}
        style={{
          background: 'var(--color-neutral-100)',
          border: '2px solid var(--color-accent-2-700)',
          font: '600 12px/20px var(--font-heading)',
          color: 'var(--color-accent-2-700)',
          textAlign: 'center',
          letterSpacing: '.04em',
        }}
      >
        TITIK KUMPUL
      </Box>

      {/* the flood standing across the village */}
      <div
        style={{
          position: 'absolute',
          left: 180,
          width: 1780,
          top: water.floodTop,
          height: 420,
          background:
            'linear-gradient(to bottom,color-mix(in srgb,var(--color-accent-500) 86%,var(--color-neutral-700)),var(--color-accent-700))',
          opacity: water.floodOpacity,
          transition: 'top 2.4s cubic-bezier(.4,0,.2,1),opacity 1.2s',
        }}
      >
        <WaveCrest radius={6} size="24px 14px" duration=".9s" />
        <Box
          x={120}
          y={18}
          w={120}
          h={10}
          style={{
            borderRadius: 4,
            background: 'var(--color-neutral-700)',
            opacity: 0.6,
            animation: 'debris 11s linear infinite',
          }}
        />
        <Box
          x={760}
          y={40}
          w={70}
          h={8}
          style={{
            borderRadius: 4,
            background: 'var(--color-neutral-800)',
            opacity: 0.55,
            animation: 'debris 15s linear infinite -6s',
          }}
        />
      </div>

      {/* the RT team's rubber boat */}
      <Box
        x={boat.x}
        y={boat.y}
        w={190}
        h={52}
        style={{
          opacity: boat.opacity,
          transition: 'left 1.6s cubic-bezier(.4,0,.2,1),top 2.2s,opacity .8s',
          animation: 'boat 3s ease-in-out infinite',
        }}
      >
        <Box
          x={0}
          y={18}
          w={190}
          h={26}
          style={{ borderRadius: 14, background: 'var(--color-neutral-800)' }}
        />
        <Box
          x={14}
          y={12}
          w={162}
          h={14}
          style={{ borderRadius: 8, background: 'var(--color-neutral-600)' }}
        />
        <Box
          x={150}
          y={-24}
          w={5}
          h={44}
          style={{ background: 'var(--color-neutral-700)', transform: 'rotate(24deg)' }}
        />
      </Box>

      {/* Oyen the cat */}
      <Box
        x={cat.x}
        y={cat.y}
        w={34}
        h={24}
        style={{
          opacity: cat.opacity,
          transition: 'left 1.4s,top 1.4s',
          animation: cat.animation,
        }}
      >
        <Box x={2} y={8} w={26} h={14} style={{ borderRadius: 8, background: CAT_COLOR }} />
        <Box x={20} y={0} w={14} h={14} style={{ borderRadius: '50%', background: CAT_COLOR }} />
        {[21, 29].map((x) => (
          <Box
            key={x}
            x={x}
            y={-4}
            w={5}
            h={6}
            style={{ clipPath: 'polygon(50% 0,100% 100%,0 100%)', background: CAT_COLOR }}
          />
        ))}
        <Box
          x={-6}
          y={2}
          w={12}
          h={4}
          style={{
            borderRadius: 3,
            background: CAT_COLOR,
            transformOrigin: 'right center',
            animation: 'sway3 1.4s ease-in-out infinite',
          }}
        />
      </Box>
    </>
  )
}
