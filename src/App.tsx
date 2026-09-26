import { useState } from 'react'
import { createLocalStorageGameStore } from './persistence'
import {
  ActiveGameScreen,
  HomeScreen,
  NewGameScreen,
  type Screen,
} from './ui'

const store = createLocalStorageGameStore()

/**
 * Root shell: wires localStorage store to home / new-game / active-game screens.
 *
 * Screen switching is plain React state (D24) — no router dependency for MVP.
 */
function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' })

  if (screen.name === 'new-game') {
    return <NewGameScreen onBack={() => setScreen({ name: 'home' })} />
  }

  if (screen.name === 'active-game') {
    return (
      <ActiveGameScreen
        store={store}
        gameId={screen.gameId}
        onBack={() => setScreen({ name: 'home' })}
      />
    )
  }

  return (
    <HomeScreen
      store={store}
      onNewGame={() => setScreen({ name: 'new-game' })}
      onContinue={(gameId) => setScreen({ name: 'active-game', gameId })}
    />
  )
}

export default App
