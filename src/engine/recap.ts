import type { CrisisCard, MapSpot } from '@/data/types'

import type { CrisisLogEntry } from './state'

/**
 * The reflection lines shown between phases. Each is an opener, one line per
 * decision (or a regret line for anything skipped), and a closing lesson.
 */

const PHASE1_OPENER =
  'Hujan mulai deras, Nak. Sebelum malam tiba, Ibu mau bicara sedikit tentang yang kita lakukan hari ini.'

const PHASE3_OPENER =
  'Duduk sini, Cu. Nenek sudah tua, tapi belum pernah melihat kampung ini pulih secepat ini.'

const PHASE3_CLOSER =
  'Bencana hidrometeorologi — banjir, longsor, angin kencang — datang bersama musim. Kita tak bisa menghentikan hujan, tapi kita bisa mengurangi risikonya. Itu namanya mitigasi.'

const PHASE2_OPENER =
  'Kita selamat sampai posko. Ayah bangga — tapi mari kita ingat lagi malam itu, supaya lain kali lebih baik.'

const PHASE2_CLOSER =
  'Saat bencana, tiga hal penting: tenang, ikuti informasi resmi, dan jangan tinggalkan yang rentan. Sekarang air mulai surut — saatnya pemulihan.'

const phase1Closer = (hoursLeft: number) =>
  `Sisa waktu ${hoursLeft} jam kita gunakan untuk istirahat. Ingat: kesiapsiagaan adalah 80% dari keselamatan. Sekarang, siapkan senter — malam ini akan panjang.`

export const buildMapRecap = (
  spots: readonly MapSpot[],
  choices: Record<string, number>,
  hoursLeft: number,
  phase: 1 | 3,
): string[] => {
  const lines = [phase === 1 ? PHASE1_OPENER : PHASE3_OPENER]
  for (const spot of spots) {
    const picked = choices[spot.id]
    const option = picked === undefined ? undefined : spot.options[picked]
    lines.push(
      option
        ? option.feedback
        : `Kita tidak sempat ke ${spot.name}. Lain kali, itu juga perlu diperhatikan.`,
    )
  }
  lines.push(phase === 1 ? phase1Closer(hoursLeft) : PHASE3_CLOSER)
  return lines
}

export const buildCrisisRecap = (
  cards: readonly CrisisCard[],
  log: readonly CrisisLogEntry[],
): string[] => {
  const lines = [PHASE2_OPENER]
  log.forEach((entry, index) => {
    const card = cards[index]
    if (!card) return
    const option = card.options[entry.optionIndex]
    if (!option) return
    const prefix = entry.timedOut
      ? `Saat ${card.title.toLowerCase()}, kamu ragu terlalu lama. `
      : ''
    lines.push(prefix + option.feedback)
  })
  lines.push(PHASE2_CLOSER)
  return lines
}
