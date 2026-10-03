import { useEffect, useLayoutEffect, useState } from 'react'
import {
  createLocalStorageGameStore,
  createLocalStorageSettingsStore,
} from './persistence'
import {
  ActiveGameScreen,
  HomeScreen,
  NewGameScreen,
  SavedGamesListScreen,
  SettingsScreen,
  TurnHistoryScreen,
  listFinishedGamesNewestFirst,
  listInProgressGamesNewestFirst,
  strings,
  type Screen,
} from './ui'

const store = createLocalStorageGameStore()
const settingsStore = createLocalStorageSettingsStore()

/**
 * Root shell: wires local stores to home, setup, lists, active game,
 * turn history, and settings.
 *
 * Screen switching is plain React state (D24) — no router dependency for MVP.
 * Games and settings use separate storage keys (D35).
 */
function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' })

  // A tap in the bottom sheet can leave the window scrolled. Reset so the
  // next screen's controls start in view.
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [screen])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [screen])

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

  if (screen.name === 'settings') {
    const { returnTo } = screen
    return (
      <SettingsScreen
        store={settingsStore}
        onBack={() => setScreen(returnTo)}
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
        onOpenSettings={() =>
          setScreen({
            name: 'settings',
            returnTo: { name: 'active-game', gameId, backTo },
          })
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
      onSettings={() =>
        setScreen({ name: 'settings', returnTo: { name: 'home' } })
      }
    />
  )
}

export default App
