/**
 * The shape of the game's scenario content.
 *
 * These names were deliberately expanded from the original's terse keys (`t`, `h`,
 * `prep`, `fb`, `hx`, `hy`, `cam`, `tout`, `fam`) so that a teacher or a BPBD
 * reviewer can edit the scenario files without reading any application code.
 */

// ---------------------------------------------------------------- family ----

export const FAMILY_IDS = ['ibu', 'ayah', 'adik', 'nenek', 'oyen', 'tetangga'] as const
export type FamilyMemberId = (typeof FAMILY_IDS)[number]

/** How a family member came through a choice. */
export type FamilyStatus = 'aman' | 'cemas' | 'terluka' | 'terlambat'

export type FamilyState = Record<FamilyMemberId, FamilyStatus>

/** The subset of the family a single choice changes. */
export type FamilyEffect = Partial<FamilyState>

/** Everyone starts safe. */
export const INITIAL_FAMILY: FamilyState = {
  ibu: 'aman',
  ayah: 'aman',
  adik: 'aman',
  nenek: 'aman',
  oyen: 'aman',
  tetangga: 'aman',
}

// ----------------------------------------------------------- competency ----

/**
 * The four skills the game actually assesses. Every scoring choice feeds one or two
 * of them, and the ending is graded on the *weakest* bar — you cannot make up for
 * abandoning Nenek by cleaning gutters well.
 */
export const COMPETENCY_IDS = ['informasi', 'logistik', 'rentan', 'mitigasi'] as const
export type CompetencyId = (typeof COMPETENCY_IDS)[number]

/** Raw points earned per competency; normalised to 0..100 for display. */
export type CompetencyScores = Record<CompetencyId, number>

/** What a single option contributes. Never negative — strikes are the punishment. */
export type CompetencyAward = Partial<CompetencyScores>

export const NO_COMPETENCY: CompetencyScores = {
  informasi: 0,
  logistik: 0,
  rentan: 0,
  mitigasi: 0,
}

/** Human labels for the four bars. */
export const COMPETENCY_LABELS: Record<CompetencyId, string> = {
  informasi: 'Informasi',
  logistik: 'Logistik',
  rentan: 'Melindungi yang Rentan',
  mitigasi: 'Pemulihan & Mitigasi',
}

// ------------------------------------------------------------- prep tags ----

/**
 * What a phase-1 preparation actually leaves you holding. Phase 2 reads these: a tag
 * can unlock a better option, soften a wrong one, or buy thinking seconds. This is
 * what makes preparation mechanical rather than decorative.
 */
export const PREP_TAG_IDS = [
  'info-resmi',
  'tas-siaga',
  'rumah-aman',
  'jaringan-warga',
  'peta-evakuasi',
  'rencana-rentan',
] as const
export type PrepTagId = (typeof PREP_TAG_IDS)[number]

// ---------------------------------------------------------------- camera ----

/**
 * A camera position over the side-scrolling world.
 *
 * The original stored this as a bare `[x, zoom, y]` tuple — note the unusual
 * middle-element zoom, which is exactly the kind of thing this rename fixes.
 */
export interface CameraShot {
  x: number
  zoom: number
  y: number
}

// --------------------------------------------- map phases (fase 1 and 3) ----

export interface MapOption {
  text: string
  /** Hours spent on this action; the phase has a fixed budget. */
  hourCost: number
  /**
   * @deprecated The original game's flat preparedness score. The engine no longer
   * reads it; competency awards are the score now. Kept only because the round-trip
   * fixture pins it. Source of truth: `scripts/scoring-table.mjs`.
   */
  prepPoints: number
  /** Only a few map options touch safety, so this is optional here. */
  safetyDelta?: number
  family?: FamilyEffect
  feedback: string
  /** What this choice proves the player can do. Absent means it teaches nothing. */
  award?: CompetencyAward
  /** What this choice leaves behind for phase 2 to read. Phase 1 only. */
  grantsTags?: readonly PrepTagId[]
}

/** A clickable location on the village map. */
export interface MapSpot {
  id: string
  name: string
  /** Where the pin sits in world coordinates. */
  hotspot: { x: number; y: number }
  /** Where the camera moves when this spot is opened. */
  camera: CameraShot
  prompt: string
  options: readonly MapOption[]
}

// --------------------------------------------- crisis phase (fase 2) --------

export interface CrisisOption {
  text: string
  /** Always present in phase 2 — every crisis choice moves safety. */
  safetyDelta: number
  family?: FamilyEffect
  feedback: string
  award?: CompetencyAward
}

/**
 * A fourth option that only appears when the run earned the tag — the payoff for
 * having prepared. Choosing it counts as answering correctly, so it costs no strike.
 */
export interface LockedCrisisOption extends CrisisOption {
  requiresTag: PrepTagId
}

/** Preparation that softens a wrong answer's safety hit. The strike still lands. */
export interface CrisisShield {
  requiresTag: PrepTagId
  optionIndex: number
  /** Multiplier applied to a negative `safetyDelta`, e.g. 0.5 halves the damage. */
  multiplier: number
}

/** Preparation that buys thinking time on this card. */
export interface CrisisTimeBonus {
  requiresTag: PrepTagId
  seconds: number
}

/** A timed crisis during the flood night. */
export interface CrisisCard {
  title: string
  text: string
  /** The option taken automatically when the countdown runs out. */
  timeoutOptionIndex: number
  /** The one right answer. Anything else is a strike. */
  correctOptionIndex: number
  camera: CameraShot
  options: readonly CrisisOption[]
  lockedOptions?: readonly LockedCrisisOption[]
  shields?: readonly CrisisShield[]
  extraSeconds?: readonly CrisisTimeBonus[]
}

// ------------------------------------------------------------------ cast ----

export type CastId = 'p' | 'ibu' | 'ayah' | 'adik' | 'nenek' | 'darto' | 'rt' | 'warga'
export type BodyType = 'pria' | 'wanita' | 'remaja' | 'anak' | 'nenek'
export type HairStyle = 'pendek' | 'sanggul' | 'panjang' | 'peci'

export interface CastEntry {
  scale: number
  body: BodyType
  shirt: string
  hair: string
  pants?: string
  hairStyle: HairStyle
  skirt?: boolean
  skirtColor?: string
  glasses?: boolean
  wrinkles?: boolean
  moustache?: boolean
}

/** Figure proportions in stage pixels, keyed by body type. */
export interface BodyProportions {
  headSize: number
  torsoW: number
  torsoH: number
  legH: number
}
