import { describe, expect, it } from 'vitest'

import type { FamilyState } from '@/data/types'
import { createInitialState, type GameState, type ScreenId } from '@/engine/state'
import { DEFAULT_CONFIG } from '@/engine/config'
import { actorsFor, type ActorSprite } from '@/scene/actors'

import fixtures from './fixtures/original-actors.json'

/**
 * The actor layer is ~20 derived numbers per figure. These tests replay the exact
 * states dumped from the original implementation (scripts/dump-actors.mjs) and
 * compare every field, so a transposed offset cannot slip through unnoticed.
 */

interface FixtureState {
  screen: string
  cardIdx: number
  open: string | null
  family: Record<string, string>
}

/** Convert a ported sprite back to the original's flat field names. */
const toLegacy = (a: ActorSprite) => ({
  id: a.id,
  name: a.name,
  x: a.x,
  y: a.y,
  s: a.scale,
  o: a.opacity,
  z: a.zIndex,
  lo: a.labelOpacity,
  shirt: a.shirt,
  hair: a.hair,
  pants: a.pants,
  skin: a.skin,
  hw: a.head.size,
  hx: a.head.x,
  tw: a.torso.w,
  tx: a.torso.x,
  ty: a.torso.y,
  th: a.torso.h,
  legTop: a.legs.top,
  legH: a.legs.h,
  legW: a.legs.w,
  legLx: a.legs.leftX,
  legRx: a.legs.rightX,
  armW: a.arms.w,
  armH: a.arms.h,
  armTop: a.arms.top,
  armLx: a.arms.leftX,
  armRx: a.arms.rightX,
  skirt: a.skirt.on,
  skirtCol: a.skirt.color,
  skirtX: a.skirt.x,
  skirtTop: a.skirt.top,
  skirtW: a.skirt.w,
  skirtH: a.skirt.h,
  rPendek: a.hairStyle === 'pendek',
  rSanggul: a.hairStyle === 'sanggul',
  rPanjang: a.hairStyle === 'panjang',
  rPeci: a.hairStyle === 'peci',
  kumis: a.moustache,
  kacamata: a.glasses,
  kerut: a.wrinkles,
  mTenang: a.mood === 'tenang',
  mCemas: a.mood === 'cemas',
  mLuka: a.mood === 'luka',
  anim: a.bodyAnim,
  arm: a.armAnim,
  drown: a.drowning,
  calm: !a.drowning,
})

const stateFrom = (f: FixtureState): GameState => ({
  ...createInitialState(DEFAULT_CONFIG),
  screen: f.screen as ScreenId,
  cardIndex: f.cardIdx,
  openSpotId: f.open,
  family: f.family as unknown as FamilyState,
})

const cases = fixtures as unknown as Record<
  string,
  { state: FixtureState; actors: Record<string, unknown>[] }
>

/**
 * Content fork: PlayerHouse gained a second floor (lantai 2). During "Jalur
 * evakuasi" (cardIdx 5) and the landslide/late cards (cardIdx 6), the family
 * now waits at the lantai-2 window instead of on the roof ridge, moving their
 * y from 440 (old roof apex) to 492 (the new window's sill). Everything else
 * in these fixtures — x, other actors, moods, animations — is unchanged and
 * must still match the original exactly.
 */
const FLOOR2_Y_OVERRIDE: Record<string, readonly string[]> = {
  'p2-card-5': ['p', 'ibu', 'ayah', 'adik', 'nenek'],
  'p2-card-6': ['p', 'ibu', 'ayah', 'adik', 'nenek'],
  'p2-late': ['p', 'ibu', 'ayah', 'adik', 'nenek'],
}

const withFloor2Override = (name: string, actors: Record<string, unknown>[]) => {
  const ids = FLOOR2_Y_OVERRIDE[name]
  if (!ids) return actors
  return actors.map((a) => (ids.includes(a.id as string) ? { ...a, y: 492 } : a))
}

/**
 * Unrelated to lantai 2: an earlier HUD pass moved everyone waiting at the posko
 * (cardIndex 7) down from y=452 to y=490 to sit against the relaid-out backdrop,
 * without updating this fixture. Only `p2-card-7` reaches `atPosko`.
 */
const POSKO_Y_OVERRIDE = ['p', 'ibu', 'ayah', 'adik', 'nenek', 'rt', 'warga']

const withPoskoOverride = (name: string, actors: Record<string, unknown>[]) => {
  if (name !== 'p2-card-7') return actors
  return actors.map((a) => (POSKO_Y_OVERRIDE.includes(a.id as string) ? { ...a, y: 490 } : a))
}

describe('actor geometry matches the original', () => {
  const names = Object.keys(cases)

  it('covers every screen and every crisis card', () => {
    expect(names.length).toBe(32)
    const total = Object.values(cases).reduce((n, c) => n + c.actors.length, 0)
    expect(total).toBe(211)
  })

  it.each(names)('%s', (name) => {
    const c = cases[name]!
    const ported = actorsFor(stateFrom(c.state)).map(toLegacy)
    expect(ported).toEqual(withPoskoOverride(name, withFloor2Override(name, c.actors)))
  })
})
