// GENERATED from docs/original/Siaga Banjir.dc.html by scripts/extract-data.mjs.
// Content is the original game's; only the key names were expanded.

import type { MapSpot } from './types'

/** Fase 1 — Siaga: enam titik persiapan sebelum banjir datang. */
export const PHASE1_SPOTS: readonly MapSpot[] = [
  {
    id: 'radio',
    name: 'HP & Radio',
    hotspot: {
      x: 800,
      y: 500,
    },
    camera: {
      x: 820,
      zoom: 1.6,
      y: 540,
    },
    prompt:
      'Ponsel bergetar: ada notifikasi peringatan dini cuaca. Ibu bertanya, “Itu dari mana, Nak?”',
    options: [
      {
        text: 'Buka aplikasi/website BMKG, catat status peringatan dan perkiraan hujan lebat 3 hari ke depan.',
        hourCost: 1,
        prepPoints: 15,
        feedback:
          'Tepat! Peringatan dini resmi datang dari BMKG untuk cuaca dan BNPB/BPBD untuk bencana. Info dari sumber resmi mencegah panik karena hoaks.',
      },
      {
        text: 'Percaya pesan berantai di grup WA yang bilang “bendungan jebol malam ini”.',
        hourCost: 1,
        prepPoints: 3,
        feedback:
          'Pesan berantai sering tidak benar. Selalu cek ulang ke sumber resmi sebelum percaya, apalagi menyebarkan.',
      },
      {
        text: 'Abaikan, lanjut main game.',
        hourCost: 0,
        prepPoints: 0,
        feedback:
          'Peringatan dini itu waktu berharga. Mengabaikannya berarti kehilangan kesempatan bersiap.',
      },
    ],
  },
  {
    id: 'dapur',
    name: 'Dapur · Tas Siaga',
    hotspot: {
      x: 900,
      y: 588,
    },
    camera: {
      x: 880,
      zoom: 1.65,
      y: 570,
    },
    prompt:
      'Ibu mengeluarkan ransel kosong. “Kalau kita harus mengungsi malam ini, apa yang perlu dibawa?”',
    options: [
      {
        text: 'Isi: air minum, makanan tahan lama, senter & baterai, obat-obatan, dokumen penting dibungkus plastik, powerbank, pakaian ganti.',
        hourCost: 2,
        prepPoints: 20,
        feedback:
          'Itulah isi Tas Siaga Bencana yang ideal — cukup untuk 3 hari dan diletakkan di tempat yang mudah dijangkau.',
      },
      {
        text: 'Masukkan camilan, mainan, dan charger saja.',
        hourCost: 1,
        prepPoints: 6,
        feedback:
          'Camilan boleh, tapi air minum, obat, senter, dan dokumen jauh lebih penting saat mengungsi.',
      },
      {
        text: 'Nanti saja kalau air sudah mulai naik.',
        hourCost: 0,
        prepPoints: 0,
        feedback:
          'Saat air naik, tidak ada waktu berkemas. Tas siaga harus siap sebelum bencana datang.',
      },
    ],
  },
  {
    id: 'atap',
    name: 'Atap & Selokan',
    hotspot: {
      x: 690,
      y: 648,
    },
    camera: {
      x: 720,
      zoom: 1.55,
      y: 610,
    },
    prompt:
      'Ayah memanggil dari halaman. Talang penuh daun dan selokan depan rumah tersumbat sampah.',
    options: [
      {
        text: 'Bantu Ayah membersihkan talang dan selokan, lalu angkat barang elektronik ke tempat tinggi.',
        hourCost: 2,
        prepPoints: 15,
        feedback:
          'Selokan yang lancar mengurangi genangan, dan barang di tempat tinggi aman dari air. Kerja tim!',
      },
      {
        text: 'Lihat sebentar dari bawah, lalu masuk lagi.',
        hourCost: 1,
        prepPoints: 4,
        feedback:
          'Melihat saja tidak mengubah apa pun. Selokan tersumbat memperparah banjir di depan rumah.',
      },
      {
        text: 'Biar Ayah saja yang mengerjakan.',
        hourCost: 0,
        prepPoints: 0,
        feedback: 'Kesiapsiagaan adalah kerja tim keluarga. Bantuanmu mempercepat semuanya.',
      },
    ],
  },
  {
    id: 'sungai',
    name: 'Tepi Sungai · Tanggul',
    hotspot: {
      x: 2080,
      y: 500,
    },
    camera: {
      x: 2160,
      zoom: 1.22,
      y: 566,
    },
    prompt:
      'Warga berkumpul di tanggul. Papan ukur ketinggian air sudah menyentuh garis kuning: status Waspada.',
    options: [
      {
        text: 'Bantu menyusun karung pasir dan catat ketinggian air tiap jam untuk dilaporkan ke Pak RT.',
        hourCost: 3,
        prepPoints: 18,
        feedback:
          'Memantau ketinggian air dan memperkuat tanggul adalah langkah nyata mengurangi risiko banjir.',
      },
      {
        text: 'Berfoto di tepi sungai untuk story.',
        hourCost: 1,
        prepPoints: 2,
        safetyDelta: -5,
        feedback:
          'Tepi sungai saat air naik itu berbahaya — arus bisa tiba-tiba deras. Jaga jarak dari bibir sungai!',
      },
      {
        text: 'Lewati, pulang saja.',
        hourCost: 0,
        prepPoints: 0,
        feedback: 'Tanggul yang kuat melindungi seluruh kampung, bukan hanya rumahmu.',
      },
    ],
  },
  {
    id: 'balai',
    name: 'Balai Warga',
    hotspot: {
      x: 1660,
      y: 470,
    },
    camera: {
      x: 1660,
      zoom: 1.35,
      y: 500,
    },
    prompt: 'Pak RT mengadakan rapat siaga. Ada peta jalur evakuasi dan pembagian tugas warga.',
    options: [
      {
        text: 'Ikut rapat: catat jalur evakuasi, titik kumpul, dan arti bunyi kentongan atau sirene.',
        hourCost: 2,
        prepPoints: 18,
        feedback:
          'Mengetahui jalur dan titik kumpul menghemat waktu berharga saat evakuasi. Kentongan bertalu-talu artinya bahaya!',
      },
      {
        text: 'Tanya Pak RT sebentar di pintu, lalu pulang.',
        hourCost: 1,
        prepPoints: 8,
        feedback:
          'Lumayan, tapi detail penting seperti tanda bahaya dan titik kumpul bisa terlewat.',
      },
      {
        text: 'Lewati, rapat itu urusan orang dewasa.',
        hourCost: 0,
        prepPoints: 0,
        feedback: 'Remaja juga bagian dari tim siaga kampung. Suaramu dan tenagamu dibutuhkan.',
      },
    ],
  },
  {
    id: 'nenek',
    name: 'Rumah Nenek & Oyen',
    hotspot: {
      x: 470,
      y: 520,
    },
    camera: {
      x: 470,
      zoom: 1.45,
      y: 530,
    },
    prompt:
      'Nenek tinggal di rumah kecil dekat lereng bukit. Kucing Oyen tidur di kandang bambu di terasnya.',
    options: [
      {
        text: 'Siapkan obat rutin Nenek, pindahkan barang berharga ke rak atas, siapkan kandang angkut dan makanan Oyen.',
        hourCost: 2,
        prepPoints: 16,
        feedback:
          'Lansia, anak kecil, dan hewan peliharaan butuh persiapan khusus — kamu sudah memikirkannya!',
      },
      {
        text: 'Pindahkan TV Nenek ke atas lemari saja.',
        hourCost: 1,
        prepPoints: 5,
        feedback: 'Obat Nenek lebih penting daripada TV. Prioritaskan yang menyelamatkan nyawa.',
      },
      {
        text: 'Lewati, Nenek pasti sudah tahu.',
        hourCost: 0,
        prepPoints: 0,
        feedback: 'Rumah di dekat lereng paling rawan longsor. Nenek sangat perlu bantuanmu.',
      },
    ],
  },
]
