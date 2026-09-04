// GENERATED from docs/original/Siaga Banjir.dc.html by scripts/extract-data.mjs.
// Content is the original game's; only the key names were expanded.

import type { MapSpot } from './types'

/** Fase 3 — Pemulihan: enam titik pemulihan dan mitigasi setelah air surut. */
export const PHASE3_SPOTS: readonly MapSpot[] = [
  {
    id: 'rumah',
    name: 'Rumah · Bersih-bersih',
    hotspot: {
      x: 880,
      y: 584,
    },
    camera: {
      x: 850,
      zoom: 1.5,
      y: 550,
    },
    prompt: 'Air surut menyisakan lumpur setebal 20 cm di rumah. Ayah mulai menyapu.',
    options: [
      {
        text: 'Pakai sepatu bot, sarung tangan, dan masker; buang sampah basah, keringkan dan jemur barang.',
        hourCost: 2,
        prepPoints: 12,
        safetyDelta: 8,
        feedback:
          'Lumpur banjir membawa kuman leptospirosis dan tetanus. Alat pelindung diri itu wajib.',
      },
      {
        text: 'Langsung bersihkan tanpa alas kaki, biar cepat.',
        hourCost: 1,
        prepPoints: 6,
        safetyDelta: -8,
        feedback: 'Kaki lecet terkena lumpur banjir bisa berujung leptospirosis. Pakai pelindung!',
      },
      {
        text: 'Lewati.',
        hourCost: 0,
        prepPoints: 0,
        feedback: 'Rumah yang lembap berhari-hari memicu jamur dan penyakit pernapasan.',
      },
    ],
  },
  {
    id: 'air',
    name: 'Sumur & Air Bersih',
    hotspot: {
      x: 670,
      y: 596,
    },
    camera: {
      x: 690,
      zoom: 1.65,
      y: 590,
    },
    prompt: 'Sumur keluarga terendam banjir. Dito haus dan ingin minum air keran.',
    options: [
      {
        text: 'Gunakan air bersih dari posko atau rebus air sampai mendidih sebelum diminum.',
        hourCost: 1,
        prepPoints: 8,
        safetyDelta: 12,
        feedback:
          'Sumur yang terendam tercemar. Diare adalah penyakit paling umum pasca banjir — air matang menyelamatkan.',
      },
      {
        text: 'Biarkan Dito minum air sumur, kelihatannya bening.',
        hourCost: 0,
        prepPoints: 0,
        safetyDelta: -12,
        family: {
          adik: 'cemas',
        },
        feedback: 'Air yang tampak bening bisa penuh bakteri. Dito sakit perut malamnya.',
      },
      {
        text: 'Lewati.',
        hourCost: 0,
        prepPoints: 0,
        feedback: 'Air bersih adalah kebutuhan nomor satu setelah bencana.',
      },
    ],
  },
  {
    id: 'posko',
    name: 'Posko Kesehatan',
    hotspot: {
      x: 1660,
      y: 470,
    },
    camera: {
      x: 1660,
      zoom: 1.35,
      y: 500,
    },
    prompt: 'Posko kesehatan dibuka di balai warga. Antrean cukup panjang.',
    options: [
      {
        text: 'Antar Nenek dan Dito periksa; tanya gejala yang harus diwaspadai: demam, diare, sesak.',
        hourCost: 1,
        prepPoints: 6,
        safetyDelta: 12,
        feedback:
          'Pemeriksaan dini mencegah penyakit pasca banjir menjadi berat. Nenek mendapat obat rutinnya lagi.',
      },
      {
        text: 'Ambil vitamin saja tanpa diperiksa.',
        hourCost: 1,
        prepPoints: 2,
        safetyDelta: 3,
        feedback: 'Vitamin membantu, tapi pemeriksaan lebih penting untuk lansia dan anak-anak.',
      },
      {
        text: 'Lewati, semua terlihat sehat.',
        hourCost: 0,
        prepPoints: 0,
        feedback: 'Gejala penyakit pasca banjir sering muncul 3–7 hari kemudian.',
      },
    ],
  },
  {
    id: 'rapat',
    name: 'Rapat Keluarga',
    hotspot: {
      x: 770,
      y: 466,
    },
    camera: {
      x: 880,
      zoom: 1.6,
      y: 520,
    },
    prompt:
      'Malam harinya keluarga berkumpul dengan lilin. Ibu mengusulkan membicarakan apa yang bisa diperbaiki.',
    options: [
      {
        text: 'Buat rencana keluarga: titik kumpul, nomor darurat (112, BPBD), tugas tiap orang, isi ulang tas siaga.',
        hourCost: 1,
        prepPoints: 18,
        feedback:
          'Rencana keluarga tertulis membuat semua orang tahu tugasnya. Bencana berikutnya, kalian lebih siap.',
      },
      {
        text: 'Cerita seru saja, tidak perlu rencana.',
        hourCost: 1,
        prepPoints: 4,
        feedback: 'Berbagi cerita menyembuhkan trauma, tapi rencana konkret melindungi masa depan.',
      },
      {
        text: 'Lewati, sudah lelah.',
        hourCost: 0,
        prepPoints: 0,
        feedback: 'Pemulihan bukan hanya fisik — merencanakan ulang adalah bagian dari mitigasi.',
      },
    ],
  },
  {
    id: 'lereng',
    name: 'Lereng & Sungai',
    hotspot: {
      x: 330,
      y: 400,
    },
    camera: {
      x: 380,
      zoom: 1.3,
      y: 420,
    },
    prompt:
      'Pak RT mengajak kerja bakti: sungai penuh sampah dan lereng bukit gundul setelah longsor.',
    options: [
      {
        text: 'Ikut kerja bakti: bersihkan sungai, tanam vetiver dan pohon di lereng, pasang papan tanda rawan longsor.',
        hourCost: 3,
        prepPoints: 18,
        feedback:
          'Akar tanaman mengikat tanah dan sungai bersih mengurangi luapan. Ini mitigasi jangka panjang yang nyata.',
      },
      {
        text: 'Ikut sebentar, lalu pulang.',
        hourCost: 1,
        prepPoints: 6,
        feedback: 'Setiap tenaga membantu, tapi mitigasi butuh komitmen bersama.',
      },
      {
        text: 'Lewati.',
        hourCost: 0,
        prepPoints: 0,
        feedback: 'Tanpa perbaikan lingkungan, banjir dan longsor akan kembali setiap musim hujan.',
      },
    ],
  },
  {
    id: 'darto',
    name: 'Rumah Pak Darto',
    hotspot: {
      x: 1265,
      y: 520,
    },
    camera: {
      x: 1250,
      zoom: 1.5,
      y: 530,
    },
    prompt: 'Rumah Pak Darto paling parah terendam. Beliau duduk termenung di teras.',
    options: [
      {
        text: 'Bantu membersihkan rumahnya dan ajak bicara — ajak ikut rapat siaga RT berikutnya.',
        hourCost: 2,
        prepPoints: 10,
        safetyDelta: 6,
        family: {
          tetangga: 'aman',
        },
        feedback:
          'Gotong royong mempercepat pemulihan dan mengubah sikap Pak Darto tentang peringatan dini.',
      },
      {
        text: 'Sapa sebentar dari jalan.',
        hourCost: 0,
        prepPoints: 2,
        feedback: 'Sapaan menghangatkan, tapi tangan yang membantu lebih berarti.',
      },
      {
        text: 'Lewati.',
        hourCost: 0,
        prepPoints: 0,
        feedback:
          'Komunitas yang saling bantu pulih lebih cepat daripada yang bergerak sendiri-sendiri.',
      },
    ],
  },
]
