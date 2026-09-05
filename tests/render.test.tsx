/**
 * @vitest-environment jsdom
 *
 * Render smoke tests. The engine tests prove the rules; these prove the tree
 * actually mounts and that a real player can walk the whole game — the class of
 * failure (a bad style value, a missing guard in the scene) that a passing build
 * and green unit tests would both miss.
 */
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { App } from '@/App'
import { PHASE2_CARDS } from '@/data/phase2-darurat'
import { COMPETENCY_IDS, COMPETENCY_LABELS } from '@/data/types'

// jsdom has no Web Audio; the sound engine already bails out on its own, but stub
// the constructor so the intent is explicit.
beforeEach(() => {
  vi.stubGlobal('AudioContext', undefined)
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

const user = () => userEvent.setup()

const startGame = async () => {
  render(<App />)
  await user().click(screen.getByRole('button', { name: 'Mulai Bermain' }))
}

/** Skip the map and click through the whole reflection that follows it. */
const finishMapAndRecap = async (finish: RegExp, next: RegExp) => {
  const u = user()
  await u.click(screen.getByRole('button', { name: finish }))
  // Reflections run until the button changes from "Lanjut" to the phase link.
  for (let guard = 0; guard < 20; guard++) {
    const button = screen.queryByRole('button', { name: 'Lanjut' })
    if (!button) break
    await u.click(button)
  }
  await u.click(screen.getByRole('button', { name: next }))
}

describe('the game mounts and plays', () => {
  it('opens on the intro edition', () => {
    render(<App />)
    expect(screen.getByText('Warta Siaga')).toBeDefined()
    expect(screen.getByText('Hujan Tak Kunjung Reda di Kampung Tepi Sungai')).toBeDefined()
    expect(screen.getByRole('button', { name: 'Mulai Bermain' })).toBeDefined()
  })

  it('shows the safety gauge, the four competency bars, and the whole household', () => {
    render(<App />)
    const labels = ['Keselamatan', ...COMPETENCY_IDS.map((id) => COMPETENCY_LABELS[id])]
    for (const label of labels) {
      expect(screen.getByText(label)).toBeDefined()
    }
    for (const name of ['Ibu', 'Ayah', 'Dito', 'Nenek', 'Oyen', 'Pak Darto']) {
      expect(screen.getAllByText(name).length).toBeGreaterThan(0)
    }
  })

  it('shows all three phases in the rail from the start', () => {
    render(<App />)
    // Each label also appears as a panel kicker once its phase is active, so these
    // are deliberately not unique.
    expect(screen.getAllByText('Fase 1 · Kesiapsiagaan').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Fase 2 · Respons').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Fase 3 · Pemulihan').length).toBeGreaterThan(0)
  })

  it('starts phase 1 with the full hour budget and all six spots', async () => {
    await startGame()
    expect(screen.getByText('10 jam')).toBeDefined()
    expect(screen.getByText('0 dari 6 lokasi dikunjungi')).toBeDefined()
  })

  it('opens a map spot, spends hours on a choice, and returns to the map', async () => {
    const u = user()
    await startGame()

    await u.click(screen.getByRole('button', { name: /Dapur · Tas Siaga/ }))
    expect(screen.getByText(/Ibu mengeluarkan ransel kosong/)).toBeDefined()

    await u.click(screen.getByRole('button', { name: /Isi: air minum, makanan tahan lama/ }))

    // That option costs 2 hours, so the budget drops from 10 to 8.
    expect(screen.getByText('8 jam')).toBeDefined()
    expect(screen.getByText('1 dari 6 lokasi dikunjungi')).toBeDefined()
  })

  it('can back out of an open spot without choosing', async () => {
    const u = user()
    await startGame()
    await u.click(screen.getByRole('button', { name: /Dapur · Tas Siaga/ }))
    await u.click(screen.getByRole('button', { name: 'Kembali ke peta' }))
    expect(screen.getByText('0 dari 6 lokasi dikunjungi')).toBeDefined()
  })

  it('walks from phase 1 through its reflection into phase 2', async () => {
    await startGame()
    await finishMapAndRecap(/Lanjut ke malam hari/, /Mulai Fase 2/)

    expect(screen.getByText(/Fase 2 · Respons · Situasi 1/)).toBeDefined()
    expect(screen.getByText(PHASE2_CARDS[0]!.title)).toBeDefined()
  })

  it('shows feedback after a crisis choice', async () => {
    const u = user()
    await startGame()
    await finishMapAndRecap(/Lanjut ke malam hari/, /Mulai Fase 2/)

    const first = PHASE2_CARDS[0]!.options[0]!
    await u.click(screen.getByRole('button', { name: new RegExp(first.text.slice(0, 30)) }))

    expect(screen.getByText('Akibat keputusanmu')).toBeDefined()
    expect(screen.getByRole('button', { name: 'Lanjut' })).toBeDefined()
  })
})

describe('a full run reaches the ending', () => {
  it('plays all three phases through to the final score', async () => {
    const u = user()
    await startGame()

    await finishMapAndRecap(/Lanjut ke malam hari/, /Mulai Fase 2/)

    // Take the safe option on every crisis card.
    for (const card of PHASE2_CARDS) {
      const best = card.options[0]!
      await u.click(screen.getByRole('button', { name: new RegExp(best.text.slice(0, 25)) }))
      await u.click(screen.getByRole('button', { name: 'Lanjut' }))
    }

    // Phase 2's reflection leads into phase 3.
    for (let guard = 0; guard < 20; guard++) {
      const button = screen.queryByRole('button', { name: 'Lanjut' })
      if (!button) break
      await u.click(button)
    }
    await u.click(screen.getByRole('button', { name: /Mulai Fase 3/ }))

    expect(screen.getByText('0 dari 6 lokasi dikunjungi')).toBeDefined()
    await finishMapAndRecap(/Selesai berbenah|Lihat hasilnya/, /Lihat Hasil Akhir/)

    expect(screen.getByText('Edisi Khusus · Setelah Bencana')).toBeDefined()
    // The four bars are the score; one of them is flagged as the weakest.
    expect(screen.getAllByText(/perlu dilatih/).length).toBe(1)
    expect(screen.getByText(/Keputusan tepat saat krisis/)).toBeDefined()
    expect(screen.getByRole('button', { name: 'Main Lagi' })).toBeDefined()
  }, 60_000)
})

describe('the game over edition', () => {
  it('appears once a run of bad choices exhausts safety', async () => {
    const u = user()
    await startGame()
    await finishMapAndRecap(/Lanjut ke malam hari/, /Mulai Fase 2/)

    // Option C is the worst on every card; six of them empty the safety meter.
    for (let i = 0; i < PHASE2_CARDS.length; i++) {
      const worst = PHASE2_CARDS[i]!.options[2]!
      await u.click(screen.getByRole('button', { name: new RegExp(worst.text.slice(0, 20)) }))

      const fatal = screen.queryByRole('button', { name: /Lihat akibatnya/ })
      await u.click(fatal ?? screen.getByRole('button', { name: 'Lanjut' }))
      if (fatal) break
    }

    expect(screen.getByText('Permainan Berakhir')).toBeDefined()
    expect(screen.getByText('Keselamatan habis')).toBeDefined()
    expect(screen.getByRole('button', { name: /Ulangi Fase 2/ })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Mulai dari awal' })).toBeDefined()
  }, 60_000)
})
