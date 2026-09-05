/**
 * The scoring layer, kept beside the extractor so that regenerating src/data/ from
 * the original .dc.html cannot silently drop it.
 *
 * The original game scored `safety + preparedness + timePoints` against a hardcoded
 * maximum. That let a player who prepared nothing reach the top ending, and made
 * preparedness a number with no consequence. This table replaces it: every option
 * feeds one or two of four competencies, and six phase-1 actions leave behind a
 * *tag* that phase 2 reads — unlocking a better option, softening a wrong one, or
 * buying thinking seconds.
 *
 * Awards are never negative. Wrong answers are punished by strikes and by safety,
 * not by taking competency back.
 *
 * Safety itself only moves in phase 2: the correct answer and any unlocked option
 * cost or gain nothing, and a wrong answer always costs exactly one of two amounts —
 * -50 for a major mistake, -25 for a moderate one. Each card's `safety` array below
 * overrides the original's finer-grained deltas onto that scale, index-for-index
 * with its three base options.
 */

// --------------------------------------------------------------- phase 1 ----

/** Keyed by spot id, one award per option (best / partial / skip). */
export const PHASE1_AWARDS = {
  radio: [{ informasi: 16 }, { informasi: 4 }, {}],
  dapur: [{ logistik: 20 }, { logistik: 6 }, {}],
  atap: [{ mitigasi: 12, logistik: 6 }, { mitigasi: 3 }, {}],
  sungai: [{ mitigasi: 14, informasi: 6 }, {}, {}],
  balai: [{ informasi: 12, rentan: 6 }, { informasi: 5 }, {}],
  nenek: [{ rentan: 20 }, { rentan: 5 }, {}],
}

/**
 * What each spot's *best* option leaves you holding. Only option 0 grants a tag —
 * that is what makes preparation mechanical rather than decorative.
 *
 * All six together cost 12 hours against a 10-hour budget, so a run can hold at
 * most five. Choosing which five is the core trade-off of phase 1.
 */
export const PHASE1_TAGS = {
  radio: 'info-resmi',
  dapur: 'tas-siaga',
  atap: 'rumah-aman',
  sungai: 'jaringan-warga',
  balai: 'peta-evakuasi',
  nenek: 'rencana-rentan',
}

// --------------------------------------------------------------- phase 3 ----

export const PHASE3_AWARDS = {
  rumah: [{ logistik: 8, rentan: 6 }, { logistik: 3 }, {}],
  air: [{ logistik: 10, rentan: 4 }, {}, {}],
  posko: [{ rentan: 12 }, { rentan: 3 }, {}],
  rapat: [{ mitigasi: 12, informasi: 6 }, { rentan: 3 }, {}],
  lereng: [{ mitigasi: 18 }, { mitigasi: 5 }, {}],
  darto: [{ rentan: 8, mitigasi: 4 }, { rentan: 2 }, {}],
}

// --------------------------------------------------------------- phase 2 ----

/**
 * Per card, in order. `awards` matches the three base options; only the correct one
 * scores. `locked` is a fourth option that appears when the run holds the tag —
 * it counts as correct, so it never costs a strike. `shields` soften a wrong
 * option's safety hit (the strike still lands). `extraSeconds` buys thinking time.
 */
export const PHASE2_SCORING = [
  {
    // Kentongan bertalu-talu
    // B "Keluar sendirian melihat sungai dalam gelap" (moderate) vs C "Lanjut
    // tidur" (major — sleeping through the warning costs the whole family its
    // lead time).
    safety: [0, -25, -50],
    awards: [{ informasi: 10 }, {}, {}],
    locked: [
      {
        requiresTag: 'peta-evakuasi',
        text: 'Kamu hafal isyaratnya dari rapat RT: bertalu-talu berarti bahaya. Bangunkan semua, bagi tugas sesuai rencana, letakkan tas siaga di dekat pintu.',
        safetyDelta: 0,
        award: { informasi: 10, mitigasi: 4 },
        feedback:
          'Karena kamu ikut rapat siaga, tidak ada satu detik pun yang terbuang untuk bertanya-tanya. Keluarga bergerak seperti satu tim.',
      },
    ],
    extraSeconds: [{ requiresTag: 'info-resmi', seconds: 5 }],
  },
  {
    // Air masuk rumah
    // B "Selamatkan TV dan laptop dulu" (major — electronics in moving water
    // can electrocute) vs C "Menerjang air keluar rumah" (moderate).
    safety: [0, -50, -25],
    awards: [{ logistik: 8, informasi: 4 }, {}, {}],
    locked: [
      {
        requiresTag: 'rumah-aman',
        text: 'Turunkan MCB — letaknya sudah kamu hafal saat membereskan rumah kemarin — ambil tas siaga, lalu naik bersama keluarga lewat tangga yang sudah dikosongkan.',
        safetyDelta: 0,
        award: { logistik: 10, informasi: 4 },
        feedback:
          'Rumah yang sudah disiapkan menghemat menit-menit yang paling mahal. Listrik mati, tas terbawa, semua naik bersama.',
      },
    ],
    shields: [{ requiresTag: 'tas-siaga', optionIndex: 1, multiplier: 0.5 }],
    extraSeconds: [{ requiresTag: 'rumah-aman', seconds: 5 }],
  },
  {
    // Nenek sulit berjalan
    // B "Tinggalkan Nenek dulu" (major — Nenek is left to fall) vs C "Gendong
    // Dito dan lari duluan" (moderate — Nenek is only frightened, not hurt).
    safety: [0, -50, -25],
    awards: [{ rentan: 12 }, {}, {}],
    locked: [
      {
        requiresTag: 'rencana-rentan',
        text: 'Sampirkan tas obat Nenek yang sudah disiapkan ke bahu Ayah, gandeng Nenek dari dua sisi, dan berikan Dito senter kecil supaya ia merasa bertugas.',
        safetyDelta: 0,
        award: { rentan: 14 },
        feedback:
          'Karena obat dan rencana Nenek sudah disiapkan sejak siang, tidak ada yang perlu dicari dalam gelap. Dito pun berhenti menangis karena merasa dilibatkan.',
      },
    ],
    extraSeconds: [{ requiresTag: 'rencana-rentan', seconds: 5 }],
  },
  {
    // Oyen hilang!
    // B "Terjun ke arus mengejar Oyen" (major — the player is swept and hurt)
    // vs C "Biarkan saja" (moderate).
    safety: [0, -50, -25],
    awards: [{ rentan: 8 }, {}, {}],
    locked: [
      {
        requiresTag: 'rencana-rentan',
        text: 'Turunkan kandang angkut Oyen dengan tali dari jendela loteng, panggil namanya — tanpa sekali pun turun ke arus.',
        safetyDelta: 0,
        award: { rentan: 10 },
        family: { oyen: 'aman' },
        feedback:
          'Oyen masuk ke kandangnya sendiri karena sudah terbiasa. Menolong hewan itu baik, dan lebih baik lagi kalau sudah direncanakan.',
      },
    ],
    shields: [{ requiresTag: 'rencana-rentan', optionIndex: 1, multiplier: 0.6 }],
  },
  {
    // Pak Darto menolak mengungsi
    // B "Biarkan, urus keluarga sendiri" (moderate) vs C "Berdebat lama"
    // (major — wastes the most time and leaves Pak Darto most exposed).
    safety: [0, -25, -50],
    awards: [{ informasi: 6, rentan: 6 }, {}, {}],
    locked: [
      {
        requiresTag: 'info-resmi',
        text: 'Tunjukkan layar HP: status Awas dari BMKG dan jadwal jemputan tim RT, lalu tawarkan membawakan tas Pak Darto ke perahu.',
        safetyDelta: 0,
        award: { informasi: 8, rentan: 6 },
        family: { tetangga: 'aman' },
        feedback:
          'Bukti di layar lebih kuat daripada perdebatan. Pak Darto diam sebentar, lalu mengambil jaketnya.',
      },
    ],
    extraSeconds: [{ requiresTag: 'jaringan-warga', seconds: 5 }],
  },
  {
    // Jalur evakuasi
    // B "Memotong lereng bukit" (major — straight into the landslide zone) vs
    // C "Tetap menunggu di loteng" (moderate).
    safety: [0, -50, -25],
    awards: [{ informasi: 8, mitigasi: 4 }, {}, {}],
    locked: [
      {
        requiresTag: 'peta-evakuasi',
        text: 'Tunjukkan jalur resmi yang kamu catat di rapat RT, sebutkan nama titik kumpul dan jumlah anggota keluarga kepada petugas perahu.',
        safetyDelta: 0,
        award: { informasi: 10, mitigasi: 4 },
        feedback:
          'Petugas tidak perlu berpikir dua kali. Jalur atas tanggul memang memutar, tapi itu satu-satunya yang sudah dinyatakan aman.',
      },
    ],
    shields: [{ requiresTag: 'jaringan-warga', optionIndex: 1, multiplier: 0.5 }],
  },
  {
    // TANAH LONGSOR!
    // B "Berlindung di bawah pohon besar" (major — Ayah is hurt by a falling
    // branch) vs C "Berbalik kembali ke rumah Nenek" (moderate).
    safety: [0, -50, -25],
    awards: [{ mitigasi: 12 }, {}, {}],
    locked: [
      {
        requiresTag: 'jaringan-warga',
        text: 'Teriakkan peringatan ke warga lain sambil menjauh menyamping dari jalur longsoran, menuju tanah tinggi terbuka yang sudah ditandai papan rawan.',
        safetyDelta: 0,
        award: { mitigasi: 14 },
        feedback:
          'Menjauh tegak lurus dari jalur material, dan tidak sendirian. Papan tanda yang kalian pasang bersama kini menyelamatkan lebih dari satu keluarga.',
      },
    ],
    extraSeconds: [{ requiresTag: 'peta-evakuasi', seconds: 5 }],
  },
  {
    // Di posko pengungsian
    // B "Langsung pulang mengecek rumah" (major — live wires and aftershocks)
    // vs C "Duduk diam di pojok, tidak lapor" (moderate).
    safety: [0, -50, -25],
    awards: [{ informasi: 6, rentan: 4 }, {}, {}],
    locked: [
      {
        requiresTag: 'tas-siaga',
        text: 'Serahkan fotokopi KK dan KTP dari tas siaga ke meja pendataan, minta pemeriksaan untuk Nenek dan Dito, lalu catat nomor kontak posko.',
        safetyDelta: 0,
        award: { informasi: 8, rentan: 4 },
        feedback:
          'Dokumen dalam plastik itu tetap kering. Pendataan selesai dalam dua menit dan bantuan untuk Nenek langsung tercatat.',
      },
    ],
    extraSeconds: [{ requiresTag: 'info-resmi', seconds: 5 }],
  },
]

/** Option 0 is the correct answer on every card; explicit beats derived. */
export const CORRECT_OPTION_INDEX = 0
