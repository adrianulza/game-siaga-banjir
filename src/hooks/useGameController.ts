import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'

import { Sound } from '@/audio/Sound'
import { COMPETENCY_IDS, type CompetencyId } from '@/data/types'
import type { GameAction } from '@/engine/actions'
import { DEFAULT_CONFIG, decisionMs, type GameConfig } from '@/engine/config'
import { createReducer } from '@/engine/reducer'
import { createInitialState, isMapScreen, type GameState } from '@/engine/state'
import { rainLevel } from '@/scene/weather'

/** Score readouts that flash when they change. */
/** Every figure that can flash when it changes: the gauge and the four bars. */
export type ScoreKey = 'safety' | CompetencyId

const NO_POPS: Record<ScoreKey, boolean> = {
  safety: false,
  informasi: false,
  logistik: false,
  rentan: false,
  mitigasi: false,
}

export interface GameController {
  state: GameState
  config: GameConfig
  dispatch: (action: GameAction) => void
  /** Which score readouts are mid-flash. */
  pops: Record<ScoreKey, boolean>
  shaking: boolean
  muted: boolean
  toggleMute: () => void
  /** Starts audio; must be called from a user gesture. */
  beginAudio: () => void
}

const TICK_MS = 100
const POP_MS = 460
const GAME_OVER_DELAY_MS = 900
const SHAKE_OVER_MS = 1400
const SHAKE_LANDSLIDE_MS = 1500

export const useGameController = (config: GameConfig = DEFAULT_CONFIG): GameController => {
  const reducer = useMemo(() => createReducer(config), [config])
  const [state, dispatch] = useReducer(reducer, config, createInitialState)

  const soundRef = useRef<Sound | null>(null)
  if (soundRef.current === null) soundRef.current = new Sound()
  const sound = soundRef.current

  const [muted, setMuted] = useState(false)
  const [shaking, setShaking] = useState(false)
  const [pops, setPops] = useState<Record<ScoreKey, boolean>>(NO_POPS)

  // ---- score flashes -------------------------------------------------------
  const previousScores = useRef({ safety: state.safety, ...state.competency })
  useEffect(() => {
    const prev = previousScores.current
    const changed: ScoreKey[] = []
    if (state.safety !== prev.safety) changed.push('safety')
    for (const id of COMPETENCY_IDS) if (state.competency[id] !== prev[id]) changed.push(id)
    previousScores.current = { safety: state.safety, ...state.competency }
    if (changed.length === 0) return

    setPops((p) => ({ ...p, ...Object.fromEntries(changed.map((k) => [k, true])) }))
    const timer = setTimeout(() => {
      setPops((p) => ({ ...p, ...Object.fromEntries(changed.map((k) => [k, false])) }))
    }, POP_MS)
    return () => clearTimeout(timer)
  }, [state.safety, state.competency])

  // ---- decision countdowns: a crisis card, or an open map spot -------------
  const running =
    (state.screen === 'p2' && state.feedback === null) ||
    (isMapScreen(state.screen) && state.openSpotId !== null)
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => dispatch({ type: 'TICK', deltaMs: TICK_MS }), TICK_MS)
    return () => clearInterval(id)
  }, [running, state.openSpotId])

  // ---- the deferred game over the reducer parked in state ------------------
  useEffect(() => {
    if (!state.pendingGameOver) return
    const timer = setTimeout(() => dispatch({ type: 'COMMIT_GAME_OVER' }), GAME_OVER_DELAY_MS)
    return () => clearTimeout(timer)
  }, [state.pendingGameOver])

  // ---- screen shake --------------------------------------------------------
  useEffect(() => {
    if (state.screen !== 'over' || !config.dramatic) return
    setShaking(true)
    const timer = setTimeout(() => setShaking(false), SHAKE_OVER_MS)
    return () => clearTimeout(timer)
  }, [state.screen, config.dramatic])

  useEffect(() => {
    if (!(state.screen === 'p2' && state.cardIndex === 6 && config.dramatic)) return
    setShaking(true)
    const timer = setTimeout(() => setShaking(false), SHAKE_LANDSLIDE_MS)
    return () => clearTimeout(timer)
  }, [state.screen, state.cardIndex, config.dramatic])

  // ---- sound director ------------------------------------------------------
  // Fires only when the scene actually changes. soundEpoch covers the case where a
  // retry lands back on the screen already showing, which a screen/card comparison
  // alone would miss.
  const lastScene = useRef({ screen: state.screen, card: state.cardIndex, epoch: state.soundEpoch })
  useEffect(() => {
    const last = lastScene.current
    if (
      state.screen === last.screen &&
      state.cardIndex === last.card &&
      state.soundEpoch === last.epoch
    ) {
      return
    }
    const previousScreen = last.screen
    const previousCard = last.card
    lastScene.current = {
      screen: state.screen,
      card: state.cardIndex,
      epoch: state.soundEpoch,
    }

    sound.rain(rainLevel(state, config))

    if (state.screen === 'p2' && previousScreen !== 'p2') sound.kentongan(6)
    if (state.screen === 'p2' && state.cardIndex !== previousCard) {
      const i = state.cardIndex
      if (i === 1 || i === 3) sound.splash()
      else if (i === 6) sound.rumble()
      else if (i === 7) sound.siren()
      else if (i >= 2 && config.dramatic) sound.thunder()
    }
    if (state.screen === 'over') {
      sound.rain(0.95)
      if (config.dramatic) sound.thunder()
      sound.siren()
    }
    // The full state is intentionally excluded: this must run on scene changes only,
    // not on every countdown tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.screen, state.cardIndex, state.soundEpoch, config, sound])

  // ---- a choice landing ----------------------------------------------------
  const choiceCount = state.crisisLog.length + Object.keys(state.mapChoices).length
  const lastChoiceCount = useRef(choiceCount)
  useEffect(() => {
    if (choiceCount === lastChoiceCount.current) return
    lastChoiceCount.current = choiceCount
    const delta = state.feedback?.delta
    if (delta === undefined) {
      sound.hit(560, 0.12, 0.14, 'sine')
    } else {
      sound.hit(delta > 0 ? 620 : 220, 0.2, 0.16, delta > 0 ? 'sine' : 'sawtooth')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [choiceCount, sound])

  useEffect(() => () => sound.setMuted(true), [sound])

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      sound.setMuted(!m)
      return !m
    })
  }, [sound])

  const beginAudio = useCallback(() => {
    sound.init()
    sound.setMuted(muted)
    sound.rain(0.2)
  }, [sound, muted])

  return { state, config, dispatch, pops, shaking, muted, toggleMute, beginAudio }
}

export { decisionMs }
