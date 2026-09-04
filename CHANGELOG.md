# Changelog

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.1.0/).

## [Unreleased]

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
