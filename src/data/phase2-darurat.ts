// GENERATED from docs/original/Siaga Banjir.dc.html by scripts/extract-data.mjs.
// Content is the original game's; only the key names were expanded.

import type { CrisisCard } from './types'

/** Fase 2 — Tanggap Darurat: delapan keputusan krisis berbatas waktu. */
export const PHASE2_CARDS: readonly CrisisCard[] = [
  {
    title: 'Kentongan bertalu-talu',
    text: 'Pukul 01.00. Hujan deras sudah 5 jam tanpa henti, listrik padam. Dari balai warga terdengar kentongan bertalu-talu.',
    timeoutOptionIndex: 2,
    camera: {
      x: 1240,
      zoom: 0.88,
      y: 470,
    },
    options: [
      {
        text: 'Nyalakan senter, bangunkan seluruh keluarga, cek info resmi dari HP.',
        safetyDelta: 15,
        feedback:
          'Kentongan bertalu-talu adalah tanda bahaya. Kamu bergerak cepat dan tenang — itu kunci.',
      },
      {
        text: 'Keluar sendirian melihat sungai dalam gelap.',
        safetyDelta: -10,
        family: {
          adik: 'cemas',
        },
        feedback:
          'Keluar sendiri dalam gelap dan hujan deras sangat berisiko. Adik Dito panik mencarimu.',
      },
      {
        text: 'Lanjut tidur, mungkin hanya latihan.',
        safetyDelta: -15,
        feedback:
          'Mengabaikan tanda bahaya membuat keluarga kehilangan waktu berharga untuk bersiap.',
      },
    ],
  },
  {
    title: 'Air masuk rumah',
    text: 'Air keruh menerobos pintu, setinggi mata kaki dan terus naik. Ibu bertanya harus bagaimana.',
    timeoutOptionIndex: 2,
    camera: {
      x: 860,
      zoom: 1.5,
      y: 570,
    },
    options: [
      {
        text: 'Matikan listrik dari MCB, ambil tas siaga, naik ke tempat yang lebih tinggi bersama keluarga.',
        safetyDelta: 15,
        feedback:
          'Listrik dan air adalah kombinasi mematikan. Mematikan MCB lalu naik ke tempat tinggi adalah urutan yang tepat.',
      },
      {
        text: 'Selamatkan TV dan laptop dulu.',
        safetyDelta: -10,
        feedback:
          'Barang bisa diganti, nyawa tidak. Dan menyentuh elektronik di air yang mengalir bisa menyetrum.',
      },
      {
        text: 'Menerjang air keluar rumah tanpa rencana.',
        safetyDelta: -8,
        feedback:
          'Air setinggi 30 cm yang mengalir sudah bisa menyeret orang. Jangan menerjang arus.',
      },
    ],
  },
  {
    title: 'Nenek sulit berjalan',
    text: 'Kalian harus naik ke loteng. Nenek kesulitan berjalan di air, Adik Dito menangis ketakutan.',
    timeoutOptionIndex: 1,
    camera: {
      x: 830,
      zoom: 1.45,
      y: 510,
    },
    options: [
      {
        text: 'Tenangkan Dito, gandeng Nenek bersama Ayah, bergerak pelan-pelan bersama.',
        safetyDelta: 15,
        feedback:
          'Bergerak bersama sebagai satu tim memastikan tidak ada yang tertinggal atau terjatuh.',
      },
      {
        text: 'Tinggalkan Nenek dulu, cari bantuan ke luar.',
        safetyDelta: -12,
        family: {
          nenek: 'terluka',
        },
        feedback:
          'Nenek terpeleset saat ditinggal. Kelompok rentan tidak boleh ditinggal sendirian.',
      },
      {
        text: 'Gendong Dito dan lari duluan ke atas.',
        safetyDelta: -8,
        family: {
          nenek: 'cemas',
        },
        feedback: 'Dito aman, tapi Nenek tertinggal dalam gelap. Utamakan yang paling rentan.',
      },
    ],
  },
  {
    title: 'Oyen hilang!',
    text: 'Dari jendela loteng kamu melihat Oyen terjebak di pagar halaman, air deras mengalir di sekitarnya.',
    timeoutOptionIndex: 2,
    camera: {
      x: 1000,
      zoom: 1.8,
      y: 560,
    },
    options: [
      {
        text: 'Panggil Oyen dari tempat aman, ulurkan galah/keranjang, jangan masuk ke arus.',
        safetyDelta: 10,
        feedback:
          'Oyen berhasil melompat ke keranjang! Menolong hewan boleh, tapi tanpa membahayakan diri sendiri.',
      },
      {
        text: 'Terjun ke arus mengejar Oyen.',
        safetyDelta: -20,
        family: {
          oyen: 'aman',
          adik: 'cemas',
        },
        feedback:
          'Kamu terseret dan terbentur pagar. Oyen selamat sendiri, tapi kamu cedera. Arus deras tidak bisa dilawan.',
      },
      {
        text: 'Biarkan saja, tidak ada waktu.',
        safetyDelta: -3,
        family: {
          oyen: 'cemas',
        },
        feedback:
          'Oyen akhirnya naik ke pohon sendiri, basah dan ketakutan. Hewan peliharaan juga bagian dari rencana siaga.',
      },
    ],
  },
  {
    title: 'Pak Darto menolak mengungsi',
    text: 'Tetangga sebelah, Pak Darto, berteriak dari jendela: “Banjir tiap tahun juga begini, nggak perlu ngungsi!”',
    timeoutOptionIndex: 1,
    camera: {
      x: 1230,
      zoom: 1.5,
      y: 540,
    },
    options: [
      {
        text: 'Sampaikan status Awas dari BMKG dan ajak ikut tim RT yang datang menjemput.',
        safetyDelta: 12,
        feedback:
          'Informasi resmi yang disampaikan tenang lebih meyakinkan daripada berdebat. Pak Darto ikut mengungsi.',
      },
      {
        text: 'Biarkan, urus keluarga sendiri saja.',
        safetyDelta: -5,
        family: {
          tetangga: 'terlambat',
        },
        feedback:
          'Pak Darto baru dievakuasi tim SAR dini hari saat air sudah sedada. Tetangga adalah keluarga terdekat kita.',
      },
      {
        text: 'Berdebat lama sampai Pak Darto marah.',
        safetyDelta: -8,
        family: {
          tetangga: 'cemas',
        },
        feedback: 'Waktu terbuang dan Pak Darto makin keras kepala. Sampaikan fakta, bukan emosi.',
      },
    ],
  },
  {
    title: 'Jalur evakuasi',
    text: 'Perahu karet tim RT merapat ke atap. Ada dua jalur ke titik kumpul: memutar lewat jalan atas tanggul di kanan, atau memotong lereng bukit di kiri yang tanahnya retak-retak.',
    timeoutOptionIndex: 2,
    camera: {
      x: 900,
      zoom: 1.28,
      y: 480,
    },
    options: [
      {
        text: 'Lewat jalan atas tanggul ke titik kumpul resmi, meski memutar.',
        safetyDelta: 15,
        feedback:
          'Jalur resmi sudah dipetakan aman. Lereng yang retak setelah hujan lebat adalah tanda longsor.',
      },
      {
        text: 'Memotong lereng bukit, lebih cepat.',
        safetyDelta: -15,
        family: {
          ayah: 'cemas',
        },
        feedback:
          'Retakan tanah, pohon miring, dan air keruh dari lereng adalah tanda longsor. Kalian nyaris terjebak!',
      },
      {
        text: 'Tetap menunggu di loteng rumah.',
        safetyDelta: -10,
        feedback:
          'Air masih naik dan bantuan sudah datang — menunda evakuasi hanya menambah bahaya.',
      },
    ],
  },
  {
    title: 'TANAH LONGSOR!',
    text: 'Terdengar gemuruh dari lereng bukit di belakang rumah Nenek. Tanah bergetar, pohon-pohon miring!',
    timeoutOptionIndex: 2,
    camera: {
      x: 520,
      zoom: 0.85,
      y: 470,
    },
    options: [
      {
        text: 'Menjauh dari lereng ke arah tegak lurus jalur longsor, ke tanah tinggi yang terbuka.',
        safetyDelta: 15,
        feedback:
          'Benar! Menjauh menyamping dari jalur longsoran, bukan berlari ke bawah searah material yang jatuh.',
      },
      {
        text: 'Berlindung di bawah pohon besar di kaki lereng.',
        safetyDelta: -15,
        family: {
          ayah: 'terluka',
        },
        feedback: 'Pohon di lereng bisa ikut tumbang. Ayah tertimpa dahan saat melindungi kalian.',
      },
      {
        text: 'Berbalik kembali ke rumah Nenek mengambil barang.',
        safetyDelta: -12,
        family: {
          nenek: 'cemas',
        },
        feedback: 'Rumah Nenek tertimbun sebagian. Jangan pernah kembali ke zona longsor.',
      },
    ],
  },
  {
    title: 'Di posko pengungsian',
    text: 'Kalian tiba di posko di tanah tinggi. Dari sini terlihat air terus meninggi hampir menyentuh atap rumah. Petugas BPBD membuka meja pendataan.',
    timeoutOptionIndex: 2,
    camera: {
      x: 1900,
      zoom: 0.6,
      y: 430,
    },
    options: [
      {
        text: 'Lapor data keluarga ke petugas, minta pemeriksaan kesehatan untuk Nenek dan Dito.',
        safetyDelta: 10,
        feedback:
          'Pendataan membantu petugas menyalurkan bantuan dan memastikan tidak ada yang hilang.',
      },
      {
        text: 'Langsung pulang mengecek rumah.',
        safetyDelta: -10,
        feedback:
          'Air belum surut, listrik bisa tersambung lagi tiba-tiba, dan longsor susulan mungkin terjadi. Tunggu pernyataan aman.',
      },
      {
        text: 'Duduk diam di pojok, tidak lapor.',
        safetyDelta: -2,
        feedback:
          'Kalian aman tapi tidak tercatat — bantuan makanan dan obat jadi terlambat sampai.',
      },
    ],
  },
]
