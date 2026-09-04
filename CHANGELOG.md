# Changelog

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.1.0/).

## [1.0.0] — 2026-09-04

### Added

- Mesin permainan murni (`src/engine/`) tanpa React atau DOM, beserta 41 unit test.
- Cuplikan pembanding dari implementasi asli: 60 pilihan skenario dan 211 tokoh
  pada 32 keadaan, dipakai untuk membuktikan hasil pemindahan identik.
- Uji render di jsdom yang memainkan satu putaran penuh tiga fase sampai skor
  akhir, dan satu putaran pilihan buruk sampai layar kalah.
- Penerbitan otomatis ke GitHub Pages lewat GitHub Actions.
- Efek `:hover` yang sebenarnya. Atribut `style-hover` pada templat lama tidak
  pernah berfungsi — runtime-nya tidak mengenal atribut itu sama sekali.
- Dukungan `prefers-reduced-motion`.

### Changed

- Memindahkan permainan dari berkas tunggal `.dc.html` (runtime `dc-runtime`) ke proyek
  Vite + React + TypeScript. Alasan: runtime lama tidak mendukung hot reload, tidak dapat
  mengimpor modul (logika dijalankan lewat `new Function`), dan memuat React dari CDN unpkg
  saat runtime.
- Memisahkan konten skenario ke `src/data/`, logika ke `src/engine/`, dan turunan visual ke
  `src/scene/`.

### Removed

- `_ds_bundle.js` (efek pelat cetak CMYK). Terverifikasi tidak berpengaruh: `.cmyk-num`
  memerlukan anak `.paper`/`.plate-*` yang tidak ada di templat.
- `@import` Google Fonts. Source Serif 4 kini di-bundle lokal lewat `@fontsource`.
- Salinan ganda `ds/styles.css` (identik byte-per-byte dengan berkas di `_ds/`).
