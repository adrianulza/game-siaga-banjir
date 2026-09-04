/**
 * One-shot extractor: lifts the game's data literals straight out of the original
 * .dc.html, renames their terse keys, and emits typed modules under src/data/.
 *
 * Written rather than hand-transcribed on purpose — the payload is ~1000 lines of
 * Indonesian prose across 60 options, and a typo in it is invisible to the type
 * checker. It also dumps the raw literals to tests/fixtures/ so the round-trip test
 * can prove the rename lost nothing.
 *
 *   node scripts/extract-data.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import vm from 'node:vm'

import {
  CORRECT_OPTION_INDEX,
  PHASE1_AWARDS,
  PHASE1_TAGS,
  PHASE2_SCORING,
  PHASE3_AWARDS,
} from './scoring-table.mjs'

const SRC = 'docs/original/Siaga Banjir.dc.html'
const html = readFileSync(SRC, 'utf8')

// ---- slice the logic script out of the document -----------------------------
const scriptStart = html.indexOf('data-dc-script')
const bodyStart = html.indexOf('>', scriptStart) + 1
const bodyEnd = html.lastIndexOf('</script>')
const script = html.slice(bodyStart, bodyEnd)

// ---- the module-level data block: `const P1 = [` .. up to `class Snd` --------
const constBlock = script.slice(script.indexOf('const P1 ='), script.indexOf('class Snd'))

// ---- CAST / PROP live inside actorsFor(); take just those two statements -----
const castStart = script.indexOf('const CAST={')
const propEnd = script.indexOf('};', script.indexOf('const PROP={')) + 2
const castBlock = script.slice(castStart, propEnd)

const sandbox = {}
vm.createContext(sandbox)
vm.runInContext(
  `${constBlock}\n${castBlock}\n` +
    'globalThis.__out = { P1, P2, P3, FAM0, FAMNAME, SKYA, SKYB, CLOUD, G, FLOOD, RIVERFILL, CAST, PROP };',
  sandbox,
)
const d = sandbox.__out

// ---- fixture: the literals exactly as the original had them ------------------
writeFileSync('tests/fixtures/original-data.json', JSON.stringify(d, null, 2) + '\n')

// ---- renames ----------------------------------------------------------------
const camera = ([x, zoom, y]) => ({ x, zoom, y })

/** Drop empty award objects rather than emitting `award: {}` sixty times over. */
const withAward = (award) => (award && Object.keys(award).length ? { award } : {})

/** Options on map spots (phases 1 & 3): hourCost/prepPoints always present. */
const mapOption = (awards, tag) => (o, i) => ({
  text: o.t,
  hourCost: o.h,
  prepPoints: o.prep,
  ...(o.safety === undefined ? {} : { safetyDelta: o.safety }),
  ...(o.fam === undefined ? {} : { family: o.fam }),
  feedback: o.fb,
  ...withAward(awards?.[i]),
  // Only the best option leaves something behind for phase 2 to read.
  ...(i === 0 && tag ? { grantsTags: [tag] } : {}),
})

/** Options on crisis cards (phase 2): safetyDelta always present, no time cost. */
const crisisOption = (awards) => (o, i) => ({
  text: o.t,
  safetyDelta: o.safety,
  ...(o.fam === undefined ? {} : { family: o.fam }),
  feedback: o.fb,
  ...withAward(awards?.[i]),
})

const mapSpot = (awardTable, tagTable) => (s) => ({
  id: s.id,
  name: s.name,
  hotspot: { x: s.hx, y: s.hy },
  camera: camera(s.cam),
  prompt: s.prompt,
  options: s.opts.map(mapOption(awardTable[s.id], tagTable?.[s.id])),
})

/** A locked option is a full CrisisOption plus the tag that reveals it. */
const lockedOption = (l) => ({
  requiresTag: l.requiresTag,
  text: l.text,
  safetyDelta: l.safetyDelta,
  ...(l.family === undefined ? {} : { family: l.family }),
  feedback: l.feedback,
  ...withAward(l.award),
})

const crisisCard = (c, i) => {
  const scoring = PHASE2_SCORING[i]
  return {
    title: c.title,
    text: c.text,
    timeoutOptionIndex: c.tout,
    correctOptionIndex: CORRECT_OPTION_INDEX,
    camera: camera(c.cam),
    options: c.opts.map(crisisOption(scoring.awards)),
    ...(scoring.locked ? { lockedOptions: scoring.locked.map(lockedOption) } : {}),
    ...(scoring.shields ? { shields: scoring.shields } : {}),
    ...(scoring.extraSeconds ? { extraSeconds: scoring.extraSeconds } : {}),
  }
}

const castEntry = (c) => ({
  scale: c.s,
  body: c.tipe,
  shirt: c.shirt,
  hair: c.hair,
  ...(c.pants === undefined ? {} : { pants: c.pants }),
  hairStyle: c.rambut,
  ...(c.rok ? { skirt: true, skirtColor: c.skirtCol } : {}),
  ...(c.kacamata ? { glasses: true } : {}),
  ...(c.kerut ? { wrinkles: true } : {}),
  ...(c.kumis ? { moustache: true } : {}),
})

const proportions = (p) => ({ headSize: p.hw, torsoW: p.tw, torsoH: p.th, legH: p.legH })

const mapValues = (o, f) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, f(v)]))

// ---- emit -------------------------------------------------------------------
const lit = (v) => JSON.stringify(v, null, 2)
const header = `// GENERATED from ${SRC} by scripts/extract-data.mjs.\n// Content is the original game's; only the key names were expanded.\n`

/** The scenario files carry a scoring layer the original never had. */
const scored =
  header +
  '// Competency awards, prep tags and phase-2 couplings are not from the original —\n' +
  '// they live in scripts/scoring-table.mjs. Edit them there, not here.\n'

writeFileSync(
  'src/data/phase1-siaga.ts',
  `${scored}
import type { MapSpot } from './types'

/** Fase 1 — Siaga: enam titik persiapan sebelum banjir datang. */
export const PHASE1_SPOTS: readonly MapSpot[] = ${lit(d.P1.map(mapSpot(PHASE1_AWARDS, PHASE1_TAGS)))}
`,
)

writeFileSync(
  'src/data/phase2-darurat.ts',
  `${scored}
import type { CrisisCard } from './types'

/** Fase 2 — Tanggap Darurat: delapan keputusan krisis berbatas waktu. */
export const PHASE2_CARDS: readonly CrisisCard[] = ${lit(d.P2.map(crisisCard))}
`,
)

writeFileSync(
  'src/data/phase3-pemulihan.ts',
  `${scored}
import type { MapSpot } from './types'

/** Fase 3 — Pemulihan: enam titik pemulihan dan mitigasi setelah air surut. */
export const PHASE3_SPOTS: readonly MapSpot[] = ${lit(d.P3.map(mapSpot(PHASE3_AWARDS)))}
`,
)

writeFileSync(
  'src/data/cast.ts',
  `${header}
import type { BodyProportions, BodyType, CastEntry, CastId, FamilyMemberId } from './types'

/** Tampilan setiap tokoh: warna, gaya rambut, dan atribut wajah. */
export const CAST: Record<CastId, CastEntry> = ${lit(mapValues(d.CAST, castEntry))}

/** Proporsi tubuh per tipe, dalam piksel panggung. */
export const BODY_PROPORTIONS: Record<BodyType, BodyProportions> = ${lit(mapValues(d.PROP, proportions))}

/** Nama tampilan anggota keluarga dan tetangga. */
export const FAMILY_NAMES: Record<FamilyMemberId, string> = ${lit(d.FAMNAME)}
`,
)

writeFileSync(
  'src/data/world.ts',
  `${header}
/** Garis tanah panggung, dalam piksel dunia. */
export const GROUND_Y = ${d.G}

/** Tinggi genangan pada tiap kartu fase 2 (indeks 0..7). */
export const FLOOD_HEIGHTS = ${lit(d.FLOOD)} as const

/** Seberapa penuh alur sungai pada tiap kartu fase 2 (0..1). */
export const RIVER_FILL = ${lit(d.RIVERFILL)} as const

/** Empat tingkat cuaca: cerah, mendung, malam badai, puncak bencana. */
export const SKY_TOP = ${lit(d.SKYA)} as const
export const SKY_BOTTOM = ${lit(d.SKYB)} as const
export const CLOUD_COLOR = ${lit(d.CLOUD)} as const
`,
)

console.log('extracted:')
console.log('  phase1 spots :', d.P1.length)
console.log('  phase2 cards :', d.P2.length)
console.log('  phase3 spots :', d.P3.length)
console.log('  cast entries :', Object.keys(d.CAST).length)
console.log(
  '  options total:',
  [...d.P1, ...d.P2, ...d.P3].reduce((n, x) => n + x.opts.length, 0),
)
