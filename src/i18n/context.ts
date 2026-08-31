/*
  语言的运行时：类型、Context、hook、探测与持久化。

  为什么不和 <I18nProvider> 放在一个文件里：eslint 的
  react-refresh/only-export-components 不允许「组件 + 非组件」同文件导出，
  eslint.config.js 已经为 src/theme/index.tsx 破过一次例（注释里写明是历史遗留），
  新代码不该再加一条。所以 .tsx 里只留组件，hook / 字典 / 工具函数都在这个 .ts 里，
  规则本来就不管它。组件里写 `import { useI18n } from '@/i18n/context'`。
*/
import { createContext, useContext } from 'react'

import { AppError, type Problem } from '@/lib/app-error'

import { en } from './dict.en'
import { zh, type Dict } from './dict.zh'

/** 真正生效的语言（只有这两种，不含 system） */
export type Lang = 'zh' | 'en'
/** 用户的选择：明确指定，或跟随系统 —— 与 ThemeMode 同构 */
export type LangMode = Lang | 'system'

const DICTS: Record<Lang, Dict> = { zh, en }

/*
  与 index.html 首帧脚本里的键名一致，改这里要一起改那边。
  主题那支键还是历史遗留的 'playground-theme'，新键跟 jotter:* 一族对齐。
*/
export const STORAGE_KEY = 'jotter:lang'

/*
  「这条文案该不该传参」交给 tsc 管：字典里的值是函数就必须传它那个参数对象，
  是字符串就一个参数都不许多传。忘写 { count } 是编译错误，不是运行时 undefined。
*/
type Args<K extends keyof Dict> = Dict[K] extends (p: infer P) => string ? [P] : []
export type T = <K extends keyof Dict>(key: K, ...args: Args<K>) => string

export function createT(lang: Lang): T {
  const dict = DICTS[lang]
  return (key, ...args) => {
    // 泛型索引访问下 typeof 收窄不可靠，先落成 unknown 再手动分派
    const value: unknown = dict[key]
    if (typeof value === 'function') return (value as (p: unknown) => string)(args[0])
    return value as string
  }
}

/** 浏览器语言：zh 开头给中文，其余一律英文 */
export function systemLang(): Lang {
  const raw = typeof navigator === 'undefined' ? '' : navigator.language
  return /^zh/i.test(raw) ? 'zh' : 'en'
}

/** 读用户存过的选择。存的不是这三个字面量之一（或读不出来）就回落到「跟随系统」。 */
export function readLangMode(): LangMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'zh' || saved === 'en' || saved === 'system') return saved
  } catch {
    // 隐私模式下 localStorage 直接抛，按默认走
  }
  return 'system'
}

interface I18nContextValue {
  mode: LangMode
  setMode: (mode: LangMode) => void
  lang: Lang
  t: T
}

export const I18nContext = createContext<I18nContextValue | null>(null)

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}

/*
  把任意异常变成一句能给人看的话。

  原先 App / useWorkspace / useFileDraft 各有一份一模一样的实现（都是
  `err instanceof Error ? err.message : String(err)`），这里合成一处，顺带接上翻译：
  lib/ 抛出来的 AppError 只带键和参数，翻译在这一刻才发生。

  这个断言是整套 i18n 里唯一的类型缺口：AppError 存不住「每条键各自的参数类型」
  （那需要泛型 AppError，抛出侧就得写 new AppError<'err.fs.tooLarge'>(...)，太吵）。
  代价被关在这一个函数里 —— 抛出侧仍然是普通的字符串键，写错键名照样报错。
*/
export function messageOf(err: unknown, t: T): string {
  if (err instanceof AppError) return translate(err, t)
  return err instanceof Error ? err.message : String(err)
}

/**
 * 翻译一条描述符（AppError 也是一条描述符）。
 *
 * 上面那处类型缺口的唯一落点就在这里：`Problem` 只存得下「键 + 一坨参数」，
 * 存不住「这个键要的正是这种参数」。抛出 / 返回描述符的那一侧仍然是普通字符串键，
 * 键名写错照样编译不过；对不上的只有参数，而参数是紧跟着键写在同一行的。
 */
export function translate(problem: Problem, t: T): string {
  const raw = t as unknown as (key: string, params?: unknown) => string
  return raw(problem.key, problem.params)
}
