// GENERATED from docs/original/Siaga Banjir.dc.html by scripts/extract-data.mjs.
// Content is the original game's; only the key names were expanded.

import type { BodyProportions, BodyType, CastEntry, CastId, FamilyMemberId } from './types'

/** Tampilan setiap tokoh: warna, gaya rambut, dan atribut wajah. */
export const CAST: Record<CastId, CastEntry> = {
  "p": {
    "scale": 1.12,
    "body": "remaja",
    "shirt": "var(--color-process-yellow)",
    "hair": "var(--color-neutral-900)",
    "pants": "var(--color-accent-800)",
    "hairStyle": "pendek"
  },
  "ibu": {
    "scale": 1.2,
    "body": "wanita",
    "shirt": "var(--color-accent-2-600)",
    "hair": "var(--color-neutral-900)",
    "hairStyle": "sanggul",
    "skirt": true,
    "skirtColor": "var(--color-accent-2-800)"
  },
  "ayah": {
    "scale": 1.34,
    "body": "pria",
    "shirt": "var(--color-accent-700)",
    "hair": "var(--color-neutral-900)",
    "pants": "var(--color-neutral-800)",
    "hairStyle": "pendek"
  },
  "adik": {
    "scale": 0.84,
    "body": "anak",
    "shirt": "var(--color-accent-400)",
    "hair": "var(--color-neutral-900)",
    "pants": "var(--color-accent-800)",
    "hairStyle": "pendek"
  },
  "nenek": {
    "scale": 0.98,
    "body": "nenek",
    "shirt": "var(--color-neutral-500)",
    "hair": "var(--color-neutral-300)",
    "hairStyle": "sanggul",
    "skirt": true,
    "skirtColor": "var(--color-neutral-700)",
    "glasses": true,
    "wrinkles": true
  },
  "darto": {
    "scale": 1.28,
    "body": "pria",
    "shirt": "var(--color-neutral-700)",
    "hair": "var(--color-neutral-400)",
    "pants": "var(--color-neutral-800)",
    "hairStyle": "pendek",
    "moustache": true
  },
  "rt": {
    "scale": 1.3,
    "body": "pria",
    "shirt": "var(--color-neutral-800)",
    "hair": "var(--color-neutral-900)",
    "pants": "var(--color-neutral-900)",
    "hairStyle": "peci",
    "moustache": true
  },
  "warga": {
    "scale": 1.18,
    "body": "wanita",
    "shirt": "var(--color-neutral-500)",
    "hair": "var(--color-neutral-900)",
    "hairStyle": "panjang",
    "skirt": true,
    "skirtColor": "var(--color-neutral-700)"
  }
}

/** Proporsi tubuh per tipe, dalam piksel panggung. */
export const BODY_PROPORTIONS: Record<BodyType, BodyProportions> = {
  "pria": {
    "headSize": 19,
    "torsoW": 27,
    "torsoH": 27,
    "legH": 20
  },
  "wanita": {
    "headSize": 18,
    "torsoW": 24,
    "torsoH": 26,
    "legH": 22
  },
  "remaja": {
    "headSize": 19,
    "torsoW": 24,
    "torsoH": 25,
    "legH": 22
  },
  "anak": {
    "headSize": 22,
    "torsoW": 22,
    "torsoH": 22,
    "legH": 22
  },
  "nenek": {
    "headSize": 18,
    "torsoW": 23,
    "torsoH": 25,
    "legH": 23
  }
}

/** Nama tampilan anggota keluarga dan tetangga. */
export const FAMILY_NAMES: Record<FamilyMemberId, string> = {
  "ibu": "Ibu",
  "ayah": "Ayah",
  "adik": "Dito",
  "nenek": "Nenek",
  "oyen": "Oyen",
  "tetangga": "Pak Darto"
}
