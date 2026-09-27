import { useState } from 'react'
import { createLocalStorageGameStore } from './persistence'
import {
  ActiveGameScreen,
  HomeScreen,
  NewGameScreen,
  SavedGamesListScreen,
  TurnHistoryScreen,
  listFinishedGamesNewestFirst,
  listInProgressGamesNewestFirst,
  strings,
  type Screen,
} from './ui'

const store = createLocalStorageGameStore()

/**
 * Root shell: wires localStorage store to home, setup, lists, active game,
 * and turn history.
 *
 * Screen switching is plain React state (D24) — no router dependency for MVP.
 */
function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' })

  if (screen.name === 'new-game') {
    return (
      <NewGameScreen
        store={store}
        onBack={() => setScreen({ name: 'home' })}
        onCreated={(gameId) =>
          setScreen({ name: 'active-game', gameId, backTo: 'home' })
        }
      />
    )
  }

  if (screen.name === 'continue') {
    return (
      <SavedGamesListScreen
        store={store}
        title={strings.continueSection}
        emptyMessage={strings.noInProgressGames}
        openLabel={strings.continueGame}
        selectGames={listInProgressGamesNewestFirst}
        dateIsoForGame={(game) => game.createdAt}
        onBack={() => setScreen({ name: 'home' })}
        onOpen={(gameId) =>
          setScreen({ name: 'active-game', gameId, backTo: 'continue' })
        }
      />
    )
  }

  if (screen.name === 'history') {
    return (
      <SavedGamesListScreen
        store={store}
        title={strings.historySection}
        emptyMessage={strings.noFinishedGames}
        openLabel={strings.openFinishedGame}
        selectGames={listFinishedGamesNewestFirst}
        dateIsoForGame={(game) => game.finishedAt ?? game.createdAt}
        onBack={() => setScreen({ name: 'home' })}
        onOpen={(gameId) =>
          setScreen({ name: 'active-game', gameId, backTo: 'history' })
        }
      />
    )
  }

  if (screen.name === 'turn-history') {
    const { gameId, backTo } = screen
    return (
      <TurnHistoryScreen
        store={store}
        gameId={gameId}
        onBack={() => setScreen({ name: 'active-game', gameId, backTo })}
      />
    )
  }

  if (screen.name === 'active-game') {
    const { gameId, backTo } = screen
    return (
      <ActiveGameScreen
        store={store}
        gameId={gameId}
        onOpenTurns={() =>
          setScreen({ name: 'turn-history', gameId, backTo })
        }
        onBack={() => {
          if (backTo === 'continue') {
            setScreen({ name: 'continue' })
            return
          }
          if (backTo === 'history') {
            setScreen({ name: 'history' })
            return
          }
          setScreen({ name: 'home' })
        }}
      />
    )
  }

  return (
    <HomeScreen
      onNewGame={() => setScreen({ name: 'new-game' })}
      onContinueList={() => setScreen({ name: 'continue' })}
      onHistory={() => setScreen({ name: 'history' })}
    />
  )
}

export default App
