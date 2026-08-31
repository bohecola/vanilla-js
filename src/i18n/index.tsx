/*
  语言的 Provider。这个文件里只有组件 —— 类型、hook、字典都在 context.ts / dict.*.ts，
  原因见 context.ts 顶部的注释。

  形状与 src/theme/index.tsx 完全同构（三态、写 localStorage、首帧由 index.html 兜住），
  只有一处刻意的偏离，见下面 sysLang。
*/
import { useEffect, useMemo, useState, type ReactNode } from 'react'

import { I18nContext, STORAGE_KEY, createT, readLangMode, systemLang, type LangMode } from './context'

export function I18nProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<LangMode>(readLangMode)

  /*
    与主题的唯一区别：系统语言进 state。

    主题那边 effective 是 render 期直接算的派生值，系统配色变化时只改了 <html data-theme>、
    Context 里的值并不更新（theme/index.tsx:49-57，所以 Monaco 主题不会实时跟随）。
    对配色来说这只是个小瑕疵，对文案不行 —— 语言变了必须重渲染，否则整屏文字停在旧语言。
    所以订阅 languagechange 把它放进 state。
  */
  const [sysLang, setSysLang] = useState(systemLang)

  useEffect(() => {
    const onChange = () => setSysLang(systemLang())
    window.addEventListener('languagechange', onChange)
    return () => window.removeEventListener('languagechange', onChange)
  }, [])

  const lang = mode === 'system' ? sysLang : mode

  /*
    t 必须按 lang 记忆：下游 hook 会把它放进 useCallback / useEffect 的依赖里，
    每次渲染都换一个新函数会连锁重建所有回调（最直接的后果是目录被反复重读）。
  */
  const t = useMemo(() => createT(lang), [lang])

  // 持久化用户选择
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, mode)
    } catch {
      /* ignore */
    }
  }, [mode])

  /*
    <html lang> 与标题。运行期只由这里写，别处不要碰 document.title。
    首帧那一下由 index.html 的内联脚本负责（否则英文用户每次打开都会先闪一帧中文标题）。
  */
  useEffect(() => {
    document.documentElement.lang = t('html.lang')
    document.title = t('html.title')
  }, [t])

  const value = useMemo(() => ({ mode, setMode, lang, t }), [mode, lang, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
