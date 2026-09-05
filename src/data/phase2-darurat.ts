// GENERATED from docs/original/Siaga Banjir.dc.html by scripts/extract-data.mjs.
// Content is the original game's; only the key names were expanded.
// Competency awards, prep tags and phase-2 couplings are not from the original —
// they live in scripts/scoring-table.mjs. Edit them there, not here.

import type { CrisisCard } from './types'

/** Fase 2 — Tanggap Darurat: delapan keputusan krisis berbatas waktu. */
export const PHASE2_CARDS: readonly CrisisCard[] = [
  {
    "title": "Kentongan bertalu-talu",
    "text": "Pukul 01.00. Hujan deras sudah 5 jam tanpa henti, listrik padam. Dari balai warga terdengar kentongan bertalu-talu.",
    "timeoutOptionIndex": 2,
    "correctOptionIndex": 0,
    "camera": {
      "x": 1240,
      "zoom": 0.88,
      "y": 470
    },
    "options": [
      {
        "text": "Nyalakan senter, bangunkan seluruh keluarga, cek info resmi dari HP.",
        "safetyDelta": 0,
        "feedback": "Kentongan bertalu-talu adalah tanda bahaya. Kamu bergerak cepat dan tenang — itu kunci.",
        "award": {
          "informasi": 10
        }
      },
      {
        "text": "Keluar sendirian melihat sungai dalam gelap.",
        "safetyDelta": -25,
        "family": {
          "adik": "cemas"
        },
        "feedback": "Keluar sendiri dalam gelap dan hujan deras sangat berisiko. Adik Dito panik mencarimu."
      },
      {
        "text": "Lanjut tidur, mungkin hanya latihan.",
        "safetyDelta": -50,
        "feedback": "Mengabaikan tanda bahaya membuat keluarga kehilangan waktu berharga untuk bersiap."
      }
    ],
    "lockedOptions": [
      {
        "requiresTag": "peta-evakuasi",
        "text": "Kamu hafal isyaratnya dari rapat RT: bertalu-talu berarti bahaya. Bangunkan semua, bagi tugas sesuai rencana, letakkan tas siaga di dekat pintu.",
        "safetyDelta": 0,
        "feedback": "Karena kamu ikut rapat siaga, tidak ada satu detik pun yang terbuang untuk bertanya-tanya. Keluarga bergerak seperti satu tim.",
        "award": {
          "informasi": 10,
          "mitigasi": 4
        }
      }
    ],
    "extraSeconds": [
      {
        "requiresTag": "info-resmi",
        "seconds": 5
      }
    ]
  },
  {
    "title": "Air masuk rumah",
    "text": "Air keruh menerobos pintu, setinggi mata kaki dan terus naik. Ibu bertanya harus bagaimana.",
    "timeoutOptionIndex": 2,
    "correctOptionIndex": 0,
    "camera": {
      "x": 860,
      "zoom": 1.5,
      "y": 570
    },
    "options": [
      {
        "text": "Matikan listrik dari MCB, ambil tas siaga, naik ke tempat yang lebih tinggi bersama keluarga.",
        "safetyDelta": 0,
        "feedback": "Listrik dan air adalah kombinasi mematikan. Mematikan MCB lalu naik ke tempat tinggi adalah urutan yang tepat.",
        "award": {
          "logistik": 8,
          "informasi": 4
        }
      },
      {
        "text": "Selamatkan TV dan laptop dulu.",
        "safetyDelta": -50,
        "feedback": "Barang bisa diganti, nyawa tidak. Dan menyentuh elektronik di air yang mengalir bisa menyetrum."
      },
      {
        "text": "Menerjang air keluar rumah tanpa rencana.",
        "safetyDelta": -25,
        "feedback": "Air setinggi 30 cm yang mengalir sudah bisa menyeret orang. Jangan menerjang arus."
      }
    ],
    "lockedOptions": [
      {
        "requiresTag": "rumah-aman",
        "text": "Turunkan MCB — letaknya sudah kamu hafal saat membereskan rumah kemarin — ambil tas siaga, lalu naik bersama keluarga lewat tangga yang sudah dikosongkan.",
        "safetyDelta": 0,
        "feedback": "Rumah yang sudah disiapkan menghemat menit-menit yang paling mahal. Listrik mati, tas terbawa, semua naik bersama.",
        "award": {
          "logistik": 10,
          "informasi": 4
        }
      }
    ],
    "shields": [
      {
        "requiresTag": "tas-siaga",
        "optionIndex": 1,
        "multiplier": 0.5
      }
    ],
    "extraSeconds": [
      {
        "requiresTag": "rumah-aman",
        "seconds": 5
      }
    ]
  },
  {
    "title": "Nenek sulit berjalan",
    "text": "Kalian harus naik ke loteng. Nenek kesulitan berjalan di air, Adik Dito menangis ketakutan.",
    "timeoutOptionIndex": 1,
    "correctOptionIndex": 0,
    "camera": {
      "x": 830,
      "zoom": 1.45,
      "y": 510
    },
    "options": [
      {
        "text": "Tenangkan Dito, gandeng Nenek bersama Ayah, bergerak pelan-pelan bersama.",
        "safetyDelta": 0,
        "feedback": "Bergerak bersama sebagai satu tim memastikan tidak ada yang tertinggal atau terjatuh.",
        "award": {
          "rentan": 12
        }
      },
      {
        "text": "Tinggalkan Nenek dulu, cari bantuan ke luar.",
        "safetyDelta": -50,
        "family": {
          "nenek": "terluka"
        },
        "feedback": "Nenek terpeleset saat ditinggal. Kelompok rentan tidak boleh ditinggal sendirian."
      },
      {
        "text": "Gendong Dito dan lari duluan ke atas.",
        "safetyDelta": -25,
        "family": {
          "nenek": "cemas"
        },
        "feedback": "Dito aman, tapi Nenek tertinggal dalam gelap. Utamakan yang paling rentan."
      }
    ],
    "lockedOptions": [
      {
        "requiresTag": "rencana-rentan",
        "text": "Sampirkan tas obat Nenek yang sudah disiapkan ke bahu Ayah, gandeng Nenek dari dua sisi, dan berikan Dito senter kecil supaya ia merasa bertugas.",
        "safetyDelta": 0,
        "feedback": "Karena obat dan rencana Nenek sudah disiapkan sejak siang, tidak ada yang perlu dicari dalam gelap. Dito pun berhenti menangis karena merasa dilibatkan.",
        "award": {
          "rentan": 14
        }
      }
    ],
    "extraSeconds": [
      {
        "requiresTag": "rencana-rentan",
        "seconds": 5
      }
    ]
  },
  {
    "title": "Oyen hilang!",
    "text": "Dari jendela loteng kamu melihat Oyen terjebak di pagar halaman, air deras mengalir di sekitarnya.",
    "timeoutOptionIndex": 2,
    "correctOptionIndex": 0,
    "camera": {
      "x": 1000,
      "zoom": 1.8,
      "y": 560
    },
    "options": [
      {
        "text": "Panggil Oyen dari tempat aman, ulurkan galah/keranjang, jangan masuk ke arus.",
        "safetyDelta": 0,
        "feedback": "Oyen berhasil melompat ke keranjang! Menolong hewan boleh, tapi tanpa membahayakan diri sendiri.",
        "award": {
          "rentan": 8
        }
      },
      {
        "text": "Terjun ke arus mengejar Oyen.",
        "safetyDelta": -50,
        "family": {
          "oyen": "aman",
          "adik": "cemas"
        },
        "feedback": "Kamu terseret dan terbentur pagar. Oyen selamat sendiri, tapi kamu cedera. Arus deras tidak bisa dilawan."
      },
      {
        "text": "Biarkan saja, tidak ada waktu.",
        "safetyDelta": -25,
        "family": {
          "oyen": "cemas"
        },
        "feedback": "Oyen akhirnya naik ke pohon sendiri, basah dan ketakutan. Hewan peliharaan juga bagian dari rencana siaga."
      }
    ],
    "lockedOptions": [
      {
        "requiresTag": "rencana-rentan",
        "text": "Turunkan kandang angkut Oyen dengan tali dari jendela loteng, panggil namanya — tanpa sekali pun turun ke arus.",
        "safetyDelta": 0,
        "family": {
          "oyen": "aman"
        },
        "feedback": "Oyen masuk ke kandangnya sendiri karena sudah terbiasa. Menolong hewan itu baik, dan lebih baik lagi kalau sudah direncanakan.",
        "award": {
          "rentan": 10
        }
      }
    ],
    "shields": [
      {
        "requiresTag": "rencana-rentan",
        "optionIndex": 1,
        "multiplier": 0.6
      }
    ]
  },
  {
    "title": "Pak Darto menolak mengungsi",
    "text": "Tetangga sebelah, Pak Darto, berteriak dari jendela: “Banjir tiap tahun juga begini, nggak perlu ngungsi!”",
    "timeoutOptionIndex": 1,
    "correctOptionIndex": 0,
    "camera": {
      "x": 1230,
      "zoom": 1.5,
      "y": 540
    },
    "options": [
      {
        "text": "Sampaikan status Awas dari BMKG dan ajak ikut tim RT yang datang menjemput.",
        "safetyDelta": 0,
        "feedback": "Informasi resmi yang disampaikan tenang lebih meyakinkan daripada berdebat. Pak Darto ikut mengungsi.",
        "award": {
          "informasi": 6,
          "rentan": 6
        }
      },
      {
        "text": "Biarkan, urus keluarga sendiri saja.",
        "safetyDelta": -25,
        "family": {
          "tetangga": "terlambat"
        },
        "feedback": "Pak Darto baru dievakuasi tim SAR dini hari saat air sudah sedada. Tetangga adalah keluarga terdekat kita."
      },
      {
        "text": "Berdebat lama sampai Pak Darto marah.",
        "safetyDelta": -50,
        "family": {
          "tetangga": "cemas"
        },
        "feedback": "Waktu terbuang dan Pak Darto makin keras kepala. Sampaikan fakta, bukan emosi."
      }
    ],
    "lockedOptions": [
      {
        "requiresTag": "info-resmi",
        "text": "Tunjukkan layar HP: status Awas dari BMKG dan jadwal jemputan tim RT, lalu tawarkan membawakan tas Pak Darto ke perahu.",
        "safetyDelta": 0,
        "family": {
          "tetangga": "aman"
        },
        "feedback": "Bukti di layar lebih kuat daripada perdebatan. Pak Darto diam sebentar, lalu mengambil jaketnya.",
        "award": {
          "informasi": 8,
          "rentan": 6
        }
      }
    ],
    "extraSeconds": [
      {
        "requiresTag": "jaringan-warga",
        "seconds": 5
      }
    ]
  },
  {
    "title": "Jalur evakuasi",
    "text": "Perahu karet tim RT merapat ke atap. Ada dua jalur ke titik kumpul: memutar lewat jalan atas tanggul di kanan, atau memotong lereng bukit di kiri yang tanahnya retak-retak.",
    "timeoutOptionIndex": 2,
    "correctOptionIndex": 0,
    "camera": {
      "x": 900,
      "zoom": 1.28,
      "y": 480
    },
    "options": [
      {
        "text": "Lewat jalan atas tanggul ke titik kumpul resmi, meski memutar.",
        "safetyDelta": 0,
        "feedback": "Jalur resmi sudah dipetakan aman. Lereng yang retak setelah hujan lebat adalah tanda longsor.",
        "award": {
          "informasi": 8,
          "mitigasi": 4
        }
      },
      {
        "text": "Memotong lereng bukit, lebih cepat.",
        "safetyDelta": -50,
        "family": {
          "ayah": "cemas"
        },
        "feedback": "Retakan tanah, pohon miring, dan air keruh dari lereng adalah tanda longsor. Kalian nyaris terjebak!"
      },
      {
        "text": "Tetap menunggu di loteng rumah.",
        "safetyDelta": -25,
        "feedback": "Air masih naik dan bantuan sudah datang — menunda evakuasi hanya menambah bahaya."
      }
    ],
    "lockedOptions": [
      {
        "requiresTag": "peta-evakuasi",
        "text": "Tunjukkan jalur resmi yang kamu catat di rapat RT, sebutkan nama titik kumpul dan jumlah anggota keluarga kepada petugas perahu.",
        "safetyDelta": 0,
        "feedback": "Petugas tidak perlu berpikir dua kali. Jalur atas tanggul memang memutar, tapi itu satu-satunya yang sudah dinyatakan aman.",
        "award": {
          "informasi": 10,
          "mitigasi": 4
        }
      }
    ],
    "shields": [
      {
        "requiresTag": "jaringan-warga",
        "optionIndex": 1,
        "multiplier": 0.5
      }
    ]
  },
  {
    "title": "TANAH LONGSOR!",
    "text": "Terdengar gemuruh dari lereng bukit di belakang rumah Nenek. Tanah bergetar, pohon-pohon miring!",
    "timeoutOptionIndex": 2,
    "correctOptionIndex": 0,
    "camera": {
      "x": 520,
      "zoom": 0.85,
      "y": 470
    },
    "options": [
      {
        "text": "Menjauh dari lereng ke arah tegak lurus jalur longsor, ke tanah tinggi yang terbuka.",
        "safetyDelta": 0,
        "feedback": "Benar! Menjauh menyamping dari jalur longsoran, bukan berlari ke bawah searah material yang jatuh.",
        "award": {
          "mitigasi": 12
        }
      },
      {
        "text": "Berlindung di bawah pohon besar di kaki lereng.",
        "safetyDelta": -50,
        "family": {
          "ayah": "terluka"
        },
        "feedback": "Pohon di lereng bisa ikut tumbang. Ayah tertimpa dahan saat melindungi kalian."
      },
      {
        "text": "Berbalik kembali ke rumah Nenek mengambil barang.",
        "safetyDelta": -25,
        "family": {
          "nenek": "cemas"
        },
        "feedback": "Rumah Nenek tertimbun sebagian. Jangan pernah kembali ke zona longsor."
      }
    ],
    "lockedOptions": [
      {
        "requiresTag": "jaringan-warga",
        "text": "Teriakkan peringatan ke warga lain sambil menjauh menyamping dari jalur longsoran, menuju tanah tinggi terbuka yang sudah ditandai papan rawan.",
        "safetyDelta": 0,
        "feedback": "Menjauh tegak lurus dari jalur material, dan tidak sendirian. Papan tanda yang kalian pasang bersama kini menyelamatkan lebih dari satu keluarga.",
        "award": {
          "mitigasi": 14
        }
      }
    ],
    "extraSeconds": [
      {
        "requiresTag": "peta-evakuasi",
        "seconds": 5
      }
    ]
  },
  {
    "title": "Di posko pengungsian",
    "text": "Kalian tiba di posko di tanah tinggi. Dari sini terlihat air terus meninggi hampir menyentuh atap rumah. Petugas BPBD membuka meja pendataan.",
    "timeoutOptionIndex": 2,
    "correctOptionIndex": 0,
    "camera": {
      "x": 1900,
      "zoom": 0.6,
      "y": 430
    },
    "options": [
      {
        "text": "Lapor data keluarga ke petugas, minta pemeriksaan kesehatan untuk Nenek dan Dito.",
        "safetyDelta": 0,
        "feedback": "Pendataan membantu petugas menyalurkan bantuan dan memastikan tidak ada yang hilang.",
        "award": {
          "informasi": 6,
          "rentan": 4
        }
      },
      {
        "text": "Langsung pulang mengecek rumah.",
        "safetyDelta": -50,
        "feedback": "Air belum surut, listrik bisa tersambung lagi tiba-tiba, dan longsor susulan mungkin terjadi. Tunggu pernyataan aman."
      },
      {
        "text": "Duduk diam di pojok, tidak lapor.",
        "safetyDelta": -25,
        "feedback": "Kalian aman tapi tidak tercatat — bantuan makanan dan obat jadi terlambat sampai."
      }
    ],
    "lockedOptions": [
      {
        "requiresTag": "tas-siaga",
        "text": "Serahkan fotokopi KK dan KTP dari tas siaga ke meja pendataan, minta pemeriksaan untuk Nenek dan Dito, lalu catat nomor kontak posko.",
        "safetyDelta": 0,
        "feedback": "Dokumen dalam plastik itu tetap kering. Pendataan selesai dalam dua menit dan bantuan untuk Nenek langsung tercatat.",
        "award": {
          "informasi": 8,
          "rentan": 4
        }
      }
    ],
    "extraSeconds": [
      {
        "requiresTag": "info-resmi",
        "seconds": 5
      }
    ]
  }
]
