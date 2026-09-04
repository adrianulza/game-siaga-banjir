// GENERATED from docs/original/Siaga Banjir.dc.html by scripts/extract-data.mjs.
// Content is the original game's; only the key names were expanded.

/** Garis tanah panggung, dalam piksel dunia. */
export const GROUND_Y = 620

/** Tinggi genangan pada tiap kartu fase 2 (indeks 0..7). */
export const FLOOD_HEIGHTS = [0, 8, 28, 54, 78, 100, 124, 152] as const

/** Seberapa penuh alur sungai pada tiap kartu fase 2 (0..1). */
export const RIVER_FILL = [0.52, 0.74, 0.9, 1, 1, 1, 1, 1] as const

/** Empat tingkat cuaca: cerah, mendung, malam badai, puncak bencana. */
export const SKY_TOP = [
  'var(--color-accent-200)',
  'var(--color-neutral-300)',
  'var(--color-neutral-600)',
  'var(--color-neutral-900)',
] as const
export const SKY_BOTTOM = [
  'var(--color-accent-300)',
  'var(--color-neutral-500)',
  'var(--color-neutral-800)',
  'var(--color-accent-900)',
] as const
export const CLOUD_COLOR = [
  'var(--color-neutral-100)',
  'var(--color-neutral-200)',
  'var(--color-neutral-700)',
  'var(--color-neutral-800)',
] as const
