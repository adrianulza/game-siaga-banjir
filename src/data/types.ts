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
  /** Preparedness points earned. */
  prepPoints: number
  /** Only a few map options touch safety, so this is optional here. */
  safetyDelta?: number
  family?: FamilyEffect
  feedback: string
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
}

/** A timed crisis during the flood night. */
export interface CrisisCard {
  title: string
  text: string
  /** The option taken automatically when the countdown runs out. */
  timeoutOptionIndex: number
  camera: CameraShot
  options: readonly CrisisOption[]
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
