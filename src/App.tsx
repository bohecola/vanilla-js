import { useRef, useEffect, useState, useCallback, type ChangeEvent } from 'react'
import { uniq } from 'lodash-es'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { GithubMark } from './components/GithubMark'
import { JotterMark } from './components/JotterMark'
import Editor, { EditorHandle, type CursorStatus } from './components/Editor'
import Console, { ConsoleHandle } from './components/Console'
import Sidebar from './components/Sidebar'
import ConfirmDialog from './components/ConfirmDialog'
import { listTemplates, loadAllTemplates, loadTemplate } from './hooks'
import { useWorkspace, type WorkspaceRoot } from './hooks/useWorkspace'
import { useFileDraft } from './hooks/useFileDraft'
import { useConfirm } from './hooks/useConfirm'
import {
  getLastModified,
  isRunnable,
  languageOf,
  pickDirectory,
  queryPermission,
  readTextFile,
  removeEntry,
  writeTextFile,
  type Entry,
  type FileEncoding,
  type FileEntry,
} from './lib/fs-access'
import { codeRunner } from './lib/runner'
import { warmupCompiler } from './lib/compile'
import { idbDel, idbGet } from './lib/idb'
import {
  DEMO_SAVE_KEY,
  DEMO_SAVING_KEY,
  type InterruptedSave,
  type ResidualDemo,
} from './hooks/useWorkspace'
import { messageOf, useI18n, type LangMode } from '@/i18n/context'
import { useTheme, type ThemeMode } from './theme/index.tsx'

const ACTIVE_KEY = 'jotter:activeKey'
/** 「把全部 Demo 存到本地」时建的总目录名。纯 ASCII，跨系统都安全 */
const DEMOS_DIR = 'jotter-demos'

type Language = 'javascript' | 'typescript'

/*
  打开的文件用一个 key 唯一标识，它同时是 Monaco model 的 key 和侧边栏的选中态：
    builtin:../template/overrides/call.js   内置 Demo（源码打包进来的，可改但存不回去）
    local:src/lib/foo.ts                    用户本地目录里的文件，有 handle，能写回磁盘
    scratch                                 「新建草稿」出来的空白草稿，也是首屏的默认
    imported:foo.js                         通过 <input type=file> 导入的单个文件
                                            （只有不支持目录 API 的浏览器上还有这个入口）
  只有 local 这一种有 handle —— Ctrl+S 能真正落盘的也只有它，其余退回下载。
*/
interface ActiveFile {
  key: string
  kind: 'builtin' | 'local' | 'scratch' | 'imported'
  /** 标题栏上显示的名字 */
  name: string
  language: string
  /** 底部状态栏展示的编码。local 来自读盘时对 BOM 的推断；其余在浏览器里生成的
      文件（内置示例 / 草稿 / 导入）按 UTF-8 报。 */
  encoding: FileEncoding
  handle?: FileSystemFileHandle
}

/** 读盘时记下的 mtime，用来判断磁盘上的文件是否被外部程序改过。 */
interface LocalMeta {
  handle: FileSystemFileHandle
  lastModified: number
  /** 该文件的编码推断结果，随 key 一起存，重开 / 改名后仍能对上。
      undefined 表示没走读盘推断（浏览器里新生成的），按 UTF-8 报即可。 */
  encoding?: FileEncoding
}

type NoticeTone = 'info' | 'warn' | 'error'
interface Notice {
  tone: NoticeTone
  text: string
}

const NOTICE_STYLE: Record<NoticeTone, string> = {
  info: 'border-[var(--border)] bg-[var(--panel-bg)] text-[var(--text-body)]',
  warn: 'border-[var(--accent-symbol)]/40 bg-[var(--accent-symbol)]/10 text-[var(--accent-symbol)]',
  error: 'border-[var(--accent-error)]/40 bg-[var(--accent-error)]/10 text-[var(--accent-error)]',
}

// 按文件后缀猜语言（导入 .ts 文件时自动切到 TS，否则代码不会经过 TS 编译）
function languageFromFilename(name: string): Language {
  return /\.(ts|tsx|mts|cts)$/i.test(name) ? 'typescript' : 'javascript'
}

// 让下载的文件后缀与当前语言一致：TS 代码存成 .js 打开就是坏的
function withLanguageExt(filename: string, language: string): string {
  const ext = language === 'typescript' ? 'ts' : 'js'
  return filename.replace(/\.(js|mjs|cjs|jsx|ts|tsx|mts|cts)$/i, `.${ext}`)
}

function App() {
  const templates = listTemplates()
  const workspace = useWorkspace()
  // 这两个方法在 effect / useCallback 里用，摘出来当依赖：整个 workspace 当依赖的话
  // 每次目录树变动都会重跑，而这两处只关心「路径怎么解析」
  const { resolveFilePath, displayPath } = workspace
  const { mode, setMode } = useTheme()
  // 主题那边已经占了 mode / setMode，语言这两个改名区分
  const { mode: langMode, setMode: setLangMode, t } = useI18n()
  const confirm = useConfirm()

  // ---- 多标签数据模型 ----
  // 打开的标签按顺序存一份（VS Code 式），当前激活的是哪一个用 activeKey 记。
  // `active` 是从它们派生的「当前文件」，保留这个名字是为了让 handleSave / 状态栏 /
  // 运行等大量既存代码读 active 时不用改 —— 它们仍拿到「当前激活那个文件」。
  const [tabs, setTabs] = useState<ActiveFile[]>([])
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const active = tabs.find((x) => x.key === activeKey) ?? null
  const [dirtyKeys, setDirtyKeys] = useState<Set<string>>(new Set())

  // 异步流程里（关了标签、草稿转正之类）读 state 会拿到旧值，同步一份到 ref 供回调用
  const tabsLiveRef = useRef<ActiveFile[]>([])
  const activeKeyLiveRef = useRef<string | null>(null)
  useEffect(() => {
    tabsLiveRef.current = tabs
    activeKeyLiveRef.current = activeKey
  }, [tabs, activeKey])

  // 让 Editor 保住所有打开标签的 model（不被 LRU 淘汰），这样切标签时不重读盘、不丢光标。
  const tabsKeys = tabs.map((x) => x.key)
  useEffect(() => {
    editorRef.current?.setPinnedKeys(tabsKeys)
  }, [tabsKeys])

  // ---- 编辑器 / 控制台 水平分栏 ----
  // editorW 为 null 表示未拖过：两栏各占一半（编辑器与输出都 flex-1）。
  // 一旦拖过，就按像素记住编辑器宽度。两侧都可被拖小（不再锁编辑器 >= 一半），
  // 各留一个可读下限；拖到正中间 50% 附近时有「吸附」的顿感，方便停在正中。
  const mainRef = useRef<HTMLElement | null>(null)
  const [editorW, setEditorW] = useState<number | null>(null)
  /** 正在拖动分栏（用于给分隔带一个明显的“拖动中”高亮） */
  const [splitting, setSplitting] = useState(false)
  const CONSOLE_MIN = 220 // px，任何一侧至少保住的宽度
  const SNAP = 20 // px：距正中 50% 这么近就会被磁吸住
  const SNAP_RELEASE = 32 // px：已经吸在正中间后，得拖开这么远才挣脱（更强的顿感）
  const startSplitDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    const wrap = mainRef.current
    if (!wrap) return
    const wrapW = wrap.getBoundingClientRect().width
    const startX = e.clientX
    const startW = wrap.querySelector('[data-editor-pane]')?.getBoundingClientRect().width ?? wrapW / 2
    const minW = CONSOLE_MIN // 编辑器可拖到较小
    const maxW = Math.round(wrapW - CONSOLE_MIN) // 给另一侧留出可读下限
    const half = Math.round(wrapW / 2)
    // 磁吸锁：一旦被吸到正中，需要拖出 SNAP_RELEASE 才解开，制造明显的“顿”感
    let latched = false

    setSplitting(true)
    const prevUserSelect = document.body.style.userSelect
    document.body.style.userSelect = 'none' // 拖动中不选中文本

    const onMove = (ev: PointerEvent) => {
      const raw = startW + (ev.clientX - startX)
      const d = raw - half
      let target = raw
      if (latched) {
        // 已吸住：拖出释放带之前保持正中
        if (Math.abs(d) > SNAP_RELEASE) {
          latched = false
        } else {
          target = half
        }
      } else if (Math.abs(d) <= SNAP) {
        latched = true
        target = half
      }
      const w = Math.min(Math.max(target, minW), Math.max(minW, maxW))
      setEditorW(Math.round(w))
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = prevUserSelect
      setSplitting(false)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    document.body.style.cursor = 'col-resize'
  }, [CONSOLE_MIN, SNAP, SNAP_RELEASE])

  // ---- 标签栏横向滚动（同 VS Code：原生滚动条隐藏、不占高度，用悬浮细条替代）----
  const tabScrollRef = useRef<HTMLDivElement | null>(null)
  /** 悬浮进度条几何：x/w 是 thumb 相对 track 的 left/宽（px），overflow 表示是否溢出 */
  const [tabBar, setTabBar] = useState({ x: 0, w: 0, overflow: false })
  /** 正在拖 thumb：拖拽中即使鼠标移出标签区，进度条也保持显示（同 VS Code 的按住态） */
  const [tabBarDragging, setTabBarDragging] = useState(false)
  const updateTabScrollState = useCallback(() => {
    const el = tabScrollRef.current
    if (!el) return
    const maxScroll = el.scrollWidth - el.clientWidth
    const track = el.clientWidth
    const overflow = maxScroll > 0
    if (!overflow) {
      setTabBar({ x: 0, w: 0, overflow: false })
      return
    }
    // thumb 宽 ≈ track × (track / scrollWidth)，保个下限好抓
    const w = Math.max(36, (track * track) / Math.max(el.scrollWidth, 1))
    const x = (el.scrollLeft / maxScroll) * (track - w)
    setTabBar({ x, w, overflow: true })
  }, [])
  // 底部悬浮 thumb 可拖拽横滚（同 VS Code）：按住左右拖，把 scrollLeft 带过去。
  const tabBarDragRef = useRef<{ startX: number; startLeft: number } | null>(null)
  const startTabBarDrag = (e: React.PointerEvent) => {
    const el = tabScrollRef.current
    if (!el) return
    e.preventDefault()
    tabBarDragRef.current = { startX: e.clientX, startLeft: el.scrollLeft }
    // 全屏透明覆盖层：拖动期间盖在最上层，避免鼠标移到别处触发 hover / 选中文本，
    // 让拖动稳定跟手。不加手型光标 —— 保持系统默认指针（同 VS Code）。松开移除。
    const overlay = document.createElement('div')
    overlay.style.cssText =
      'position:fixed;inset:0;z-index:2147483647;touch-action:none;user-select:none;'
    document.body.appendChild(overlay)
    setTabBarDragging(true)
    const move = (ev: PointerEvent) => {
      const el2 = tabScrollRef.current
      const st = tabBarDragRef.current
      if (!el2 || !st) return
      const track = el2.clientWidth
      const ratio = (el2.scrollWidth - track) / Math.max(track - tabBar.w, 1)
      el2.scrollLeft = st.startLeft + (ev.clientX - st.startX) * ratio
    }
    const up = () => {
      setTabBarDragging(false)
      overlay.remove()
      tabBarDragRef.current = null
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }
  useEffect(() => {
    updateTabScrollState()
    const el = tabScrollRef.current
    if (!el) return
    const ro = new ResizeObserver(updateTabScrollState)
    ro.observe(el)
    el.addEventListener('scroll', updateTabScrollState, { passive: true })
    // 标签溢出时把普通鼠标滚轮转成横向滚动（同 VS Code：滚轮直接翻 tab，不滚页面）。
    // 非 passive 才能 preventDefault 挡住页面纵向滚动。
    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return // 没溢出就交给页面正常滚动
      e.preventDefault()
      el.scrollLeft += e.deltaY + e.deltaX
      updateTabScrollState()
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      ro.disconnect()
      el.removeEventListener('scroll', updateTabScrollState)
      el.removeEventListener('wheel', onWheel)
    }
  }, [updateTabScrollState, tabs.length])
  // 切换激活标签时把它滚到可见（VS Code 行为）
  useEffect(() => {
    const el = tabScrollRef.current
    if (!el || !activeKey) return
    const act = el.querySelector('[data-active-tab="true"]') as HTMLElement | null
    act?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    updateTabScrollState()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey, tabs.length])


  // Editor 该切到哪个 model 由调用方在之前/之后用 editorRef.open 处理（见各 open 函数）。
  const openOrActivate = useCallback((file: ActiveFile) => {
    setTabs((prev) => {
      const i = prev.findIndex((x) => x.key === file.key)
      if (i === -1) return [...prev, file]
      const next = [...prev]
      next[i] = file
      return next
    })
    setActiveKey(file.key)
  }, [])

  // 关闭某标签（供标签栏 × 用）。脏的走二次确认；关闭激活标签则切到相邻标签；
  // 关到最后一个就退回一张空白草稿（与删除当前文件后 openScratch 一致）。
  // 注意读的都是 live ref / 本处可拿到的稳定量 —— 关闭确认可能跨 await，不能吃旧 state。
  const closeTab = useCallback(
    async (key: string) => {
      const curTabs = tabsLiveRef.current
      const file = curTabs.find((x) => x.key === key)
      if (!file) return
      if (dirtyRef.current.has(key)) {
        const ok = await confirm.ask({
          title: t('confirm.closeTab.title', { name: file.name }),
          lines: [t('confirm.closeTab.unsaved')],
          confirmText: t('confirm.closeTab.ok'),
          tone: 'danger',
        })
        if (!ok) return
      }
      editorRef.current?.close(key)
      handleDirtyChange(key, false)
      const idx = curTabs.findIndex((x) => x.key === key)
      const next = curTabs.filter((x) => x.key !== key)
      setTabs(next)
      if (activeKeyLiveRef.current === key) {
        if (next.length === 0) {
          setActiveKey(null)
          openScratch() // 全关完 → 空白草稿
        } else {
          // 优先右边邻居，到头了用左边
          const pick = next[Math.min(idx, next.length - 1)] ?? next[next.length - 1]
          setActiveKey(pick.key)
          editorRef.current?.open({ key: pick.key, value: '', language: pick.language })
        }
      }
    },
    // handleDirtyChange / openScratch 在本渲染作用域里声明得比这里靠后；把它们加进依赖数组
    // 会在渲染期求值时抛 TDZ（先访问后声明），故此处有意省略。closeTab 只在事件里触发，
    // 拿到的都是 live ref / 最新值，不会被「旧闭包」坑到。
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [confirm, t]
  )

  // 从标签里移除一批 key（目录删除 / 移除根目录时用），并从 tabs / activeKey 里同步清掉。
  // 返回「被移除的标签里是否包含当前激活的」，调用方据此决定要不要 openScratch 兜底。
  const dropTabsByKeys = useCallback((keys: string[]) => {
    const kset = new Set(keys)
    const cur = activeKeyLiveRef.current
    const removedActive = !!cur && kset.has(cur)
    if (removedActive) setActiveKey(null)
    setTabs((prev) => prev.filter((x) => !kset.has(x.key)))
    return removedActive
  }, [])

  // 切换到已打开的标签（点标签栏）：把 Editor 切到那个 model，不重读内容
  const switchTab = useCallback((key: string) => {
    if (key === activeKeyLiveRef.current) return
    const file = tabsLiveRef.current.find((x) => x.key === key)
    if (!file) return
    setActiveKey(key)
    editorRef.current?.open({ key, value: '', language: file.language })
  }, [])

  // 批量关闭一批标签（标签右键菜单：关闭其他/右侧/全部）。只要这批里含未保存的脏标签，
  // 就先弹一次确认带过整批；然后逐个 editor.close 并从 tabs 里移除；若删掉了当前激活的，
  // 就在剩余里选一个激活（优先 prefer，其次最左），一个不剩就退回空白草稿。
  const closeMany = useCallback(
    async (keysToClose: string[], prefer?: string) => {
      const curTabs = tabsLiveRef.current
      const kset = new Set(keysToClose)
      const targets = curTabs.filter((x) => kset.has(x.key))
      if (targets.length === 0) return
      const dirtyCount = targets.filter((x) => dirtyRef.current.has(x.key)).length
      if (dirtyCount > 0) {
        const ok = await confirm.ask({
          title:
            dirtyCount === 1
              ? t('confirm.closeMany.one')
              : t('confirm.closeMany.many', { count: dirtyCount }),
          lines: [t('confirm.closeMany.unsaved')],
          confirmText: t('confirm.closeTab.ok'),
          tone: 'danger',
        })
        if (!ok) return
      }
      for (const x of targets) {
        editorRef.current?.close(x.key)
        handleDirtyChange(x.key, false)
      }
      const remaining = curTabs.filter((x) => !kset.has(x.key))
      setTabs(remaining)
      const curActive = activeKeyLiveRef.current
      if (curActive && kset.has(curActive)) {
        if (remaining.length === 0) {
          setActiveKey(null)
          openScratch()
        } else {
          const pick = remaining.find((x) => x.key === prefer) ?? remaining[0]
          setActiveKey(pick.key)
          editorRef.current?.open({ key: pick.key, value: '', language: pick.language })
        }
      }
    },
    // 同 closeTab：handleDirtyChange / openScratch 声明在本函数靠后，加入 deps 会触发 TDZ。
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [confirm, t]
  )

  // 标签右键菜单命令（同 VS Code）：
  // 关闭本标签 / 关闭其他 / 关闭右侧 / 关闭全部
  const menuCloseOthers = useCallback(
    (key: string) => closeMany(tabsLiveRef.current.filter((x) => x.key !== key).map((x) => x.key), key),
    [closeMany]
  )
  const menuCloseToRight = useCallback(
    (key: string) => {
      const cur = tabsLiveRef.current
      const i = cur.findIndex((x) => x.key === key)
      if (i === -1) return
      closeMany(cur.slice(i + 1).map((x) => x.key), key)
    },
    [closeMany]
  )
  const menuCloseAll = useCallback(
    () => closeMany(tabsLiveRef.current.map((x) => x.key)),
    [closeMany]
  )


  // 底部状态栏的「Ln, Col / Spaces: N」来源，由 Editor 上报（光标移动 / 换文件时刷新）
  const [cursor, setCursor] = useState<CursorStatus | null>(null)
  const [running, setRunning] = useState(false)
  const [notice, setNotice] = useState<Notice | null>(null)
  /** 把 Demo 存到本地时的写入进度（null 表示当前没有正在进行的保存） */
  const [saveProgress, setSaveProgress] = useState<{
    file: string
    doneFiles: number
    totalFiles: number
    writtenBytes: number
    totalBytes: number
  } | null>(null)
  /** 写入 demo 时置 true，writeFilesInto 每写一个文件前检查它；取消后立即复位 */
  const cancelSaveRef = useRef(false)
  /** 是否正在执行取消（点了确认、在清理残留）。用于把取消按钮置灰防重复 */
  const [cancelling, setCancelling] = useState(false)
  /** 单个文件保存的防重入锁：写入中再按 Ctrl+S 直接忽略，避免叠加/排队 */
  const savingRef = useRef(false)
  /** 是否正在保存当前文件。用于禁用保存按钮并显示「保存中…」，避免用户以为卡死 */
  const [saving, setSaving] = useState(false)

  const editorRef = useRef<EditorHandle>(null)
  const consoleRef = useRef<ConsoleHandle>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const localMetaRef = useRef(new Map<string, LocalMeta>())

  // 只注册一次的回调（Ctrl+S、window focus）要读到最新状态，走 ref。
  // 写 ref 放在 effect 里而不是渲染中：渲染阶段写 ref 会被 react-hooks 规则拦下，
  // 而这两个 ref 只有用户交互时才读，晚一个 commit 也没关系。
  const activeRef = useRef<ActiveFile | null>(null)
  const dirtyRef = useRef(dirtyKeys)
  useEffect(() => {
    activeRef.current = active
  }, [active])
  useEffect(() => {
    dirtyRef.current = dirtyKeys
  }, [dirtyKeys])

  /*
    runner 是模块级单例，拿不到 hook，报错文案只能由这里注入。

    注入的是「读 ref 的函数」而不是 t 本身：这样切语言之后 runner 手里不会还攥着
    旧字典，而且注册只发生一次（依赖是空数组），不用每次换语言重挂一遍。
    已经打印在 Console 里的旧行不跟着变 —— 那是历史记录，按当时的语言留着。
  */
  const tRef = useRef(t)
  useEffect(() => {
    tRef.current = t
  })
  useEffect(() => {
    codeRunner.setTranslator(() => tRef.current)
    return () => codeRunner.setTranslator(null)
  }, [])

  const language = active?.language ?? 'javascript'
  const runnable = isRunnable(language)

  // 切到 TS 时提前初始化 esbuild wasm（~10MB），别等到点「运行」才干等
  useEffect(() => {
    if (language === 'typescript') warmupCompiler()
  }, [language])

  useEffect(() => () => codeRunner.destroy(), [])

  useEffect(() => {
    codeRunner.setOnDone(() => setRunning(false))
    return () => codeRunner.setOnDone(null)
  }, [])

  // info 类提示是「已保存」这种一次性反馈，自己消失；warn / error 要留着等用户看见
  useEffect(() => {
    if (notice?.tone !== 'info') return
    const timer = setTimeout(() => setNotice(null), 2500)
    return () => clearTimeout(timer)
  }, [notice])

  useEffect(() => {
    if (!active) return
    try {
      localStorage.setItem(ACTIVE_KEY, active.key)
    } catch {
      // 记不住就记不住
    }
  }, [active])

  const handleDirtyChange = useCallback((key: string, dirty: boolean) => {
    setDirtyKeys((prev) => {
      if (prev.has(key) === dirty) return prev
      const next = new Set(prev)
      if (dirty) next.add(key)
      else next.delete(key)
      return next
    })
  }, [])

  const openTemplate = useCallback(
    async (path: string) => {
      const key = `builtin:${path}`
      const name = path.replace('../template/', '')
      try {
        // Demo 源码是打包进来的字符串，重复读代价忽略不计；
        // model 已经存在时 open() 会忽略 value，用户改过的内容不会被冲掉
        const code = await loadTemplate(path)
        const language = languageFromFilename(name)
        editorRef.current?.open({ key, value: code, language })
        openOrActivate({ key, kind: 'builtin', name, language, encoding: 'UTF-8' })
        consoleRef.current?.clear()
      } catch (err) {
        setNotice({
          tone: 'error',
          text: t('notice.demoLoadFailed', { message: messageOf(err, t) }),
        })
      }
    },
    [t, openOrActivate]
  )

  const openLocalFile = useCallback(
    async (entry: FileEntry) => {
      const language = languageOf(entry.name)
      if (!language) {
        setNotice({ tone: 'warn', text: t('notice.notTextFile', { name: entry.name }) })
        return
      }
      const key = `local:${entry.path}`
      try {
        if (editorRef.current?.has(key)) {
          // model 还在（可能有未保存改动），只切过去，不重新读盘
          editorRef.current.open({ key, value: '', language })
          if (!localMetaRef.current.has(key)) {
            localMetaRef.current.set(key, {
              handle: entry.handle,
              lastModified: await getLastModified(entry.handle),
            })
          }
        } else {
          const { text, lastModified, encoding } = await readTextFile(entry.handle)
          editorRef.current?.open({ key, value: text, language })
          localMetaRef.current.set(key, { handle: entry.handle, lastModified, encoding })
        }
        openOrActivate({
          key,
          kind: 'local',
          name: entry.name,
          language,
          encoding: localMetaRef.current.get(key)?.encoding ?? 'UTF-8',
          handle: entry.handle,
        })
        consoleRef.current?.clear()
        editorRef.current?.focus()
      } catch (err) {
        setNotice({ tone: 'error', text: messageOf(err, t) })
      }
    },
    [t, openOrActivate]
  )

  const openScratch = useCallback(() => {
    const key = 'scratch'
    editorRef.current?.open({ key, value: '', language: 'javascript' })
    // model 可能早就存在（上次的草稿），open 不会动它的内容，这里显式清空
    editorRef.current?.replace(key, '')
    openOrActivate({
      key,
      kind: 'scratch',
      name: t('file.scratch'),
      language: 'javascript',
      encoding: 'UTF-8',
    })
    consoleRef.current?.clear()
    editorRef.current?.focus()
  }, [t, openOrActivate])

  /*
    删除 / 改名的收尾工作。

    编辑器里的 model、未保存标记、写回磁盘用的 handle 都挂在 `local:<path>` 这个 key 上，
    路径一变（或者整棵没了）就得把这些一起处理掉。目录操作还要连子树里打开过的文件一起，
    所以先按前缀把受影响的 key 找出来。
  */

  /** 一个路径牵连到的所有 key：它自己，以及 `<path>/` 下面的全部后代。 */
  const affectedKeys = (path: string): string[] => {
    const prefix = `local:${path}`
    const hit = (key: string) => key === prefix || key.startsWith(`${prefix}/`)
    // 打开过的文件都会在 localMeta 里留一条记录，脏的那些和当前这个再兜一遍。
    // Set / Map 先摊平成数组再交给 lodash：lodash 4 不认识它们的迭代器
    const keys = [
      ...localMetaRef.current.keys(),
      ...dirtyKeys,
      ...tabs.map((x) => x.key),
    ]
    return uniq(keys.filter(hit))
  }

  async function handleDelete(entry: Entry) {
    const keys = affectedKeys(entry.path)
    const unsaved = keys.filter((key) => dirtyKeys.has(key)).length
    const ok = await confirm.ask({
      title: t('confirm.delete.title', { name: entry.name }),
      lines: [
        entry.kind === 'directory'
          ? t('confirm.delete.dir', { path: displayPath(entry.path) })
          : t('confirm.delete.file', { path: displayPath(entry.path) }),
        ...(unsaved > 0
          ? [
              entry.kind === 'directory'
                ? t('confirm.delete.unsavedInDir', { count: unsaved })
                : t('confirm.delete.unsavedFile'),
            ]
          : []),
        t('confirm.delete.irreversible'),
      ],
      confirmText: t('confirm.delete.ok'),
      tone: 'danger',
    })
    if (!ok) return
    // 失败原因已经在 workspace.error 里，走侧边栏那条提示条
    if (!(await workspace.deleteEntry(entry))) return

    for (const key of keys) {
      editorRef.current?.close(key)
      handleDirtyChange(key, false) // close 不触发 onDirtyChange
      localMetaRef.current.delete(key)
    }
    // 标签栏里同步移除这些文件的标签；删掉的正是激活的那个就退回空白草稿。
    // 不引入「一个都没打开」这种没验证过的状态（其它没删的标签仍在栏里，不影响）。
    if (dropTabsByKeys(keys)) openScratch()
    setNotice({ tone: 'info', text: t('notice.deleted', { name: entry.name }) })
  }

  /**
   * 根目录菜单里的「移除目录」：只是把这个目录从列表里去掉，磁盘上什么都不动。
   *
   * 但它不是「看一眼再点回来」那种操作 —— roots 会同步写回 IndexedDB，
   * 重开页面也回不来，得再走一次系统的文件夹选择框（授权只能由用户手势发起）。
   * 而且这棵树里打开着的文件得跟着关掉：它们的 key 里带着这个根的 id，
   * 目录一移除就没有对应的树了，留着只会变成一堆指不回去的孤立 model。
   * 所以照删除那套先问一句，未保存的改动数量写进文案里。
   */
  async function handleCloseRoot(root: WorkspaceRoot) {
    const keys = affectedKeys(root.id)
    const unsaved = keys.filter((key) => dirtyKeys.has(key)).length
    const ok = await confirm.ask({
      title: t('confirm.closeRoot.title', { name: root.name }),
      lines: [
        t('confirm.closeRoot.listOnly'),
        ...(keys.length > 0
          ? [
              unsaved > 0
                ? t('confirm.closeRoot.openFilesUnsaved', { count: keys.length, unsaved })
                : t('confirm.closeRoot.openFiles', { count: keys.length }),
            ]
          : []),
        t('confirm.closeRoot.reauth'),
      ],
      confirmText: t('confirm.closeRoot.ok'),
      tone: unsaved > 0 ? 'danger' : 'default',
    })
    if (!ok) return

    workspace.forget(root.id)
    for (const key of keys) {
      editorRef.current?.close(key)
      handleDirtyChange(key, false) // close 不触发 onDirtyChange
      localMetaRef.current.delete(key)
    }
    // 标签栏同步移除；激活的那个就在这棵树里则退回空白草稿（和删除时一致）
    if (dropTabsByKeys(keys)) openScratch()
    setNotice({ tone: 'info', text: t('notice.rootRemoved', { name: root.name }) })
  }

  /**
   * 新 handle 只能重新从磁盘取：目录改名实际是「整棵复制一份 + 删掉原来的」，
   * 缓存里那些 handle 指向的都是已经被删掉的旧目录。
   * lastModified 基线保留 —— 内容没变，没必要让 focus 时的对比误报一次外部改动。
   */
  async function handleRenamed(from: Entry, to: Entry) {
    // 收集「改名后每个旧 key → 新信息」的映射，最后统一刷一次 tabs / activeKey。
    // 一个目录改名可能连带改多个已打开文件的 key（子树里的）。
    const oldActive = active?.key
    const tabUpdates = new Map<string, ActiveFile>()
    for (const oldKey of affectedKeys(from.path)) {
      const newPath = to.path + oldKey.slice(`local:${from.path}`.length)
      const newKey = `local:${newPath}`
      const name = newPath.slice(newPath.lastIndexOf('/') + 1)
      const language = languageOf(name) ?? undefined
      // rekey 会为新 key 报一次脏状态；旧 key 那边和 close 一样不发通知，这里自己清
      editorRef.current?.rekey(oldKey, newKey, language)
      handleDirtyChange(oldKey, false)

      const meta = localMetaRef.current.get(oldKey)
      localMetaRef.current.delete(oldKey)
      const handle = to.kind === 'file' ? to.handle : await resolveFilePath(newPath)
      if (handle && meta) {
        localMetaRef.current.set(newKey, {
          handle,
          lastModified: meta.lastModified,
          encoding: meta.encoding,
        })
      }
      const existing = tabs.find((x) => x.key === oldKey)
      if (existing) {
        tabUpdates.set(oldKey, {
          ...existing,
          key: newKey,
          name,
          language: language ?? existing.language,
          handle: handle ?? existing.handle,
        })
      }
    }
    if (tabUpdates.size > 0) {
      setTabs((prev) =>
        prev.map((x) => {
          const upd = tabUpdates.get(x.key)
          return upd ? upd : x
        })
      )
      if (oldActive && tabUpdates.has(oldActive)) {
        setActiveKey(tabUpdates.get(oldActive)!.key)
      }
    }
    setNotice({ tone: 'info', text: t('notice.renamed', { name: to.name }) })
  }

  // 新建文件 / 新建目录 / 草稿转正，都走侧边栏里那一个行内命名输入框。
  // 状态放在这里而不是 Sidebar 里：草稿转正是从这边的「保存」发起的，两个入口共用它。
  const fileDraft = useFileDraft(workspace, confirm, {
    onOpenFile: (entry, savedFromScratch) => {
      void openLocalFile(entry).then(() => {
        if (!savedFromScratch) return
        // 草稿转正：内容已经在新 model 里了。旧的 scratch model 留着的话，
        // 侧边栏和标题上会一直挂着一个「未保存」的点。
        // 撤销历史跟着它一起没 —— 换 model 就留不住，这里认了。
        editorRef.current?.close('scratch')
        handleDirtyChange('scratch', false) // close 不会触发 onDirtyChange
        // 标签栏里那张「草稿」也撤掉 —— 它对应的 model 已关，留着会指到一个空标签。
        // 新保存的本地文件此刻已是激活标签（openLocalFile 把它激活了），activeKey 不用动
        setTabs((prev) => prev.filter((x) => x.key !== 'scratch'))
        setNotice({ tone: 'info', text: t('notice.saved', { name: entry.name }) })
      })
    },
    onRenamed: (from, to) => void handleRenamed(from, to),
    onNotice: setNotice,
  })

  // 首屏打开哪个文件：优先接上次那个，没有就是一张白纸。
  // 等 workspace.ready 是因为上次那个可能是本地文件，得先知道目录到底恢复没恢复。
  const bootedRef = useRef(false)
  useEffect(() => {
    if (bootedRef.current || !workspace.ready) return
    bootedRef.current = true

    let saved: string | null = null
    try {
      saved = localStorage.getItem(ACTIVE_KEY)
    } catch {
      // 读不到就按默认来
    }

    // 上次那个本地文件：path 的第一段是根 id，resolveFilePath 自己会判断
    // 那个根这次在不在、有没有权限，拿不到就退回空白草稿
    if (saved?.startsWith('local:')) {
      const path = saved.slice('local:'.length)
      void resolveFilePath(path).then((handle) =>
        handle ? openLocalFile({ kind: 'file', name: handle.name, path, handle }) : openScratch()
      )
      return
    }
    // 上次在看某个 Demo 就接上（前提是它还在）。其余情况一律空白 ——
    // 首屏塞一份别人的代码，用户第一件事得先把它删掉
    const builtin = saved?.startsWith('builtin:') ? saved.slice('builtin:'.length) : null
    if (builtin && templates.includes(builtin)) {
      void openTemplate(builtin)
      return
    }
    openScratch()
  }, [workspace.ready, resolveFilePath, templates, openTemplate, openLocalFile, openScratch])

  // 正在写 demo 时离开/刷新：尽力弹一次确认。浏览器可能淡化甚至不显示自定义文案，
  // 但这是唯一不需要持久化就能拦一下的手段；真正的兜底在下面那条「上次没存完」提示。
  useEffect(() => {
    if (saveProgress === null) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      // 一些浏览器要求设置了 returnValue 才会弹
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [saveProgress])

  // 检测到「上次没存完」的 demo 残留时，引导清理。清理直接用左侧已打开根目录的
  // handle 删，不需要重新选文件夹（父目录已在侧边栏且已授权）。
  const handleDetectedResiduals = useCallback(
    async (residuals: { root: WorkspaceRoot; demo: ResidualDemo }[]) => {
      const ok = await confirm.ask({
        title: t('confirm.cleanupInterrupted.title'),
        lines: [
          t('confirm.cleanupInterrupted.bodyMultiple', {
            labels: residuals.map((r) => r.demo.label).join('、'),
          }),
        ],
        confirmText: t('confirm.cleanupInterrupted.ok'),
        tone: 'danger',
      })
      if (!ok) return
      let cleaned = 0
      for (const { root, demo } of residuals) {
        try {
          await removeEntry(root.handle, demo.dirName, 'directory')
          cleaned += 1
        } catch {
          // 单个失败不影响其他；失败的那个可能是权限问题，留给用户自行处理
        }
      }
      await idbDel(DEMO_SAVE_KEY).catch(() => {})
      try {
        sessionStorage.removeItem(DEMO_SAVING_KEY)
      } catch {
        /* ignore */
      }
      if (cleaned > 0) {
        setNotice({ tone: 'info', text: t('notice.demoSaveCleaned', { count: cleaned }) })
      }
    },
    [confirm, t]
  )

  // 主判据：IndexedDB 里那条「进行中」记录。优先用左侧已打开、可写的根目录 handle 来删
  // （记录里存的 parent handle 刷新后可能陈旧、removeEntry 会拒绝），找不到才让用户重选。
  const handleInterruptedRecord = useCallback(
    async (record: InterruptedSave) => {
      const ok = await confirm.ask({
        title: t('confirm.cleanupInterrupted.title'),
        lines: [t('confirm.cleanupInterrupted.bodyRecord', { label: record.label })],
        confirmText: t('confirm.cleanupInterrupted.ok'),
        tone: 'danger',
      })
      if (!ok) return
      // 清理记录/标记：删成功、或残留目录已不存在（NotFound）都算完事
      const clearSave = () => {
        void idbDel(DEMO_SAVE_KEY).catch(() => {})
        try {
          sessionStorage.removeItem(DEMO_SAVING_KEY)
        } catch {
          /* ignore */
        }
      }
      // 尝试删；目录已不存在时返回 'gone'，删成功返回 'ok'，其它错误抛出
      const tryRemove = async (dir: FileSystemDirectoryHandle): Promise<'ok' | 'gone'> => {
        try {
          await removeEntry(dir, record.dirName, 'directory')
          return 'ok'
        } catch (err) {
          if (err instanceof DOMException && err.name === 'NotFoundError') return 'gone'
          throw err
        }
      }
      // 优先用左侧已打开、且名字对得上的根目录 handle —— 它是最活跃、肯定可写的那个
      const openRoot = workspace.roots.find(
        (r) => !r.needsPermission && r.handle.name === record.parent.name
      )
      const target = openRoot?.handle ?? record.parent
      const perm = await queryPermission(target, 'readwrite').catch(() => 'unavailable')
      if (perm === 'granted') {
        try {
          const outcome = await tryRemove(target)
          clearSave()
          setNotice({
            tone: 'info',
            text: outcome === 'gone' ? t('notice.demoSaveGone') : t('notice.demoSaveCleaned', { count: 1 }),
          })
        } catch (err) {
          setNotice({ tone: 'error', text: messageOf(err, t) })
        }
        return
      }
      // 权限不足或句柄陈旧：重新选一次父文件夹来重新授权，再删
      const parent = await pickDirectory().catch(() => null)
      if (!parent) return // 用户取消，记录留着下次再说
      try {
        const outcome = await tryRemove(parent)
        clearSave()
        setNotice({
          tone: 'info',
          text: outcome === 'gone' ? t('notice.demoSaveGone') : t('notice.demoSaveCleaned', { count: 1 }),
        })
      } catch (err) {
        setNotice({ tone: 'error', text: messageOf(err, t) })
      }
    },
    [confirm, t, workspace.roots]
  )

  // 打开页面后，等目录恢复完，先看同步「正在保存」标记和 IndexedDB 记录，都没有再扫磁盘兜底。
  const cleanupPromptedRef = useRef(false)
  useEffect(() => {
    if (cleanupPromptedRef.current || !workspace.ready) return
    cleanupPromptedRef.current = true
    let cancelled = false
    void (async () => {
      // 1) 同步「正在保存」标记：同标签页刷新后第一次加载就能读到，不受 IndexedDB 事务时序影响
      let savingMark = false
      try {
        savingMark = sessionStorage.getItem(DEMO_SAVING_KEY) === '1'
      } catch {
        /* ignore */
      }
      // 2) 主判据：进行中记录。写入中途刷新/失败会留下它，全部写完才删。
      //    注意这里不读 cancelled：StrictMode 下 effect 会被双调用、cleanup 会把上一次
      //    的 cancelled 置 true，若主判据也受它影响，记录明明在却会被跳过、不弹窗。
      const record = await idbGet<InterruptedSave>(DEMO_SAVE_KEY).catch(() => null)
      if (record) {
        void handleInterruptedRecord(record)
        return
      }
      // 3) 标记在但记录丢了（极端情况），扫磁盘兜底
      if (savingMark) {
        const found: { root: WorkspaceRoot; demo: ResidualDemo }[] = []
        for (const root of workspace.roots) {
          if (root.needsPermission) continue
          const demos = await workspace.detectResidualDemos(root)
          for (const demo of demos) found.push({ root, demo })
        }
        if (found.length > 0) void handleDetectedResiduals(found)
        return
      }
      // 4) 纯磁盘扫描兜底：记录丢了也没标记（比如旧版本），主动扫已授权 root
      const found: { root: WorkspaceRoot; demo: ResidualDemo }[] = []
      for (const root of workspace.roots) {
        if (root.needsPermission) continue
        const demos = await workspace.detectResidualDemos(root)
        for (const demo of demos) found.push({ root, demo })
      }
      if (!cancelled && found.length > 0) void handleDetectedResiduals(found)
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace.ready, handleInterruptedRecord, handleDetectedResiduals])

  /**
   * 把全部 Demo 存进用户选的文件夹。
   *
   * 这是「真的想拿它们练手」的入口：builtin: 那条路能改但存不回去（源码是打包进来的
   * 字符串），落到磁盘上之后它们就是普通的本地文件，Ctrl+S 直接写回。
   */
  async function handleSaveDemos() {
    let files
    try {
      files = await loadAllTemplates()
    } catch (err) {
      setNotice({ tone: 'error', text: t('notice.demoReadFailed', { message: messageOf(err, t) }) })
      return
    }
    // 写磁盘前先确认一次：会建目录、落文件，误点会把一堆文件写进用户文件夹
    const proceed = await confirm.ask({
      title: t('confirm.saveDemos.title'),
      lines: [t('confirm.saveDemos.body', { count: files.length })],
      confirmText: t('confirm.saveDemos.ok'),
    })
    if (!proceed) return
    // 这里不提前 setSaveProgress：saveBundle 第一步是弹文件夹选择框，用户还没选、
    // 还没开始写入，这时候显示「正在写入」是错的。进度面板交给 writeFilesInto 在
    // 真正开始落盘时再亮起（见下方 onProgress 的首次回调）。
    cancelSaveRef.current = false
    try {
      const saved = await workspace.saveBundle(DEMOS_DIR, files, {
        onProgress: (p) => setSaveProgress(p),
        shouldCancel: () => cancelSaveRef.current,
        onOpen: async ({ label, count }) => {
          // 落盘之后问一句：把选中的文件夹接管成左侧根目录是会改变界面布局的动作，
          // 应该由用户明确同意才做，而不是默认静默执行。
          return await confirm.ask({
            title: t('confirm.openDemos.title'),
            lines: [t('confirm.openDemos.body', { count, label })],
            confirmText: t('confirm.openDemos.ok'),
          })
        },
      })
      // null 有两种：用户在选择器里取消（不该有任何动静），或者出错
      // （原因已经在侧边栏那条 workspace.error 提示条上了）
      if (!saved) return
      setNotice({
        tone: 'info',
        text: saved.opened
          ? t('notice.demosSaved', { count: saved.count, label: saved.label })
          : t('notice.demosSavedClosed', { count: saved.count, label: saved.label }),
      })
    } finally {
      setSaveProgress(null)
      setCancelling(false)
    }
  }

  function handleImport() {
    fileInputRef.current?.click()
  }

  // 复制条目的应用内相对路径（如 `test/jotter-demos`）。浏览器拿不到真实绝对路径，
  // 所以只能给这个；用户可自行在资源管理器 / Finder 里按路径定位。
  function handleCopyPath(path: string) {
    const label = workspace.displayPath(path)
    navigator.clipboard
      ?.writeText(label)
      .then(() => setNotice({ tone: 'info', text: t('notice.pathCopied', { path: label }) }))
      .catch(() => setNotice({ tone: 'error', text: t('notice.copyFailed') }))
  }

  // 写入 demo 时用户点了「取消」：先二次确认（会删掉已写文件），确认后才置标志。
  // writeFilesInto 会在下一个文件前停下，saveBundle 的 catch 里删掉残留目录并返回 null。
  async function handleCancelSave() {
    if (cancelling) return
    const ok = await confirm.ask({
      title: t('confirm.cancelSave.title'),
      lines: [t('confirm.cancelSave.body')],
      confirmText: t('confirm.cancelSave.ok'),
      tone: 'danger',
    })
    if (!ok) return
    setCancelling(true)
    cancelSaveRef.current = true
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const key = `imported:${file.name}`
    const language = languageFromFilename(file.name)
    file
      .text()
      .then((text) => {
        editorRef.current?.open({ key, value: text, language })
        // 同名文件再导入一次时内容可能不一样，而 open 不会覆盖已有 model
        editorRef.current?.replace(key, text)
        openOrActivate({ key, kind: 'imported', name: file.name, language, encoding: 'UTF-8' })
        consoleRef.current?.clear()
      })
      .catch((err) =>
        setNotice({ tone: 'error', text: t('notice.fileReadFailed', { message: messageOf(err, t) }) })
      )
    // 重置 input，允许再次导入同一文件
    e.target.value = ''
  }

  function downloadCode(file: ActiveFile, code: string) {
    const ext = file.language === 'typescript' ? 'ts' : 'js'
    // 内置 Demo 的 name 是带目录的相对路径，下载文件名不能有斜杠
    const base = file.name.split('/').pop() || `code.${ext}`
    const filename = withLanguageExt(file.kind === 'scratch' ? `code.${ext}` : base, file.language)

    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleDownload() {
    if (!active) return
    downloadCode(active, editorRef.current?.getValue(active.key) ?? '')
  }

  /** Ctrl+S：本地文件写回磁盘；草稿在开着本地目录时存进选中的目录；其余退回下载。 */
  const handleSave = useCallback(async () => {
    // 防重入：上一次还没写完就不要再排一个。用 ref 而不是 state —— 保存可能很快，
    // state 更新是异步的，两个连续的 Ctrl+S 会读不到刚 set 的 true
    if (savingRef.current) return
    const file = activeRef.current
    if (!file) return
    const code = editorRef.current?.getValue(file.key) ?? ''

    if (file.kind !== 'local' || !file.handle) {
      // 草稿 + 已经打开了本地目录：它缺的只是一个名字和一个位置，
      // 让用户在侧边栏里补上，比丢进下载目录有用得多
      if (file.kind === 'scratch' && workspace.hasRoot) {
        fileDraft.start('file', {
          content: code,
          defaultName: t('file.untitled', { ext: file.language === 'typescript' ? 'ts' : 'js' }),
        })
        setNotice({
          tone: 'info',
          text: t('notice.draftWillSaveTo', { path: displayPath(workspace.target) }),
        })
        return
      }
      downloadCode(file, code)
      setNotice({ tone: 'info', text: t('notice.noWriteTarget') })
      return
    }
    savingRef.current = true
    setSaving(true)
    try {
      const lastModified = await writeTextFile(file.handle, code)
      localMetaRef.current.set(file.key, { handle: file.handle, lastModified })
      editorRef.current?.markSaved(file.key)
      setNotice({ tone: 'info', text: t('notice.saved', { name: file.name }) })
    } catch (err) {
      setNotice({ tone: 'error', text: t('notice.saveFailed', { message: messageOf(err, t) }) })
    } finally {
      savingRef.current = false
      setSaving(false)
    }
    // fileDraft 每次渲染都是新对象，这个 useCallback 实际不再缓存 —— 无所谓：
    // Editor 是通过 ref 读 onSave 的，换个函数身份不会让它重建
  }, [workspace.hasRoot, workspace.target, displayPath, fileDraft, t])

  /*
    回到页面时对一下 mtime。没有文件监听 API，这是唯一能发现「文件被别的编辑器改过」
    的时机，也正好是用户从别处切回来的那一刻。
    干净就静默重载，脏了就只提示 —— 直接覆盖用户没保存的改动是最不该做的事。
  */
  useEffect(() => {
    const onFocus = async () => {
      const file = activeRef.current
      if (file?.kind !== 'local' || !file.handle) return
      const meta = localMetaRef.current.get(file.key)
      if (!meta) return
      try {
        if ((await getLastModified(file.handle)) === meta.lastModified) return
        if (dirtyRef.current.has(file.key)) {
          setNotice({
            tone: 'warn',
            text: t('notice.externalChanged', { name: file.name }),
          })
          return
        }
        const { text, lastModified, encoding } = await readTextFile(file.handle)
        editorRef.current?.replace(file.key, text)
        localMetaRef.current.set(file.key, { handle: file.handle, lastModified, encoding })
        // 正在看的这个文件编码也可能被外部改过，顺手刷新对应标签 / 状态栏的编码
        setTabs((prev) => prev.map((x) => (x.key === file.key ? { ...x, encoding } : x)))
        setNotice({ tone: 'info', text: t('notice.reloaded', { name: file.name }) })
      } catch {
        // 文件被删/被移走，等用户自己刷新目录，不用弹提示打扰
      }
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [t])

  // 运行：在 Web Worker 里执行用户代码，主线程不卡，死循环也能用「停止」强制终止。
  // TS 代码会先在主线程用 esbuild 转成 JS（首次需要等 wasm 就绪）。
  function runCode() {
    if (!active || !runnable) return
    consoleRef.current?.clear()
    void codeRunner.run(editorRef.current?.getValue(active.key) ?? '', language)
    setRunning(true)
  }

  // 停止：terminate worker，立即终止运行（包括 while(true) 死循环）
  function stopCode() {
    codeRunner.stop()
    setRunning(false)
  }

  // 底部状态栏左侧要展示「目录 + 文件名」，像 VS Code 那样一条横排、目录淡色文件名高亮。
  // 只有 local（key=local:<相对根路径>）与 builtin（name 本身就是它相对 demo 根的子路径，
  // 例如 overrides/promise-order.js）带目录可拆；导入 / 草稿没有目录归属，只显示裸名。
  const footerLoc =
    active == null
      ? null
      : (() => {
          const logical =
            active.kind === 'local'
              ? displayPath(active.key.slice('local:'.length))
              : active.name
          const i = logical.lastIndexOf('/')
          return i === -1
            ? { dir: '', file: logical }
            : { dir: logical.slice(0, i), file: logical.slice(i + 1) }
        })()

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[var(--app-bg)] text-[var(--text-primary)]">
      {/* 顶部工具栏 */}
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-[var(--border)] bg-[var(--panel-bg)] px-4 py-3">
        <div className="flex items-center gap-2 text-base font-semibold">
          <JotterMark className="size-5" />
          Jotter
        </div>

        {/* 「新建」挪到文件栏的标题行上去了：它和那边的「新建文件 / 新建文件夹」是一类事，
            顶栏留给运行相关的东西。
            「导入」只在不支持目录 API 的浏览器上留着 —— 那里没有「打开文件夹」，
            这个隐藏的 <input type=file> 是唯一能读到本地文件的路（侧栏那段提示也指着它）。
            Chromium 上它是纯冗余：导进来的文件存不回原处，只能下载。 */}
        {!workspace.supported && (
          <>
            <div aria-hidden className="h-5 w-px shrink-0 bg-[var(--border)]" />
            <Button variant="ghost" size="sm" onClick={handleImport}>
              <Icon className="icon-[lucide--upload]" />
              {t('header.import')}
            </Button>
          </>
        )}

        <div className="ml-auto flex items-center gap-2">
          {/* 语言显示移到底部状态栏（见页面底部），右上角不再放语言徽标 */}

          {/* 语言。形状与右边的主题下拉完全同构（三态 + 跟随系统）。
              触发器固定用 languages 图标，不随当前值变：「中 / En」没有 sun/moon 那样
              自明的一对图标，图标一直换反而看不出这个按钮是干什么用的。
              三项都不配图标（主题那边三项都有）—— 只给「跟随系统」挂一个 monitor 的话，
              另外两项的文字会比它少缩进一个图标的宽度，三行对不齐。
              两个语言名刻意不翻译：看不懂当前界面语言的人，正需要用目标语言认出自己那一项。 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                title={t('header.lang')}
                aria-label={t('header.lang')}
                className="text-[var(--text-muted)]"
              >
                <Icon className="icon-[lucide--languages]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup
                value={langMode}
                onValueChange={(value) => setLangMode(value as LangMode)}
              >
                <DropdownMenuRadioItem value="zh">中文</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="system">
                  {t('header.lang.system')}
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                title={t('header.theme')}
                aria-label={t('header.theme')}
                className="text-[var(--text-muted)]"
              >
                {mode === 'light' ? (
                  <Icon className="icon-[lucide--sun]" />
                ) : mode === 'dark' ? (
                  <Icon className="icon-[lucide--moon]" />
                ) : (
                  <Icon className="icon-[lucide--monitor]" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup
                value={mode}
                onValueChange={(value) => setMode(value as ThemeMode)}
              >
                <DropdownMenuRadioItem value="dark">
                  <Icon className="icon-[lucide--moon]" />
                  {t('header.theme.dark')}
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="light">
                  <Icon className="icon-[lucide--sun]" />
                  {t('header.theme.light')}
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="system">
                  <Icon className="icon-[lucide--monitor]" />
                  {t('header.theme.system')}
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            asChild
            variant="ghost"
            size="icon-sm"
            className="text-[var(--text-muted)]"
            title={t('header.github')}
          >
            <a
              href="https://github.com/bohecola/jotter"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('header.github')}
            >
              <GithubMark className="size-[18px]" />
            </a>
          </Button>
        </div>
      </header>

      {/* 一条通用提示位：保存结果、外部改动、权限被拒、非文本文件都走这里 */}
      {notice && (
        <div
          className={`flex items-start gap-2 border-b px-4 py-2 text-[13px] ${NOTICE_STYLE[notice.tone]}`}
        >
          <span className="min-w-0 flex-1">{notice.text}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label={t('notice.close')}
            className="shrink-0 opacity-70 hover:opacity-100"
          >
            <Icon className="icon-[lucide--x] size-4" />
          </button>
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <Sidebar
          workspace={workspace}
          draft={fileDraft}
          templates={templates}
          activeKey={active?.key ?? null}
          dirtyKeys={dirtyKeys}
          onNewScratch={openScratch}
          onOpenTemplate={(path) => void openTemplate(path)}
          onOpenLocalFile={(entry) => void openLocalFile(entry)}
          onSaveDemos={() => void handleSaveDemos()}
          onCancelSave={() => void handleCancelSave()}
          cancelling={cancelling}
          saveProgress={saveProgress}
          onRenameEntry={fileDraft.startRename}
          onDeleteEntry={(entry) => void handleDelete(entry)}
          onCopyPath={handleCopyPath}
          onCloseRoot={(root) => void handleCloseRoot(root)}
        />

        {/* 主区域：编辑器 + 输出。铺满剩余空间，中间/外边不留距，两者可拖拽分栏 */}
        <main
          ref={mainRef}
          className="flex min-h-0 min-w-0 flex-1 overflow-hidden"
        >
          {/* 左：编辑器 */}
          <section
            data-editor-pane
            style={editorW === null ? undefined : { width: editorW, flex: '0 0 auto' }}
            className={cn(
              'flex min-h-0 min-w-0 flex-col overflow-hidden bg-[var(--panel-bg)]',
              editorW === null && 'flex-1'
            )}
          >
            {/* 编辑器头部（单行，与 Console 头部同高同线）：左=可滚动标签区，右=动作簇。
                动作不再单独叠一行，直接并进标签这行 —— 顶部只有一条，两块才显得是一整块 */}
            {/* 头部单行，底边与 Console 头部同一根发丝线，两栏才像一整块。
                激活 tab 用正文色底（--tab-active-bg），紧贴这条线向上与其连成一片 */}
            <div className="flex h-9 shrink-0 items-stretch border-b border-[var(--border)]">
              {/* 标签区（无左右箭头，滚动靠滚轮 / 悬浮进度条，同 VS Code）。
                  外层用命名 group/tabs 控进度条浮现，避免它作为裸 .group 把每个 tab
                  的 group-hover 一并点亮（那样整排关闭按钮会一起出现） */}
              <div className="group/tabs relative min-w-0 flex-1">
                <div
                  ref={tabScrollRef}
                  className="tabs-scrollbar absolute inset-0 flex items-stretch overflow-x-auto"
                >
              {tabs.map((tab) => {
                const isActive = tab.key === activeKey
                const dirtyTab = dirtyKeys.has(tab.key)
                const tabName = tab.kind === 'scratch' ? t('file.scratch') : tab.name
                return (
                  <ContextMenu key={tab.key}>
                    <ContextMenuTrigger asChild>
                      <div
                        data-active-tab={isActive ? 'true' : undefined}
                        className={cn(
                          // 激活：顶部主色横线 + 正文色底（向下融入编辑器）；非激活：浅一档底、
                          // 顶部无横线。每个 tab 右侧都留一条细线作相邻分隔（含激活）
                          'group flex min-w-0 shrink-0 items-stretch border-r border-r-[var(--border)]',
                          isActive
                            ? 'border-t-2 border-t-[var(--primary)] bg-[var(--tab-active-bg)]'
                            : 'border-t-2 border-t-transparent bg-[var(--tab-inactive-bg)]'
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => switchTab(tab.key)}
                          title={tabName}
                          className={cn(
                            'flex min-w-0 items-center gap-1.5 py-1.5 pl-2 pr-1 font-mono text-[12.5px]',
                            isActive
                              ? 'text-[var(--text-body)]'
                              : 'text-[var(--text-muted)] hover:text-[var(--text-body)]'
                          )}
                        >
                          <span className="max-w-[140px] truncate">{tabName}</span>
                          {dirtyTab && (
                            <span
                              title={t('editor.dirty')}
                              className="size-2 shrink-0 rounded-full bg-[var(--accent-symbol)]"
                            />
                          )}
                        </button>
                        <button
                          type="button"
                          aria-label={t('tab.closeAria', { name: tabName })}
                          title={t('tab.close')}
                          onClick={() => void closeTab(tab.key)}
                          className={cn(
                            'my-auto flex h-6 w-5 shrink-0 items-center justify-center rounded-sm text-[var(--text-faint)] transition-opacity hover:bg-[var(--panel-hover)] hover:text-[var(--text-body)]',
                            isActive
                              ? 'opacity-100'
                              : 'opacity-0 group-focus-within:opacity-100 group-hover:opacity-100'
                          )}
                        >
                          <Icon className="icon-[lucide--x] size-3.5" />
                        </button>
                      </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent
                      className="min-w-[160px]"
                      onCloseAutoFocus={(e) => e.preventDefault()}
                    >
                      <ContextMenuItem onSelect={() => void closeTab(tab.key)}>
                        {t('tab.ctx.close')}
                      </ContextMenuItem>
                      <ContextMenuItem onSelect={() => void menuCloseOthers(tab.key)}>
                        {t('tab.ctx.closeOthers')}
                      </ContextMenuItem>
                      <ContextMenuItem onSelect={() => void menuCloseToRight(tab.key)}>
                        {t('tab.ctx.closeRight')}
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem
                        variant="destructive"
                        onSelect={() => void menuCloseAll()}
                      >
                        {t('tab.ctx.closeAll')}
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                )
              })}
                </div>
                {/* 悬浮进度条：绝对贴容器底部、不占高度，方形直角、3px 半透明（同 VS Code），
                    悬停标签栏才浮现；只在标签溢出时出现。浮现后可按住 thumb 左右拖拽横滚 */}
                {tabBar.overflow && (
                  <div
                    aria-hidden
                    onPointerDown={startTabBarDrag}
                    className={cn(
                      'absolute inset-x-0 bottom-0 h-[10px] touch-none',
                      tabBarDragging
                        ? 'opacity-100'
                        : 'pointer-events-none opacity-0 transition-opacity duration-150 group-hover/tabs:pointer-events-auto group-hover/tabs:opacity-100'
                    )}
                  >
                    <div
                      className="pointer-events-none absolute bottom-0 h-[3px] bg-[var(--border-strong)]/60"
                      style={{ width: tabBar.w, left: tabBar.x }}
                    />
                  </div>
                )}
              </div>
              {/* 动作簇：保存/下载、停止、运行，针对当前激活文件，右端固定 */}
              <div className="flex shrink-0 items-center gap-0.5 border-l border-[var(--border)] px-1.5">
              <div className="flex items-center gap-1">
                {/* 草稿在开着本地目录时也能「保存」——存到侧边栏选中的那个目录里 */}
                {active?.kind === 'local' || (active?.kind === 'scratch' && workspace.hasRoot) ? (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => void handleSave()}
                    disabled={saving}
                    title={saving ? t('editor.saving') : t('editor.save')}
                    aria-label={saving ? t('editor.saving') : t('editor.save')}
                  >
                    <Icon className={`${saving ? 'icon-[lucide--loader-circle] animate-spin' : 'icon-[lucide--save]'}`} />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleDownload}
                    disabled={!active}
                    title={t('editor.download')}
                    aria-label={t('editor.download')}
                  >
                    <Icon className="icon-[lucide--download]" />
                  </Button>
                )}
                {/* 停止绝大多数时间是禁用态，用实心 destructive 会在工具栏里凭空压出一块
                    红色；改成 ghost + 红字，只在真的能点时才抢注意力 */}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-[var(--accent-error)] hover:bg-[var(--accent-error)]/10 hover:text-[var(--accent-error)]"
                  onClick={stopCode}
                  disabled={!running}
                  title={t('editor.stop')}
                  aria-label={t('editor.stop')}
                >
                  <Icon className="icon-[lucide--square]" />
                </Button>
                {/* Run 禁用时按钮是 pointer-events-none，title 不弹；用外层 span 承载说明 */}
                <span
                  className="inline-flex"
                  title={runnable ? t('editor.run') : t('editor.runDisabled')}
                >
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="text-[var(--primary)] hover:bg-[var(--primary)]/12 hover:text-[var(--primary)]"
                    onClick={runCode}
                    disabled={!runnable}
                    aria-label={t('editor.run')}
                  >
                    <Icon className="icon-[lucide--play] [&_[data-slot=icon]]:size-3.5" />
                  </Button>
                </span>
                </div>
              </div>
            </div>
            <div className="min-h-0 flex-1">
              <Editor
                ref={editorRef}
                onDirtyChange={handleDirtyChange}
                onSave={handleSave}
                onCursorStatus={setCursor}
              />
            </div>
          </section>

          {/* 右：输出。Console 头部与编辑器头部同为 h-9 + 一条 border-b，两条底边落在
              同一水平线，配合下方紧贴的分栏，两栏看起来像被中间一条发丝线分成的一整块 */}
          {/* 拖拽分栏：命中区本身铺面板色，因此不露 app 背景、没有“暗缝”；两栏基本紧贴，
              平时只留一根细缝线，鼠标放上去加粗到 4px 并亮主色，拖动时保持 hover 那个亮度 */}
          <div
            onPointerDown={startSplitDrag}
            title={t('panes.resize')}
            aria-label={t('panes.resize')}
            className="group relative w-[5px] shrink-0 cursor-col-resize touch-none select-none bg-[var(--panel-bg)]"
          >
            <span
              className={cn(
                'absolute inset-y-0 left-1/2 -translate-x-1/2 transition-[width,background-color] duration-100',
                splitting
                  ? 'w-[4px] bg-[var(--primary)]/70'
                  : 'w-px bg-[var(--border)] group-hover:w-[4px] group-hover:bg-[var(--primary)]/70'
              )}
            />
          </div>
          <section className="flex min-h-0 min-w-[220px] flex-1 flex-col overflow-hidden bg-[var(--panel-bg)]">
            <div className="flex h-9 shrink-0 items-center border-b border-[var(--border)] px-3 text-[12.5px] tracking-wide text-[var(--text-muted)]">
              Console
            </div>
            <div className="min-h-0 flex-1">
              <Console ref={consoleRef} />
            </div>
          </section>
        </main>
      </div>

      {/* 底部状态栏：左侧「目录 / 文件名」一段横排，目录和文件名同色（faint 淡灰），
          只靠顺序与省略号传达层级，不抢注意力；右侧从左到右依次是光标 Ln, Col、缩进
          （Spaces / Tab Size）、编码（本地文件按 BOM 推断）、换行符（LF / CRLF）和语言
          （跟随后缀自动判断），同 VS Code 右下角。 */}
      <footer className="flex shrink-0 items-baseline gap-3 border-t border-[var(--border)] bg-[var(--panel-bg)] px-4 py-1 text-[11px] text-[var(--text-faint)]">
        <span className="flex min-w-0 flex-1 items-baseline">
          {footerLoc ? (
            <>
              {footerLoc.dir ? (
                <span
                  className="min-w-0 truncate"
                  title={`${footerLoc.dir}/${footerLoc.file}`}
                >
                  {footerLoc.dir}/
                </span>
              ) : null}
              <span className="shrink-0">{footerLoc.file}</span>
            </>
          ) : (
            <span className="truncate">{t('statusbar.noFile')}</span>
          )}
        </span>
        {active && cursor?.position && (
          <span className="shrink-0">
            {t('statusbar.ln', {
              line: cursor.position.line,
              col: cursor.position.column,
            })}
          </span>
        )}
        {active && cursor && (
          <span className="shrink-0">
            {cursor.useTabs
              ? t('statusbar.tabSize', { size: cursor.indentSize })
              : t('statusbar.spaces', { size: cursor.indentSize })}
          </span>
        )}
        {active && (
          <>
            <span className="shrink-0" title={active.encoding}>
              {active.encoding}
            </span>
            <span aria-hidden className="h-3 w-px shrink-0 bg-[var(--border)]" />
            <span className="shrink-0">{cursor?.eol ?? 'LF'}</span>
            <span aria-hidden className="h-3 w-px shrink-0 bg-[var(--border)]" />
            <span
              className="shrink-0"
              title={
                language === 'typescript' ? t('statusbar.ts') : t('statusbar.js')
              }
            >
              {language === 'typescript' ? 'TypeScript' : 'JavaScript'}
            </span>
          </>
        )}
      </footer>

      {/* 隐藏的文件选择框，用于「导入」按钮读取本地代码文件（那个按钮只在不支持
          目录 API 的浏览器上出现）。
          不收 .jsx/.tsx：运行环境是没有 DOM 的 Web Worker，JSX 编译出来也没法渲染 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".js,.mjs,.cjs,.ts,.mts,.txt"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* 删除、目录改名的二次确认。自己不持有状态，内容由发起方拼好传进来 */}
      <ConfirmDialog confirm={confirm} />
    </div>
  )
}

export default App
