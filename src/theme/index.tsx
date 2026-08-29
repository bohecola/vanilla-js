// 主题状态：亮色 / 暗色 / 跟随系统。
// 通过 Context 提供，供 main.tsx 的 antd ConfigProvider 与 App 的界面共同消费。
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'
export type EffectiveTheme = 'light' | 'dark'

interface ThemeContextValue {
  mode: ThemeMode
  effective: EffectiveTheme
  setMode: (m: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

// 注意：index.html 里有一段首帧前的内联脚本读同一个键、用同一个默认值（dark）
// 提前写好 <html data-theme>，避免主题闪变。改这里时记得同步那段脚本。
const STORAGE_KEY = 'js-playground-theme'

function getInitialMode(): ThemeMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved
  } catch {
    /* ignore */
  }
  return 'dark' // 默认延续暗色
}

function systemPref(): EffectiveTheme {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark'
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(getInitialMode)

  const effective: EffectiveTheme = mode === 'system' ? systemPref() : mode

  // 应用到 <html> 的 data-theme 属性，驱动 CSS 变量、color-scheme 与 Monaco 主题。
  // color-scheme 交给 index.css 里的 [data-theme] 规则，不在这里写内联样式，
  // 避免同一属性存在两处来源。
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', effective)
  }, [effective])

  // 跟随系统：监听 prefers-color-scheme 变化，仅 system 模式需要
  useEffect(() => {
    if (mode !== 'system') return
    const mql = window.matchMedia('(prefers-color-scheme: light)')
    const onChange = () => {
      document.documentElement.setAttribute('data-theme', systemPref())
    }
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [mode])

  // 持久化用户选择
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, mode)
    } catch {
      /* ignore */
    }
  }, [mode])

  const value = useMemo(() => ({ mode, effective, setMode }), [mode, effective])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
