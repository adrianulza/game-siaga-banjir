import { createContext, useContext, type ReactNode } from 'react'

import { DEFAULT_CONFIG, type GameConfig } from '@/engine/config'

import { useGameController, type GameController } from './useGameController'

const GameContext = createContext<GameController | null>(null)

export const GameProvider = ({
  children,
  config = DEFAULT_CONFIG,
}: {
  children: ReactNode
  config?: GameConfig
}) => {
  const controller = useGameController(config)
  return <GameContext.Provider value={controller}>{children}</GameContext.Provider>
}

/**
 * The whole game state and its dispatcher. Shared through context rather than
 * threaded as props: the scene is ~40 components deep in places, and the original's
 * flat props bag is exactly what this port set out to dissolve.
 */
export const useGame = (): GameController => {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used inside a GameProvider')
  return ctx
}
