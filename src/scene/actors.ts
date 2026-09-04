import { BODY_PROPORTIONS, CAST } from '@/data/cast'
import { FLOOD_HEIGHTS, GROUND_Y } from '@/data/world'
import type { CastId, FamilyMemberId, FamilyState, HairStyle } from '@/data/types'
import type { GameState } from '@/engine/state'

/**
 * The cast is drawn from stacked coloured boxes rather than sprites, so every figure
 * is ~20 derived numbers. This module produces those numbers; the components only
 * position what it returns.
 */

/** Which face the figure wears, derived from how their family member is doing. */
export type FaceMood = 'tenang' | 'cemas' | 'luka'

export interface ActorSprite {
  id: CastId
  name: string
  x: number
  y: number
  scale: number
  opacity: number
  zIndex: number
  /** Opacity of the name label under the figure. */
  labelOpacity: number

  shirt: string
  hair: string
  pants: string
  skin: string

  head: { size: number; x: number }
  torso: { x: number; y: number; w: number; h: number }
  legs: { top: number; h: number; w: number; leftX: number; rightX: number }
  arms: { w: number; h: number; top: number; leftX: number; rightX: number }
  skirt: { on: boolean; color: string; x: number; top: number; w: number; h: number }

  hairStyle: HairStyle
  mood: FaceMood
  moustache: boolean
  glasses: boolean
  wrinkles: boolean

  bodyAnim: string
  armAnim: string
  /** Thrashing in the water rather than standing on ground. */
  drowning: boolean
}

/** Per-placement overrides a screen can apply to a cast member. */
interface Placement {
  s?: number
  o?: number
  z?: number
  lo?: number
  shirt?: string
  hair?: string
  anim?: string
  arm?: string
  drown?: boolean
}

const DEFAULT_ANIM = 'bob 2.6s ease-in-out infinite'

/** Pak Darto is tracked in the family record under the neighbour slot. */
const familySlot = (id: CastId): FamilyMemberId | undefined =>
  id === 'darto' ? 'tetangga' : (id as FamilyMemberId)

const buildActor = (
  family: FamilyState,
  id: CastId,
  name: string,
  x: number,
  y: number,
  o: Placement = {},
): ActorSprite => {
  const cast = CAST[id]
  const prop = BODY_PROPORTIONS[cast.body]

  const headSize = prop.headSize
  const torsoW = prop.torsoW
  const torsoH = prop.torsoH
  const legH = prop.legH

  const torsoY = headSize - 1
  const legTop = torsoY + torsoH
  const legW = Math.round(torsoW * 0.3)
  const armW = Math.max(6, Math.round(torsoW * 0.26))
  // Figures are laid out inside a nominal 30px-wide box and centred in it.
  const torsoX = (30 - torsoW) / 2

  const anim = o.anim ?? DEFAULT_ANIM

  const slot = familySlot(id)
  const status = slot ? family[slot] : 'aman'
  const mood: FaceMood =
    status === 'terluka'
      ? 'luka'
      : status === 'cemas' || status === 'terlambat' || anim.includes('panik')
        ? 'cemas'
        : 'tenang'

  return {
    id,
    name,
    x,
    y,
    // Note: the cast entry always wins over a placement's `s`/`shirt`/`hair`. The
    // original wrote `c.s || o.s || 1.25`, and since every cast entry defines those
    // fields the per-screen overrides never applied. Preserved deliberately.
    scale: cast.scale,
    opacity: o.o ?? 1,
    zIndex: o.z ?? 6,
    labelOpacity: o.lo ?? 0,

    shirt: cast.shirt,
    hair: cast.hair,
    pants: cast.pants ?? (cast.skirt ? 'var(--color-neutral-200)' : 'var(--color-neutral-800)'),
    skin: 'var(--color-neutral-200)',

    head: { size: headSize, x: (30 - headSize) / 2 },
    torso: { x: torsoX, y: torsoY, w: torsoW, h: torsoH },
    legs: { top: legTop, h: legH, w: legW, leftX: 14 - legW, rightX: 16 },
    arms: {
      w: armW,
      h: torsoH - 3,
      top: torsoY + 3,
      leftX: torsoX + torsoW - 2,
      rightX: torsoX - armW + 2,
    },
    skirt: {
      on: Boolean(cast.skirt),
      color: cast.skirtColor ?? cast.shirt,
      x: torsoX - 3,
      top: legTop - 2,
      w: torsoW + 6,
      h: legH - 4,
    },

    hairStyle: cast.hairStyle,
    mood,
    moustache: Boolean(cast.moustache),
    glasses: Boolean(cast.glasses),
    wrinkles: Boolean(cast.wrinkles),

    bodyAnim: anim,
    armAnim: o.arm ?? 'none',
    drowning: Boolean(o.drown),
  }
}

/** Where the player stands on the phase-1 map, depending on the open spot. */
const PHASE1_PLAYER_X: Record<string, number> = {
  nenek: 470,
  sungai: 2060,
  balai: 1640,
  atap: 700,
  dapur: 900,
  radio: 820,
}

/** Where the player stands on the phase-3 map. */
const PHASE3_PLAYER_X: Record<string, number> = {
  lereng: 330,
  posko: 1640,
  darto: 1250,
  air: 680,
  rapat: 900,
}

export const actorsFor = (state: GameState): ActorSprite[] => {
  const f = state.family
  const A = (id: CastId, name: string, x: number, y: number, o?: Placement) =>
    buildActor(f, id, name, x, y, o)

  const hurt = (k: FamilyMemberId) => f[k] === 'terluka'
  const worry = (k: FamilyMemberId) => f[k] === 'cemas'
  const pose = (k: FamilyMemberId) =>
    hurt(k)
      ? 'panik .8s ease-in-out infinite'
      : worry(k)
        ? 'panik 1.1s ease-in-out infinite'
        : 'bob 2.6s ease-in-out infinite'

  const G = GROUND_Y

  switch (state.screen) {
    case 'intro':
      return [
        A('p', 'Kamu', 880, G, { lo: 1, arm: 'wave 1.1s ease-in-out infinite' }),
        A('ibu', 'Ibu', 960, G, { anim: 'bob 3.1s ease-in-out infinite -1s' }),
        A('ayah', 'Ayah', 700, G, { anim: 'bob 2.9s ease-in-out infinite -.5s' }),
        A('adik', 'Dito', 1010, G, { anim: 'bob 2.2s ease-in-out infinite' }),
        A('nenek', 'Nenek', 520, G, { anim: 'lambat 3.4s ease-in-out infinite' }),
        A('darto', 'Pak Darto', 1290, G, { anim: 'bob 3.6s ease-in-out infinite -2s' }),
      ]

    case 'p1': {
      const open = state.openSpotId
      const px = (open === null ? undefined : PHASE1_PLAYER_X[open]) ?? 880
      const py = open === 'nenek' ? 600 : open === 'sungai' ? 540 : G
      return [
        A('p', 'Kamu', px, py, {
          lo: 1,
          z: 8,
          arm: open ? 'gestur 2.4s ease-in-out infinite' : 'wave 1.4s ease-in-out infinite',
        }),
        A('ayah', 'Ayah', 660, G, {
          lo: open === 'atap' ? 1 : 0,
          arm: open === 'atap' ? 'gestur 2s ease-in-out infinite' : 'none',
        }),
        A('ibu', 'Ibu', 960, G, {
          lo: open === 'dapur' ? 1 : 0,
          anim: 'bob 3.1s ease-in-out infinite -1s',
        }),
        A('adik', 'Dito', 1040, G, { anim: 'bob 2.2s ease-in-out infinite' }),
        A('nenek', 'Nenek', 536, G, {
          lo: open === 'nenek' ? 1 : 0,
          anim: 'lambat 3.4s ease-in-out infinite',
        }),
        A('rt', 'Pak RT', 1700, G, {
          lo: open === 'balai' ? 1 : 0,
          arm: 'gestur 3s ease-in-out infinite',
        }),
        A('darto', 'Pak Darto', 1290, G, { anim: 'bob 3.6s ease-in-out infinite -2s' }),
      ]
    }

    case 'p2': {
      const i = state.cardIndex
      // The family moves up as the water rises: ground floor, then the loft (hidden
      // behind the wall), then the roof, then the posko on high ground.
      const inLoft = i >= 2 && i <= 4
      const onRoof = i >= 5 && i <= 6
      const atPosko = i >= 7

      const waterLine = G - (FLOOD_HEIGHTS[i] ?? 0)
      const spread = onRoof ? 0.5 : 1
      const visible = inLoft ? 0 : 1
      const dartoDrowning = i >= 5 && !atPosko

      const bx = atPosko ? 2596 : onRoof ? 845 : 860
      const by = atPosko ? 452 : onRoof ? 440 : G

      return [
        A('p', 'Kamu', bx - 30 * spread, by, {
          o: visible,
          lo: visible,
          z: 9,
          anim: i === 3 ? 'panik 1s ease-in-out infinite' : 'bob 2.2s ease-in-out infinite',
          arm: i === 3 ? 'wave .7s ease-in-out infinite' : 'none',
        }),
        A('ibu', 'Ibu', bx + 34 * spread, by, {
          o: visible,
          lo: i <= 1 ? 1 : 0,
          anim: pose('ibu'),
        }),
        A('ayah', 'Ayah', bx - 72 * spread, by, {
          o: visible,
          lo: i === 6 ? 1 : 0,
          anim: hurt('ayah')
            ? 'panik .8s ease-in-out infinite'
            : 'bob 2.8s ease-in-out infinite -.7s',
          arm: i === 6 ? 'gestur 1.6s ease-in-out infinite' : 'none',
        }),
        A('adik', 'Dito', bx + 68 * spread, by, {
          o: visible,
          anim: worry('adik') ? 'panik .9s ease-in-out infinite' : 'bob 2.1s ease-in-out infinite',
        }),
        A('nenek', 'Nenek', bx - 112 * spread, by, {
          o: visible,
          anim: hurt('nenek')
            ? 'panik 1s ease-in-out infinite'
            : 'lambat 3.2s ease-in-out infinite',
        }),
        A('darto', 'Pak Darto', 1252, dartoDrowning ? waterLine + 5 : G, {
          lo: i >= 4 ? 1 : 0,
          o: atPosko ? 0 : 1,
          drown: dartoDrowning,
          anim: 'panik 1.4s ease-in-out infinite',
          arm: i === 4 ? 'gestur 1.8s ease-in-out infinite' : 'none',
        }),
        A(
          'rt',
          'Tim RT',
          onRoof ? 1052 : atPosko ? 2470 : 1700,
          onRoof ? waterLine + 8 : atPosko ? 452 : G,
          {
            lo: i === 5 ? 1 : 0,
            o: i >= 5 ? 1 : 0,
            arm: 'gestur 2.2s ease-in-out infinite',
          },
        ),
        A('warga', '', atPosko ? 2500 : 1740, atPosko ? 452 : G, {
          o: atPosko ? 0.9 : 0,
          anim: 'bob 3.3s ease-in-out infinite -1.4s',
        }),
      ]
    }

    case 'over': {
      const waterLine = G - 176
      return [
        A('p', 'Kamu', 884, waterLine + 22, { lo: 1, z: 9, drown: true }),
        A('ibu', 'Ibu', 1012, waterLine + 12, { lo: 0, z: 8, drown: true }),
        A('adik', 'Dito', 1088, waterLine + 26, { lo: 1, z: 7, drown: true }),
        A('nenek', 'Nenek', 756, waterLine + 14, { lo: 1, z: 7, drown: true }),
        A('ayah', 'Ayah', 630, waterLine + 28, { lo: 0, z: 6, drown: true }),
        A('darto', 'Pak Darto', 1178, waterLine + 16, { lo: 0, z: 6, drown: true }),
      ]
    }

    case 'p3': {
      const open = state.openSpotId
      const px = (open === null ? undefined : PHASE3_PLAYER_X[open]) ?? 850
      return [
        A('p', 'Kamu', px, open === 'lereng' ? 430 : G, {
          lo: 1,
          z: 8,
          arm: 'gestur 2.6s ease-in-out infinite',
        }),
        A('ayah', 'Ayah', 790, G, {
          lo: open === 'rumah' ? 1 : 0,
          arm: 'gestur 2.2s ease-in-out infinite',
        }),
        A('ibu', 'Ibu', 940, G, { anim: 'bob 3.1s ease-in-out infinite -1s' }),
        A('adik', 'Dito', 700, G, {
          lo: open === 'air' ? 1 : 0,
          anim: 'bob 2.2s ease-in-out infinite',
        }),
        A('nenek', 'Nenek', 560, 600, { anim: 'lambat 3.4s ease-in-out infinite' }),
        A('darto', 'Pak Darto', 1300, G, {
          lo: open === 'darto' ? 1 : 0,
          anim: 'bob 3.6s ease-in-out infinite -2s',
        }),
        A('rt', 'Pak RT', 1700, G, {
          lo: open === 'posko' ? 1 : 0,
          o: open === 'posko' || open === 'lereng' ? 1 : 0.8,
          arm: 'gestur 3s ease-in-out infinite',
        }),
      ]
    }

    case 'end':
      return [
        A('p', 'Kamu', 880, G, { lo: 1, arm: 'wave 1.6s ease-in-out infinite' }),
        A('ibu', 'Ibu', 950, G, { anim: 'bob 3.1s ease-in-out infinite -1s' }),
        A('ayah', 'Ayah', 740, G),
        A('adik', 'Dito', 1000, G),
        A('nenek', 'Nenek', 560, 600, { anim: 'lambat 3.4s ease-in-out infinite' }),
        A('darto', 'Pak Darto', 1290, G),
        A('rt', 'Pak RT', 1690, G, { arm: 'gestur 3s ease-in-out infinite' }),
      ]

    case 'recap1':
    case 'recap2':
    case 'recap3':
      return []
  }
}
