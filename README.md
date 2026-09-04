# Siaga Bencana Banjir

Game edukasi mitigasi bencana hidrometeorologi. Pemain berperan sebagai seorang remaja di Kampung
Tepi Sungai dan melewati tiga fase bencana banjir: **bersiap**, **bertahan**, dan **pulih**.

🎮 **Main di sini:** https://adrianulza.github.io/game-siaga-banjir/

## Tentang permainan

| Fase | Nama            | Mekanik                                                                                      |
| ---- | --------------- | -------------------------------------------------------------------------------------------- |
| 1    | Siaga           | Jelajahi peta kampung, pilih tindakan persiapan dengan anggaran waktu terbatas               |
| 2    | Tanggap Darurat | Delapan keputusan krisis dengan hitung mundur — ragu terlalu lama, keputusan diambil untukmu |
| 3    | Pemulihan       | Bersih-bersih, kesehatan, dan mitigasi jangka panjang bersama warga                          |

Tiga angka dilacak sepanjang permainan — **Keselamatan**, **Persiapan**, dan **Waktu** — bersama
status enam anggota keluarga dan tetangga. Setiap pilihan memberi umpan balik yang menjelaskan
_mengapa_ tindakan itu tepat atau berisiko, mengacu pada praktik kesiapsiagaan resmi (BMKG, BPBD,
112).

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

## Asal-usul

Permainan ini semula berupa satu berkas `.dc.html` yang dibuat di kanvas Claude Design. Berkas asli
disimpan di [`docs/original/`](docs/original/) sebagai rujukan. Lihat
[CHANGELOG.md](CHANGELOG.md) untuk riwayat pemindahan.

## Lisensi

[MIT](LICENSE)
