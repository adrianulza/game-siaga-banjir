import { FAMILY_NAMES } from '@/data/cast'
import { FAMILY_IDS, type FamilyStatus } from '@/data/types'

import { endingTier, totalScore } from './scoring'
import type { GameState, PhaseNumber, ScreenId } from './state'

/**
 * Derived copy and display values. Everything here is a pure function of state, and
 * lives outside the components so the strings are in one reviewable place rather
 * than scattered through JSX.
 */

// ------------------------------------------------------------- phase rail ----

export interface PhaseTab {
  label: string
  active: boolean
}

const PHASES: { label: string; screens: ScreenId[] }[] = [
  { label: 'Fase 1 · Kesiapsiagaan', screens: ['p1', 'recap1'] },
  { label: 'Fase 2 · Respons', screens: ['p2', 'recap2'] },
  { label: 'Fase 3 · Pemulihan', screens: ['p3', 'recap3'] },
]

const PHASE_ENTRY_SCREEN: Record<PhaseNumber, ScreenId> = { 1: 'p1', 2: 'p2', 3: 'p3' }

export const phaseTabs = (state: GameState): PhaseTab[] => {
  // On the game-over screen the rail keeps highlighting the phase that was lost.
  const current = state.screen === 'over' ? PHASE_ENTRY_SCREEN[state.overFromPhase] : state.screen
  return PHASES.map((p) => ({ label: p.label, active: p.screens.includes(current) }))
}

// ---------------------------------------------------------------- family ----

export interface FamilyChip {
  id: string
  name: string
  /** Empty when safe; otherwise the status, prefixed for display. */
  tail: string
  dot: string
}

const STATUS_DOT: Record<FamilyStatus, string> = {
  aman: 'var(--color-accent)',
  cemas: 'var(--color-process-yellow)',
  terlambat: 'var(--color-neutral-600)',
  terluka: 'var(--color-accent-2)',
}

export const familyChips = (state: GameState): FamilyChip[] =>
  FAMILY_IDS.map((id) => {
    const status = state.family[id]
    return {
      id,
      name: FAMILY_NAMES[id],
      tail: status === 'aman' ? '' : `· ${status}`,
      dot: STATUS_DOT[status],
    }
  })

/** The family strip is dimmed on the intro, before anyone is at risk. */
export const familyStripOpacity = (state: GameState) => (state.screen === 'intro' ? 0.35 : 1)

// -------------------------------------------------------------- dateline ----

const DATELINES: Record<ScreenId, string> = {
  intro: 'Senin, 03.00 WIB · Peringatan Dini · Status Waspada',
  p1: 'Senin · Siang menjelang malam · Status Waspada',
  recap1: 'Senin · 21.00 WIB · Hujan sangat lebat',
  p2: 'Selasa · 01.00–05.00 WIB · Status Awas',
  recap2: 'Selasa · 06.00 WIB · Di posko pengungsian',
  p3: 'Kamis · Air surut · Masa pemulihan',
  recap3: 'Kamis · Malam · Di posko pengungsian',
  end: 'Edisi Minggu · Laporan khusus',
  over: 'Selasa · 04.00 WIB · Status Awas · Air terus meninggi',
}

export const datelineFor = (state: GameState) => DATELINES[state.screen]

// ------------------------------------------------------------- map phase ----

export interface MapCopy {
  kicker: string
  title: string
  note: string
  hoursLabel: string
  hoursColor: string
  doneLabel: string
  finishLabel: string
}

export const mapCopy = (state: GameState, spotCount: number): MapCopy => {
  const isPhase1 = state.screen === 'p1'
  const visited = Object.keys(state.mapChoices).length
  const outOfTime = state.hoursLeft <= 0
  const allDone = visited === spotCount || outOfTime

  return {
    kicker: isPhase1 ? 'Fase 1 · Kesiapsiagaan' : 'Fase 3 · Pemulihan',
    title: isPhase1
      ? state.hoursLeft > 0
        ? 'Hujan lebat diperkirakan malam ini'
        : 'Waktu habis — hujan mulai deras!'
      : state.hoursLeft > 0
        ? 'Air surut, kampung berbenah'
        : 'Hari sudah gelap — waktunya istirahat',
    note: isPhase1
      ? 'Klik titik-titik di peta untuk bersiap. Kamera akan mendekat ke lokasinya. Setiap tindakan memakan waktu, dan kamu tidak bisa melakukan semuanya — pilih yang paling penting.'
      : 'Klik titik-titik di peta untuk membantu pemulihan. Jaga kesehatan keluarga dan perbaiki kampung agar lebih siap menghadapi musim hujan berikutnya.',
    hoursLabel: `${state.hoursLeft} jam`,
    hoursColor: state.hoursLeft <= 3 ? 'var(--color-accent-2-700)' : 'var(--color-text)',
    doneLabel: `${visited} dari ${spotCount} lokasi dikunjungi`,
    finishLabel: isPhase1
      ? allDone
        ? 'Malam tiba →'
        : 'Lanjut ke malam hari →'
      : allDone
        ? 'Lihat hasilnya →'
        : 'Selesai berbenah →',
  }
}

// ----------------------------------------------------------------- timer ----

export interface TimerDisplay {
  percent: number
  color: string
  seconds: number
  animation: string
}

export const timerDisplay = (state: GameState, decisionMs: number): TimerDisplay => {
  const fraction = state.timeLeftMs / decisionMs
  return {
    percent: fraction * 100,
    color: fraction > 0.4 ? 'var(--color-accent)' : 'var(--color-accent-2)',
    seconds: Math.ceil(state.timeLeftMs / 1000),
    animation: fraction <= 0.3 ? 'tick .5s ease-in-out infinite alternate' : 'none',
  }
}

// ------------------------------------------------------------ game over ----

const OVER_TITLES: Record<PhaseNumber, string> = {
  1: 'Malam Datang, Kampung Belum Siap',
  2: 'Air Datang Lebih Cepat dari Keputusanmu',
  3: 'Pemulihan yang Menelan Korban',
}

const OVER_TEXTS: Record<PhaseNumber, string> = {
  1: 'Sebelum hujan puncak pun keselamatan keluargamu sudah habis terkuras. Bertaruh di tepi sungai yang meluap dan menunda hal-hal kecil ternyata mahal harganya — malam itu tak ada yang siap.',
  2: 'Keselamatan keluargamu habis di tengah puncak banjir. Arus membawa apa yang tak sempat diselamatkan, dan tim SAR baru bisa merapat saat pagi. Di simulasi kamu bisa mengulang; di kehidupan nyata, tidak.',
  3: 'Banjir sudah surut, tapi bahaya belum. Lumpur, air tercemar, dan lereng yang rapuh menghabiskan keselamatan keluargamu justru pada masa pemulihan.',
}

export const gameOverCopy = (state: GameState) => {
  const phase = state.overFromPhase
  return {
    kicker: `Fase ${phase} gagal · Keselamatan 0`,
    title: OVER_TITLES[phase],
    text: OVER_TEXTS[phase],
    retryLabel: `Ulangi Fase ${phase}`,
    lesson:
      'Tiga kunci saat bencana: tetap tenang, ikuti hanya informasi resmi (BMKG, BPBD, 112), dan jangan pernah meninggalkan yang paling rentan.',
  }
}

// --------------------------------------------------------------- ending ----

const ENDINGS = {
  pahlawan: {
    title: 'Pahlawan Siaga Kampung Tepi Sungai',
    text: 'Keputusan cepat dan tepatmu menyelamatkan keluarga dan tetangga. Warga kini menjadikan rencana siagamu contoh untuk seluruh kampung.',
  },
  tangguh: {
    title: 'Keluarga Tangguh Menghadapi Musim Hujan',
    text: 'Keluargamu melewati banjir dan longsor dengan selamat, meski beberapa keputusan bisa lebih baik. Musim hujan berikutnya, kalian lebih siap.',
  },
  duka: {
    title: 'Kampung Berduka, Pelajaran Berharga',
    text: 'Bencana ini meninggalkan luka. Tapi setiap kesalahan adalah pelajaran — coba lagi dan lihat betapa berbedanya hasilnya dengan persiapan yang lebih baik.',
  },
} as const

export const endingCopy = (state: GameState) => {
  const total = totalScore(state)
  return { total, ...ENDINGS[endingTier(total)] }
}

// --------------------------------------------------------------- recap ----

export interface RecapScene {
  speaker: string
  kicker: string
  /** Where the reflection is set: at home by candlelight, or at the shelter. */
  backdrop: 'home' | 'posko'
  background: string
  floor: string
  lanternX: number
  shirt: string
  hair: string
  pants: string
  skirt: { on: boolean; color: string }
  transform: string
  nextLabel: string
}

/**
 * The three reflection scenes, as one table. The original spread these across 13
 * separate ternary chains in its props bag.
 */
export const RECAP_SCENES: Record<'recap1' | 'recap2' | 'recap3', RecapScene> = {
  recap1: {
    speaker: 'Ibu',
    kicker: 'Refleksi Fase 1',
    backdrop: 'home',
    background: 'var(--color-neutral-900)',
    floor: 'var(--color-neutral-500)',
    lanternX: 300,
    shirt: 'var(--color-accent-2-600)',
    hair: 'var(--color-neutral-900)',
    pants: 'var(--color-neutral-200)',
    skirt: { on: true, color: 'var(--color-accent-2-800)' },
    transform: 'scale(.97)',
    nextLabel: 'Mulai Fase 2 →',
  },
  recap2: {
    speaker: 'Ayah',
    kicker: 'Refleksi Fase 2',
    backdrop: 'posko',
    background: 'var(--color-accent-900)',
    floor: 'var(--color-neutral-400)',
    lanternX: 1000,
    shirt: 'var(--color-accent-600)',
    hair: 'var(--color-neutral-900)',
    pants: 'var(--color-neutral-800)',
    skirt: { on: false, color: 'var(--color-neutral-700)' },
    transform: 'scale(1.04)',
    nextLabel: 'Mulai Fase 3 →',
  },
  recap3: {
    speaker: 'Nenek',
    kicker: 'Refleksi Fase 3',
    backdrop: 'posko',
    background: 'var(--color-accent-900)',
    floor: 'var(--color-neutral-400)',
    lanternX: 1000,
    shirt: 'var(--color-neutral-500)',
    hair: 'var(--color-neutral-300)',
    pants: 'var(--color-neutral-200)',
    skirt: { on: true, color: 'var(--color-neutral-700)' },
    transform: 'scale(.88) rotate(-3deg)',
    nextLabel: 'Lihat Hasil Akhir →',
  },
}

export const recapProgress = (state: GameState) => ({
  line: state.recapLines[state.recapIndex] ?? '',
  count: `${state.recapIndex + 1} / ${state.recapLines.length}`,
  isLast: state.recapIndex >= state.recapLines.length - 1,
})
