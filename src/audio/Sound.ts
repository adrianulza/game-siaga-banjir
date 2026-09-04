/**
 * The game's soundscape, synthesised entirely in the Web Audio API — no asset files.
 *
 * A continuous filtered-noise rain bed sits under one-shot cues: the kentongan
 * (bamboo slit drum) that warns the village, thunder, the landslide rumble, splashes,
 * and the evacuation siren.
 *
 * Every method is a no-op until `init()` runs, which must happen inside a user
 * gesture — browsers refuse to start an AudioContext otherwise.
 */
export class Sound {
  private muted = false
  private started = false

  private ctx?: AudioContext
  private master?: GainNode
  private noise?: AudioBuffer
  private rainGain?: GainNode

  /** Safe to call repeatedly; only the first call inside a user gesture does work. */
  init(): void {
    if (this.started) return

    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return

    const ctx = new Ctor()
    this.ctx = ctx

    const master = ctx.createGain()
    master.gain.value = this.muted ? 0 : 0.85
    master.connect(ctx.destination)
    this.master = master

    // Two seconds of white noise, looped — the raw material for rain, thunder,
    // the landslide, and splashes, each shaped by a different filter.
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
    const channel = buffer.getChannelData(0)
    for (let i = 0; i < channel.length; i++) channel[i] = Math.random() * 2 - 1
    this.noise = buffer

    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true

    const rainFilter = ctx.createBiquadFilter()
    rainFilter.type = 'bandpass'
    rainFilter.frequency.value = 2100
    rainFilter.Q.value = 0.5

    const rainGain = ctx.createGain()
    rainGain.gain.value = 0
    this.rainGain = rainGain

    source.connect(rainFilter)
    rainFilter.connect(rainGain)
    rainGain.connect(master)
    source.start()

    this.started = true
  }

  setMuted(muted: boolean): void {
    this.muted = muted
    if (this.ctx && this.master) {
      this.master.gain.setTargetAtTime(muted ? 0 : 0.85, this.ctx.currentTime, 0.15)
    }
  }

  get isMuted(): boolean {
    return this.muted
  }

  /** Rain intensity, 0..1. Ramps slowly so weather changes feel like weather. */
  rain(level: number): void {
    if (!this.ctx || !this.rainGain) return
    this.rainGain.gain.setTargetAtTime(level * 0.2, this.ctx.currentTime, 0.9)
  }

  /** A single pitched hit that drops as it decays — the generic UI blip. */
  hit(
    frequency: number,
    duration: number,
    volume: number,
    type: OscillatorType = 'triangle',
  ): void {
    const ctx = this.ctx
    const master = this.master
    if (!ctx || !master) return

    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = type
    osc.frequency.setValueAtTime(frequency, t)
    osc.frequency.exponentialRampToValueAtTime(frequency * 0.55, t + duration)

    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(volume, t + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration)

    osc.connect(gain)
    gain.connect(master)
    osc.start(t)
    osc.stop(t + duration + 0.05)
  }

  /** The kentongan: repeated wooden strikes, the village's danger signal. */
  kentongan(strikes = 5): void {
    if (!this.ctx) return
    for (let i = 0; i < strikes; i++) {
      setTimeout(() => {
        this.hit(420, 0.16, 0.3, 'square')
        this.hit(880, 0.07, 0.12, 'triangle')
      }, i * 210)
    }
  }

  /** Noise swept downward through a lowpass — distant thunder. */
  thunder(): void {
    this.noiseBurst({
      filter: 'lowpass',
      from: 340,
      to: 70,
      sweep: 1.8,
      peak: 0.5,
      attack: 0.12,
      release: 2.1,
      stop: 2.2,
    })
  }

  /** A longer, lower version of the same shape — the hillside coming down. */
  rumble(): void {
    const ctx = this.ctx
    const master = this.master
    if (!ctx || !master || !this.noise) return

    const t = ctx.currentTime
    const source = ctx.createBufferSource()
    source.buffer = this.noise
    source.loop = true

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(120, t)
    filter.frequency.linearRampToValueAtTime(48, t + 2.6)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(0.55, t + 0.5)
    gain.gain.setValueAtTime(0.55, t + 1.6)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 3)

    source.connect(filter)
    filter.connect(gain)
    gain.connect(master)
    source.start(t)
    source.stop(t + 3.1)
  }

  /** Bandpassed noise sweeping down — water hitting water. */
  splash(): void {
    this.noiseBurst({
      filter: 'bandpass',
      from: 900,
      to: 260,
      sweep: 0.5,
      peak: 0.3,
      attack: 0,
      release: 0.55,
      stop: 0.6,
    })
  }

  /** Three rising tones — the evacuation siren at the posko. */
  siren(): void {
    if (!this.ctx) return
    for (let i = 0; i < 3; i++) {
      setTimeout(() => this.hit(700 + i * 40, 0.5, 0.1, 'sine'), i * 520)
    }
  }

  /** Shared shape behind thunder and splash: filtered noise swept down and faded. */
  private noiseBurst(o: {
    filter: BiquadFilterType
    from: number
    to: number
    sweep: number
    peak: number
    attack: number
    release: number
    stop: number
  }): void {
    const ctx = this.ctx
    const master = this.master
    if (!ctx || !master || !this.noise) return

    const t = ctx.currentTime
    const source = ctx.createBufferSource()
    source.buffer = this.noise

    const filter = ctx.createBiquadFilter()
    filter.type = o.filter
    filter.frequency.setValueAtTime(o.from, t)
    filter.frequency.exponentialRampToValueAtTime(o.to, t + o.sweep)

    const gain = ctx.createGain()
    if (o.attack > 0) {
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(o.peak, t + o.attack)
    } else {
      gain.gain.setValueAtTime(o.peak, t)
    }
    gain.gain.exponentialRampToValueAtTime(0.0001, t + o.release)

    source.connect(filter)
    filter.connect(gain)
    gain.connect(master)
    source.start(t)
    source.stop(t + o.stop)
  }
}
