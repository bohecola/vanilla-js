// 设置的 Provider。类型、常量、hook 见 context.ts。
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { DEFAULT_SETTINGS, STORAGE_KEY, SettingsContext, readSettings, type EditorSettings } from './context'

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<EditorSettings>(readSettings)

  const update = useCallback(<K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) => {
    setSettings((s) => (s[key] === value ? s : { ...s, [key]: value }))
  }, [])
  const reset = useCallback(() => setSettings(DEFAULT_SETTINGS), [])

  useEffect(() => {
    try {
      if (settings === DEFAULT_SETTINGS) localStorage.removeItem(STORAGE_KEY)
      else localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {
      /* ignore */
    }
  }, [settings])

  const value = useMemo(() => ({ settings, update, reset }), [settings, update, reset])
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}
