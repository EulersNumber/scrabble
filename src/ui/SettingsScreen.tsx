import { useState } from 'react'
import { getSettings, updateSettings } from '../application'
import type { SettingsStore } from '../persistence'
import { AppShell, FormError, Switch, TopBar } from './primitives'
import { strings } from './strings'

type SettingsScreenProps = {
  store: SettingsStore
  onBack: () => void
}

/**
 * Master settings (T9.1 / D41).
 *
 * One sounds on/off control, saved immediately. No playback (T9.2) and no
 * placeholder rows for later sections. Back returns to wherever opened it.
 */
export function SettingsScreen({ store, onBack }: SettingsScreenProps) {
  const [settings, setSettings] = useState(() => getSettings(store))
  const [saveError, setSaveError] = useState<string | null>(null)

  function handleSounds(enabled: boolean) {
    setSaveError(null)
    try {
      setSettings(updateSettings(store, { soundsEnabled: enabled }))
    } catch {
      setSaveError(strings.settingsSaveFailed)
    }
  }

  return (
    <AppShell>
      <TopBar title={strings.settingsTitle} backLabel={strings.back} onBack={onBack} />
      <div className="mt-6 flex flex-col gap-3">
        <Switch
          id="sounds-enabled"
          label={strings.soundsLabel}
          checked={settings.soundsEnabled}
          onChange={handleSounds}
        />
        {saveError ? <FormError>{saveError}</FormError> : null}
      </div>
    </AppShell>
  )
}
