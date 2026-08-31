import { useRef, useEffect, useState, useCallback, type ChangeEvent } from 'react'
import { uniq } from 'lodash-es'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/ui/icon'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { GithubMark } from './components/GithubMark'
import { JotterMark } from './components/JotterMark'
import Editor, { EditorHandle } from './components/Editor'
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
  readTextFile,
  writeTextFile,
  type Entry,
  type FileEntry,
} from './lib/fs-access'
import { codeRunner } from './lib/runner'
import { warmupCompiler } from './lib/compile'
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
  handle?: FileSystemFileHandle
}

/** 读盘时记下的 mtime，用来判断磁盘上的文件是否被外部程序改过。 */
interface LocalMeta {
  handle: FileSystemFileHandle
  lastModified: number
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

  const [active, setActive] = useState<ActiveFile | null>(null)
  const [dirtyKeys, setDirtyKeys] = useState<Set<string>>(new Set())
  const [running, setRunning] = useState(false)
  const [notice, setNotice] = useState<Notice | null>(null)

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
        setActive({ key, kind: 'builtin', name, language })
        consoleRef.current?.clear()
      } catch (err) {
        setNotice({
          tone: 'error',
          text: t('notice.demoLoadFailed', { message: messageOf(err, t) }),
        })
      }
    },
    [t]
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
          const { text, lastModified } = await readTextFile(entry.handle)
          editorRef.current?.open({ key, value: text, language })
          localMetaRef.current.set(key, { handle: entry.handle, lastModified })
        }
        setActive({ key, kind: 'local', name: entry.name, language, handle: entry.handle })
        consoleRef.current?.clear()
        editorRef.current?.focus()
      } catch (err) {
        setNotice({ tone: 'error', text: messageOf(err, t) })
      }
    },
    [t]
  )

  const openScratch = useCallback(() => {
    const key = 'scratch'
    editorRef.current?.open({ key, value: '', language: 'javascript' })
    // model 可能早就存在（上次的草稿），open 不会动它的内容，这里显式清空
    editorRef.current?.replace(key, '')
    setActive({ key, kind: 'scratch', name: t('file.scratch'), language: 'javascript' })
    consoleRef.current?.clear()
    editorRef.current?.focus()
  }, [t])

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
      ...(active ? [active.key] : []),
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
    // 删掉的正是当前这个：退回空白草稿。不引入「一个都没打开」这种没验证过的状态
    if (active && keys.includes(active.key)) openScratch()
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
    // 当前打开的就是这棵树里的：退回空白草稿，和删除时一样
    if (active && keys.includes(active.key)) openScratch()
    setNotice({ tone: 'info', text: t('notice.rootRemoved', { name: root.name }) })
  }

  /**
   * 新 handle 只能重新从磁盘取：目录改名实际是「整棵复制一份 + 删掉原来的」，
   * 缓存里那些 handle 指向的都是已经被删掉的旧目录。
   * lastModified 基线保留 —— 内容没变，没必要让 focus 时的对比误报一次外部改动。
   */
  async function handleRenamed(from: Entry, to: Entry) {
    const activeKey = active?.key
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
        localMetaRef.current.set(newKey, { handle, lastModified: meta.lastModified })
      }
      if (oldKey === activeKey) {
        setActive((prev) =>
          prev
            ? {
                ...prev,
                key: newKey,
                name,
                language: language ?? prev.language,
                handle: handle ?? undefined,
              }
            : prev
        )
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
    const saved = await workspace.saveBundle(DEMOS_DIR, files)
    // null 有两种：用户在选择器里取消（不该有任何动静），或者出错
    // （原因已经在侧边栏那条 workspace.error 提示条上了）
    if (!saved) return
    setNotice({
      tone: 'info',
      text: t('notice.demosSaved', { count: saved.count, label: saved.label }),
    })
  }

  function handleImport() {
    fileInputRef.current?.click()
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
        setActive({ key, kind: 'imported', name: file.name, language })
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
    try {
      const lastModified = await writeTextFile(file.handle, code)
      localMetaRef.current.set(file.key, { handle: file.handle, lastModified })
      editorRef.current?.markSaved(file.key)
      setNotice({ tone: 'info', text: t('notice.saved', { name: file.name }) })
    } catch (err) {
      setNotice({ tone: 'error', text: t('notice.saveFailed', { message: messageOf(err, t) }) })
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
        const { text, lastModified } = await readTextFile(file.handle)
        editorRef.current?.replace(file.key, text)
        localMetaRef.current.set(file.key, { handle: file.handle, lastModified })
        setNotice({ tone: 'info', text: t('notice.reloaded', { name: file.name }) })
      } catch {
        // 文件被删/被移走，等用户自己刷新目录，不用弹提示打扰
      }
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
    // 切语言时重新挂一次监听 —— 只是换个闭包，没有别的副作用
  }, [t])

  function handleLanguageChange(value: string) {
    // 空值兜底：ToggleGroup 单选模式下再点当前项会传 ''
    if (!value || !active) return
    editorRef.current?.setLanguage(active.key, value)
    setActive({ ...active, language: value })
  }

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

  const dirty = active ? dirtyKeys.has(active.key) : false

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
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            value={runnable ? language : ''}
            disabled={!runnable}
            onValueChange={handleLanguageChange}
          >
            <ToggleGroupItem value="javascript" aria-label="JavaScript" className="px-2.5">
              JS
            </ToggleGroupItem>
            <ToggleGroupItem value="typescript" aria-label="TypeScript" className="px-2.5">
              TS
            </ToggleGroupItem>
          </ToggleGroup>

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
          onRenameEntry={fileDraft.startRename}
          onDeleteEntry={(entry) => void handleDelete(entry)}
          onCloseRoot={(root) => void handleCloseRoot(root)}
        />

        {/* 主区域：编辑器 + 输出 */}
        <main className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 p-3 md:flex-row">
          {/* 左：编辑器 */}
          <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel-bg)] md:flex-[1.2]">
            <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] px-3 py-2">
              <div className="flex min-w-0 items-center gap-2">
                {/* 文件名用等宽字体：它是路径而不是散文，等宽下更好对齐扫读 */}
                <Badge variant="outline" className="max-w-[260px] truncate font-mono font-normal">
                  {/* 草稿的名字在这里现算，不用 active.name：那是 openScratch 时按当时的
                      语言存下来的快照，切语言后会留着一个旧语言的标题 */}
                  {active ? (active.kind === 'scratch' ? t('file.scratch') : active.name) : t('editor.noFile')}
                </Badge>
                {dirty && (
                  <span
                    className="text-[12px] text-[var(--accent-symbol)]"
                    title={t('editor.dirty')}
                  >
                    ●
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {/* 草稿在开着本地目录时也能「保存」——存到侧边栏选中的那个目录里 */}
                {active?.kind === 'local' || (active?.kind === 'scratch' && workspace.hasRoot) ? (
                  <Button variant="ghost" size="sm" onClick={() => void handleSave()}>
                    <Icon className="icon-[lucide--save]" />
                    {t('editor.save')}
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" onClick={handleDownload} disabled={!active}>
                    <Icon className="icon-[lucide--download]" />
                    {t('editor.download')}
                  </Button>
                )}
                {/* 停止绝大多数时间是禁用态，用实心 destructive 会在工具栏里凭空压出一块
                    红色；改成 ghost + 红字，只在真的能点时才抢注意力 */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[var(--accent-error)] hover:bg-[var(--accent-error)]/10 hover:text-[var(--accent-error)]"
                  onClick={stopCode}
                  disabled={!running}
                >
                  <Icon className="icon-[lucide--square]" />
                  {t('editor.stop')}
                </Button>
                <Button
                  size="sm"
                  onClick={runCode}
                  disabled={!runnable}
                  title={runnable ? undefined : t('editor.runDisabled')}
                >
                  <Icon className="icon-[lucide--play]" />
                  Run
                </Button>
              </div>
            </div>
            <div className="min-h-0 flex-1">
              <Editor ref={editorRef} onDirtyChange={handleDirtyChange} onSave={handleSave} />
            </div>
          </section>

          {/* 右：输出 */}
          <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel-bg)]">
            <div className="border-b border-[var(--border)] px-3 py-2 text-sm text-[var(--text-muted)]">
              Console
            </div>
            <div className="min-h-0 flex-1">
              <Console ref={consoleRef} />
            </div>
          </section>
        </main>
      </div>

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
