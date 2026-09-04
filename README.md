# Siaga Bencana Banjir

Game edukasi mitigasi bencana hidrometeorologi. Pemain berperan sebagai seorang remaja di Kampung
Tepi Sungai dan melewati tiga fase bencana banjir: **bersiap**, **bertahan**, dan **pulih**.

🎮 **Main di sini:** https://adrianulza.github.io/game-siaga-banjir/

## Tentang permainan

| Fase | Nama            | Mekanik                                                                                       |
| ---- | --------------- | --------------------------------------------------------------------------------------------- |
| 1    | Siaga           | Jelajahi peta kampung, pilih tindakan persiapan dengan anggaran 10 jam dan 30 detik per titik |
| 2    | Tanggap Darurat | Delapan keputusan krisis, 20 detik per kartu — tiga jawaban keliru mengakhiri permainan       |
| 3    | Pemulihan       | Bersih-bersih, kesehatan, dan mitigasi jangka panjang bersama warga                           |

**Keselamatan** (0–100) adalah nyawa keluarga: habis, permainan berakhir. Nilai permainan bukan satu
angka, melainkan empat kompetensi — **Informasi**, **Logistik**, **Melindungi yang Rentan**, dan
**Pemulihan & Mitigasi** — dan hasil akhir dinilai dari batang **terlemah**, bukan rata-rata.
Mengabaikan Nenek tidak bisa ditebus dengan membersihkan selokan.

Persiapan di Fase 1 bukan sekadar angka. Enam tindakan terbaik meninggalkan bekal yang dibaca Fase 2:
membuka pilihan yang lebih baik, meringankan akibat pilihan yang keliru, atau menambah detik berpikir.
Keenamnya menghabiskan 12 jam dari anggaran 10 jam, jadi setiap putaran harus memilih.

Setiap pilihan memberi umpan balik yang menjelaskan _mengapa_ tindakan itu tepat atau berisiko,
mengacu pada praktik kesiapsiagaan resmi (BMKG, BPBD, 112).

## Menjalankan secara lokal

```bash
npm install
npm run dev
```

| Perintah            | Fungsi                                     |
| ------------------- | ------------------------------------------ |
| `npm run dev`       | Server pengembangan Vite dengan hot reload |
| `npm run build`     | Build produksi ke `dist/`                  |
| `npm run preview`   | Pratinjau hasil build                      |
| `npm run typecheck` | Pemeriksaan tipe TypeScript                |
| `npm run lint`      | ESLint                                     |
| `npm run test`      | Unit test mesin permainan (Vitest)         |

## Struktur proyek

```
src/
├─ data/        Konten skenario — teks, pilihan, skor, kamera. Murni data.
├─ engine/      Logika permainan: state, reducer, skor, refleksi. Tanpa React/DOM.
├─ scene/       Turunan visual murni: kamera, tata letak tokoh, cuaca, air.
├─ audio/       Mesin suara Web Audio.
├─ components/  Lapisan render React.
├─ hooks/       Perekat React untuk timer, skala panggung, animasi.
└─ styles/      Design system "Broadsheet", keyframes, dan gaya permainan.
```

Batasan lapisan ditegakkan oleh ESLint: `data/` dan `engine/` tidak boleh mengimpor React atau
lapisan presentasi, sehingga keduanya dapat diuji di Node tanpa browser.

Berkas `data/` sengaja dipisah agar isi skenario dapat disunting tanpa membaca kode React.

## Pengujian

117 pengujian, dijalankan dengan `npm test`:

| Berkas                   | Cakupan                                                                                                                                                          |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tests/data.test.ts`     | Mengubah data skenario kembali ke bentuk aslinya dan membandingkannya dengan cuplikan dari berkas sumber — membuktikan penggantian nama kunci tidak mengubah isi |
| `tests/engine.test.ts`   | Aturan permainan: perpindahan fase, kompetensi, bekal persiapan, tiga kesalahan, batas waktu, dan ketiga jalur ulangi                                            |
| `tests/ceilings.test.ts` | Batas atas tiap kompetensi, dihitung ulang dari isi permainan — menjaga penilaian tetap jujur saat konten berubah                                                |
| `tests/scene.test.ts`    | Kamera, cuaca, dan ketinggian air untuk setiap layar                                                                                                             |
| `tests/actors.test.ts`   | Membandingkan 211 tokoh pada 32 keadaan dengan hasil implementasi asli, bidang demi bidang                                                                       |
| `tests/render.test.tsx`  | Memainkan permainan sungguhan di jsdom — satu putaran penuh tiga fase sampai skor akhir, dan satu putaran pilihan buruk sampai layar kalah                       |

Cuplikan pembanding dihasilkan ulang dengan `node scripts/extract-data.mjs` dan
`node scripts/dump-actors.mjs`. Berkas di `src/data/` dihasilkan oleh skrip pertama; nilai
kompetensi, bekal persiapan, dan kaitan Fase 2 diedit di `scripts/scoring-table.mjs`, bukan di
berkas hasilnya.

## Asal-usul

Permainan ini semula berupa satu berkas `.dc.html` yang dibuat di kanvas Claude Design. Berkas asli
disimpan di [`docs/original/`](docs/original/) sebagai rujukan. Lihat
[CHANGELOG.md](CHANGELOG.md) untuk riwayat pemindahan.

## Lisensi

[MIT](LICENSE)
