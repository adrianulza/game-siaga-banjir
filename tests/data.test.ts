import { describe, expect, it } from 'vitest'

import original from './fixtures/original-data.json'
import { BODY_PROPORTIONS, CAST, FAMILY_NAMES } from '@/data/cast'
import { PHASE1_SPOTS } from '@/data/phase1-siaga'
import { PHASE2_CARDS } from '@/data/phase2-darurat'
import { PHASE3_SPOTS } from '@/data/phase3-pemulihan'
import { FAMILY_IDS, type CrisisCard, type MapSpot } from '@/data/types'
import { CLOUD_COLOR, FLOOD_HEIGHTS, GROUND_Y, RIVER_FILL, SKY_BOTTOM, SKY_TOP } from '@/data/world'

/**
 * The scenario content was moved out of the original .dc.html by a script that
 * expanded its terse key names. These tests convert the new shape *back* to the
 * original shape and compare it against a fixture dumped from the source file, so
 * the rename is proven lossless rather than assumed to be.
 */

const toLegacyMapSpot = (s: MapSpot) => ({
  id: s.id,
  name: s.name,
  hx: s.hotspot.x,
  hy: s.hotspot.y,
  cam: [s.camera.x, s.camera.zoom, s.camera.y],
  prompt: s.prompt,
  opts: s.options.map((o) => ({
    t: o.text,
    h: o.hourCost,
    prep: o.prepPoints,
    ...(o.safetyDelta === undefined ? {} : { safety: o.safetyDelta }),
    ...(o.family === undefined ? {} : { fam: o.family }),
    fb: o.feedback,
  })),
})

const toLegacyCrisisCard = (c: CrisisCard) => ({
  title: c.title,
  text: c.text,
  tout: c.timeoutOptionIndex,
  cam: [c.camera.x, c.camera.zoom, c.camera.y],
  opts: c.options.map((o) => ({
    t: o.text,
    safety: o.safetyDelta,
    ...(o.family === undefined ? {} : { fam: o.family }),
    fb: o.feedback,
  })),
})

/** Key order differs between the shapes; compare by value, not by layout. */
const norm = (v: unknown) => JSON.parse(JSON.stringify(v)) as unknown

describe('scenario data round-trips to the original', () => {
  it('phase 1 matches the source literals', () => {
    expect(norm(PHASE1_SPOTS.map(toLegacyMapSpot))).toEqual(norm(original.P1))
  })

  it('phase 2 matches the source literals', () => {
    expect(norm(PHASE2_CARDS.map(toLegacyCrisisCard))).toEqual(norm(original.P2))
  })

  it('phase 3 matches the source literals', () => {
    expect(norm(PHASE3_SPOTS.map(toLegacyMapSpot))).toEqual(norm(original.P3))
  })

  it('world constants match the source literals', () => {
    expect(GROUND_Y).toBe(original.G)
    expect(norm(FLOOD_HEIGHTS)).toEqual(norm(original.FLOOD))
    expect(norm(RIVER_FILL)).toEqual(norm(original.RIVERFILL))
    expect(norm(SKY_TOP)).toEqual(norm(original.SKYA))
    expect(norm(SKY_BOTTOM)).toEqual(norm(original.SKYB))
    expect(norm(CLOUD_COLOR)).toEqual(norm(original.CLOUD))
    expect(norm(FAMILY_NAMES)).toEqual(norm(original.FAMNAME))
  })

  it('cast and proportions match the source literals', () => {
    const legacyCast = Object.fromEntries(
      Object.entries(CAST).map(([id, c]) => [
        id,
        {
          s: c.scale,
          tipe: c.body,
          shirt: c.shirt,
          hair: c.hair,
          ...(c.pants === undefined ? {} : { pants: c.pants }),
          rambut: c.hairStyle,
          ...(c.skirt ? { rok: 1, skirtCol: c.skirtColor } : {}),
          ...(c.glasses ? { kacamata: 1 } : {}),
          ...(c.wrinkles ? { kerut: 1 } : {}),
          ...(c.moustache ? { kumis: 1 } : {}),
        },
      ]),
    )
    expect(norm(legacyCast)).toEqual(norm(original.CAST))

    const legacyProps = Object.fromEntries(
      Object.entries(BODY_PROPORTIONS).map(([t, p]) => [
        t,
        { hw: p.headSize, tw: p.torsoW, th: p.torsoH, legH: p.legH },
      ]),
    )
    expect(norm(legacyProps)).toEqual(norm(original.PROP))
  })
})

describe('scenario data invariants', () => {
  const allSpots = [...PHASE1_SPOTS, ...PHASE3_SPOTS]

  it('every scenario offers exactly three options', () => {
    for (const s of allSpots) expect(s.options, s.id).toHaveLength(3)
    for (const c of PHASE2_CARDS) expect(c.options, c.title).toHaveLength(3)
  })

  it('every option carries non-empty text and feedback', () => {
    const options = [
      ...allSpots.flatMap((s) => s.options),
      ...PHASE2_CARDS.flatMap((c) => c.options),
    ]
    expect(options).toHaveLength(60)
    for (const o of options) {
      expect(o.text.trim().length, o.text).toBeGreaterThan(0)
      expect(o.feedback.trim().length, o.text).toBeGreaterThan(0)
    }
  })

  it('spot ids are unique within each phase', () => {
    for (const phase of [PHASE1_SPOTS, PHASE3_SPOTS]) {
      expect(new Set(phase.map((s) => s.id)).size).toBe(phase.length)
    }
  })

  it('every timeout option index addresses a real option', () => {
    for (const c of PHASE2_CARDS) {
      expect(c.timeoutOptionIndex, c.title).toBeGreaterThanOrEqual(0)
      expect(c.timeoutOptionIndex, c.title).toBeLessThan(c.options.length)
    }
  })

  it('every family effect names a real family member', () => {
    const effects = [
      ...allSpots.flatMap((s) => s.options),
      ...PHASE2_CARDS.flatMap((c) => c.options),
    ].flatMap((o) => Object.keys(o.family ?? {}))
    expect(effects.length).toBeGreaterThan(0)
    for (const id of effects) expect(FAMILY_IDS).toContain(id)
  })

  it('flood heights and river fill cover all eight crisis cards', () => {
    expect(FLOOD_HEIGHTS).toHaveLength(PHASE2_CARDS.length)
    expect(RIVER_FILL).toHaveLength(PHASE2_CARDS.length)
  })
})
