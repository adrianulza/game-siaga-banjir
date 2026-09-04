import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Exactly the three faces the original loaded from Google Fonts (400, 600, 400-italic).
// Italic-600 is deliberately NOT included: the original never loaded it either, so the
// masthead's `italic 600` stays synthesized and the type renders identically.
import '@fontsource/source-serif-4/latin-400.css'
import '@fontsource/source-serif-4/latin-600.css'
import '@fontsource/source-serif-4/latin-400-italic.css'

import './styles/broadsheet.css'
import './styles/base.css'
import './styles/keyframes.css'
import './styles/game.css'

import { App } from './App'

const host = document.getElementById('root')
if (!host) throw new Error('#root is missing from index.html')

createRoot(host).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
