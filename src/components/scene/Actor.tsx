import type { ActorSprite } from '@/scene/actors'

import { Box } from './Box'

const INK = 'var(--color-text)'
const SKIN_OUTLINE = `2.5px solid ${INK}`

/** Eyes, mouth, and the extras that distinguish one villager from another. */
const Face = ({ a }: { a: ActorSprite }) => (
  <>
    {a.hairStyle === 'pendek' && (
      <Box
        x="-9%"
        y="-17%"
        w="118%"
        h="50%"
        style={{ borderRadius: '52% 52% 8% 8%', background: a.hair }}
      />
    )}
    {a.hairStyle === 'sanggul' && (
      <>
        <Box
          x="-9%"
          y="-17%"
          w="118%"
          h="46%"
          style={{ borderRadius: '54% 54% 10% 10%', background: a.hair }}
        />
        <Box
          y="-2%"
          w="42%"
          h="42%"
          style={{ right: '-20%', borderRadius: '50%', background: a.hair }}
        />
      </>
    )}
    {a.hairStyle === 'panjang' && (
      <>
        <Box
          x="-9%"
          y="-17%"
          w="118%"
          h="46%"
          style={{ borderRadius: '54% 54% 10% 10%', background: a.hair }}
        />
        <Box x="-13%" y="10%" w="24%" h="92%" style={{ borderRadius: 3, background: a.hair }} />
        <Box
          y="10%"
          w="24%"
          h="92%"
          style={{ right: '-13%', borderRadius: 3, background: a.hair }}
        />
      </>
    )}
    {a.hairStyle === 'peci' && (
      <>
        <Box x="-11%" y="4%" w="122%" h="14%" style={{ background: a.hair }} />
        <Box
          x="-11%"
          y="-30%"
          w="122%"
          h="42%"
          style={{ borderRadius: '4px 4px 2px 2px', background: 'var(--color-neutral-900)' }}
        />
      </>
    )}

    <Box x="20%" y="44%" w="19%" h="22%" style={{ borderRadius: '50%', background: INK }} />
    <Box y="44%" w="19%" h="22%" style={{ right: '20%', borderRadius: '50%', background: INK }} />

    {a.mood === 'tenang' && (
      <Box
        x="31%"
        y="68%"
        w="38%"
        h="15%"
        style={{ borderBottom: `1.5px solid ${INK}`, borderRadius: '0 0 80% 80%' }}
      />
    )}
    {a.mood === 'cemas' && (
      <>
        <Box
          x="33%"
          y="72%"
          w="34%"
          h="12%"
          style={{ borderTop: `1.5px solid ${INK}`, borderRadius: '80% 80% 0 0' }}
        />
        <Box
          x="13%"
          y="33%"
          w="27%"
          h="8%"
          style={{ borderRadius: 2, background: INK, transform: 'rotate(17deg)' }}
        />
        <Box
          y="33%"
          w="27%"
          h="8%"
          style={{ right: '13%', borderRadius: 2, background: INK, transform: 'rotate(-17deg)' }}
        />
      </>
    )}
    {a.mood === 'luka' && (
      <>
        <Box x="36%" y="66%" w="28%" h="19%" style={{ borderRadius: '45%', background: INK }} />
        <Box
          x="6%"
          y="14%"
          w="38%"
          h="11%"
          style={{
            borderRadius: 2,
            background: 'var(--color-accent-2-600)',
            transform: 'rotate(-19deg)',
          }}
        />
      </>
    )}

    {a.moustache ? (
      <Box x="30%" y="62%" w="40%" h="9%" style={{ borderRadius: 2, background: a.hair }} />
    ) : null}
    {a.glasses ? (
      <>
        <Box
          x="11%"
          y="38%"
          w="33%"
          h="33%"
          style={{ border: `1.5px solid ${INK}`, borderRadius: '50%' }}
        />
        <Box
          y="38%"
          w="33%"
          h="33%"
          style={{ right: '11%', border: `1.5px solid ${INK}`, borderRadius: '50%' }}
        />
        <Box x="43%" y="52%" w="14%" h="1.5px" style={{ background: INK }} />
      </>
    ) : null}
    {a.wrinkles ? (
      <>
        <Box
          x="15%"
          y="80%"
          w="20%"
          h="1.5px"
          style={{ background: 'color-mix(in srgb,var(--color-text) 42%,transparent)' }}
        />
        <Box
          y="80%"
          w="20%"
          h="1.5px"
          style={{
            right: '15%',
            background: 'color-mix(in srgb,var(--color-text) 42%,transparent)',
          }}
        />
      </>
    ) : null}
  </>
)

/** A villager standing on solid ground. */
const Standing = ({ a }: { a: ActorSprite }) => (
  <div
    style={{
      position: 'absolute',
      left: -15,
      bottom: 0,
      width: 30,
      height: 66,
      transformOrigin: 'bottom center',
      animation: a.bodyAnim,
    }}
  >
    {[a.legs.leftX, a.legs.rightX].map((x, i) => (
      <Box
        key={`leg-${i}`}
        x={x}
        y={a.legs.top}
        w={a.legs.w}
        h={a.legs.h}
        style={{ background: a.pants }}
      />
    ))}
    {[a.legs.leftX, a.legs.rightX].map((x, i) => (
      <Box
        key={`foot-${i}`}
        x={x}
        y={62}
        w={a.legs.w}
        h={4}
        style={{ borderRadius: '2px 2px 1px 1px', background: 'var(--color-neutral-900)' }}
      />
    ))}

    {a.skirt.on ? (
      <Box
        x={a.skirt.x}
        y={a.skirt.top}
        w={a.skirt.w}
        h={a.skirt.h}
        style={{
          background: a.skirt.color,
          clipPath: 'polygon(16% 0,84% 0,100% 100%,0 100%)',
        }}
      />
    ) : null}

    <Box
      x={a.torso.x}
      y={a.torso.y}
      w={a.torso.w}
      h={a.torso.h}
      style={{ borderRadius: '5px 5px 3px 3px', background: a.shirt }}
    />
    {/* Only the near arm gestures; the far one hangs still. */}
    <Box
      x={a.arms.leftX}
      y={a.arms.top}
      w={a.arms.w}
      h={a.arms.h}
      style={{
        borderRadius: 4,
        background: a.shirt,
        transformOrigin: 'top center',
        animation: a.armAnim,
      }}
    />
    <Box
      x={a.arms.rightX}
      y={a.arms.top}
      w={a.arms.w}
      h={a.arms.h}
      style={{ borderRadius: 4, background: a.shirt, transformOrigin: 'top center' }}
    />

    <Box
      x={a.head.x}
      y={0}
      w={a.head.size}
      h={a.head.size}
      style={{ borderRadius: '50%', background: a.skin, border: SKIN_OUTLINE }}
    >
      <Face a={a} />
    </Box>
  </div>
)

/** A villager caught in the current — only head and flailing arms above water. */
const Drowning = ({ a }: { a: ActorSprite }) => (
  <div
    style={{
      position: 'absolute',
      left: -34,
      bottom: -2,
      width: 68,
      height: 80,
      animation: 'tenggelam 2.4s ease-in-out infinite',
    }}
  >
    {[
      { color: 'var(--color-accent-300)', anim: 'ripple2 2.1s ease-out infinite' },
      { color: 'var(--color-accent-200)', anim: 'ripple2 2.1s ease-out infinite -1.05s' },
    ].map((ring) => (
      <Box
        key={ring.anim}
        x={6}
        w={56}
        h={16}
        style={{
          bottom: -6,
          top: undefined,
          borderRadius: '50%',
          border: `2px solid ${ring.color}`,
          animation: ring.anim,
        }}
      />
    ))}

    <Box
      x={22}
      w={24}
      h={17}
      style={{ bottom: 1, top: undefined, borderRadius: '7px 7px 2px 2px', background: a.shirt }}
    />
    <Box
      x={16}
      w={7}
      h={31}
      style={{
        bottom: 8,
        top: undefined,
        borderRadius: 4,
        background: a.shirt,
        transformOrigin: 'bottom center',
        animation: 'meronta .82s ease-in-out infinite',
      }}
    />
    <Box
      x={45}
      w={7}
      h={31}
      style={{
        bottom: 8,
        top: undefined,
        borderRadius: 4,
        background: a.shirt,
        transformOrigin: 'bottom center',
        animation: 'meronta2 .7s ease-in-out infinite -.3s',
      }}
    />

    <Box
      x={24}
      w={20}
      h={20}
      style={{
        bottom: 13,
        top: undefined,
        borderRadius: '50%',
        background: 'var(--color-neutral-200)',
        border: SKIN_OUTLINE,
      }}
    >
      <Box x="18%" y="38%" w="20%" h="24%" style={{ borderRadius: '50%', background: INK }} />
      <Box y="38%" w="20%" h="24%" style={{ right: '18%', borderRadius: '50%', background: INK }} />
      <Box x="36%" y="66%" w="28%" h="22%" style={{ borderRadius: '45%', background: INK }} />
    </Box>
    <Box
      x={23}
      w={22}
      h={10}
      style={{ bottom: 26, top: undefined, borderRadius: '11px 11px 0 0', background: a.hair }}
    />

    {[
      { x: 11, bottom: 6, size: 5, anim: 'splash 1.1s ease-out infinite' },
      { x: 53, bottom: 4, size: 4, anim: 'splash 1.35s ease-out infinite -.55s' },
    ].map((drop) => (
      <Box
        key={drop.x}
        x={drop.x}
        w={drop.size}
        h={drop.size}
        style={{
          bottom: drop.bottom,
          top: undefined,
          borderRadius: '50%',
          background: 'var(--color-accent-200)',
          animation: drop.anim,
        }}
      />
    ))}
    <Box
      x={2}
      w={64}
      h={9}
      style={{
        bottom: -4,
        top: undefined,
        borderRadius: '50%',
        background: 'var(--color-accent-400)',
        opacity: 0.55,
      }}
    />
  </div>
)

export const Actor = ({ a }: { a: ActorSprite }) => (
  <div
    style={{
      position: 'absolute',
      left: a.x,
      top: a.y,
      width: 0,
      height: 0,
      transform: `scale(${a.scale})`,
      transformOrigin: 'bottom center',
      transition: 'left 1.4s cubic-bezier(.4,0,.2,1),top 1.4s cubic-bezier(.4,0,.2,1),opacity .6s',
      opacity: a.opacity,
      zIndex: a.zIndex,
    }}
  >
    {a.drowning ? <Drowning a={a} /> : <Standing a={a} />}
    <div
      style={{
        position: 'absolute',
        left: -40,
        bottom: 78,
        width: 80,
        textAlign: 'center',
        // World space, like the map pins — the villagers stand shoulder to shoulder.
        fontSize: 'var(--fs-pin)',
        color: INK,
        background: 'var(--color-bg)',
        padding: '1px 0',
        opacity: a.labelOpacity,
        transition: 'opacity .5s',
      }}
    >
      {a.name}
    </div>
  </div>
)
