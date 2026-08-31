import { useRef, useEffect, useImperativeHandle, forwardRef, useMemo } from 'react'
import { monaco } from '@/monaco/setup'
import type { editor as MonacoEditorType, IDisposable } from 'monaco-editor'
import { debounce, sortBy } from 'lodash-es'
import { useTheme } from '@/theme/index'

/*
  一个编辑器实例 + 每个文件一个 model。

  为什么不是「切文件就 setValue」：那样撤销历史、光标、折叠、滚动位置全都跟着串台 ——
  在 A 文件里按 Ctrl+Z 会撤销到 B 文件的内容。Monaco 的设计本来就是一个 model 一个文件，
  切换靠 setModel + restoreViewState，撤销栈天然挂在 model 上。
*/

/** 一次「打开文件」需要的信息。value 只在第一次为这个 key 建 model 时用得上。 */
export interface OpenFileSpec {
  key: string
  value: string
  language: string
}

export interface EditorHandle {
  /** 打开（必要时新建）某个 key 对应的 model 并切过去 */
  open: (file: OpenFileSpec) => void
  /** 这个 key 的 model 还在不在（可能已被 LRU 淘汰）。在的话内容不必重新读一遍。 */
  has: (key: string) => boolean
  /** 整体替换内容并把「已保存」基线重置到此刻（用于新建清空、从磁盘重载） */
  replace: (key: string, value: string) => void
  getValue: (key?: string) => string
  setLanguage: (key: string, language: string) => void
  /** 保存成功后调用：把当前版本记为基线，脏标记归零 */
  markSaved: (key: string) => void
  close: (key: string) => void
  /**
   * 改名：把内容、脏状态、光标 / 滚动搬到新 key 上，旧 model 丢掉。
   * 撤销历史留不住 —— model 的 URI 改不了，只能新建一个（和「草稿转正」一样的取舍）。
   * 和 close 一样不为旧 key 发 onDirtyChange，由调用方自己清。
   */
  rekey: (oldKey: string, newKey: string, language?: string) => void
  focus: () => void
}

interface EditorProps {
  onDirtyChange?: (key: string, dirty: boolean) => void
  onSave?: () => void
}

/**
 * 同时保留多少个 model。切文件要保住撤销历史和光标位置，所以 model 不能随手 dispose；
 * 但每个 model 都占着内存、还在 TS 语言服务里算一份文件，也不能无限攒。
 * 12 个足够覆盖「在几个文件间来回切」的实际用法。
 */
const MAX_MODELS = 12

const modelUri = (key: string) => monaco.Uri.parse(`inmemory://jotter/${encodeURIComponent(key)}`)

interface ModelRecord {
  model: MonacoEditorType.ITextModel
  viewState: MonacoEditorType.ICodeEditorViewState | null
  /** 「已保存」那一刻的 alternativeVersionId；脏标记就是拿它和当前值比 */
  savedVersionId: number
  dirty: boolean
  listener: IDisposable
  /** 单调递增的访问序号，用于 LRU 淘汰 */
  lastUsed: number
}

const Editor = forwardRef<EditorHandle, EditorProps>(({ onDirtyChange, onSave }, ref) => {
  const editorRef = useRef<MonacoEditorType.IStandaloneCodeEditor | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const modelsRef = useRef(new Map<string, ModelRecord>())
  const activeKeyRef = useRef<string | null>(null)
  // 挂载 effect 跑之前 App 就可能调 open（父组件的 effect 后于子组件），先记下来
  const pendingOpenRef = useRef<OpenFileSpec | null>(null)
  const { effective } = useTheme()

  // 回调走 ref：Monaco 命令和 window 监听都只注册一次，
  // 直接闭包捕获 prop 会永远调用首次渲染那一版
  const callbacksRef = useRef({ onDirtyChange, onSave })
  callbacksRef.current = { onDirtyChange, onSave }

  // 创建 effect 刻意不依赖主题，用 ref 读当前值 —— 主题变化由下面的 effect 增量应用，
  // 放进依赖数组会让编辑器被重建
  const themeRef = useRef(effective)
  themeRef.current = effective

  // 保持同一个 debounce 实例，避免每次渲染新建导致 effect 重跑、Monaco 被反复 dispose
  const handleResize = useMemo(() => debounce(() => editorRef.current?.layout(), 100), [])

  const api = useMemo<EditorHandle>(() => {
    let clock = 0
    // setValue 会同步触发 onDidChangeContent，而此刻基线还没更新，
    // 会先报一次「脏」再报「干净」。用它把那次通知吃掉。
    let applying = false

    const notifyDirty = (key: string, dirty: boolean) => {
      const rec = modelsRef.current.get(key)
      if (!rec || rec.dirty === dirty) return
      rec.dirty = dirty
      callbacksRef.current.onDirtyChange?.(key, dirty)
    }

    const drop = (key: string, rec: ModelRecord) => {
      rec.listener.dispose()
      rec.model.dispose()
      modelsRef.current.delete(key)
    }

    // 只淘汰到刚好不超上限，且只挑「干净 + 非当前」的：
    // 脏 model 一旦 dispose，用户没保存的内容就没了，宁可暂时超出上限
    const evict = () => {
      const models = modelsRef.current
      const victims = sortBy(
        [...models.entries()].filter(([key, rec]) => key !== activeKeyRef.current && !rec.dirty),
        ([, rec]) => rec.lastUsed
      )
      for (const [key, rec] of victims) {
        if (models.size <= MAX_MODELS) break
        drop(key, rec)
      }
    }

    const ensure = (file: OpenFileSpec): ModelRecord => {
      const existing = modelsRef.current.get(file.key)
      if (existing) return existing

      const model = monaco.editor.createModel(file.value, file.language, modelUri(file.key))
      const rec: ModelRecord = {
        model,
        viewState: null,
        savedVersionId: model.getAlternativeVersionId(),
        dirty: false,
        listener: model.onDidChangeContent(() => {
          if (applying) return
          notifyDirty(file.key, model.getAlternativeVersionId() !== rec.savedVersionId)
        }),
        lastUsed: 0,
      }
      modelsRef.current.set(file.key, rec)
      return rec
    }

    const resolve = (key?: string) => {
      const k = key ?? activeKeyRef.current
      return k === null ? undefined : modelsRef.current.get(k)
    }

    return {
      open: (file) => {
        const editor = editorRef.current
        if (!editor) {
          pendingOpenRef.current = file
          return
        }
        // 先把离开的那个文件的视图状态收好（光标、滚动、折叠）
        const leaving = resolve()
        if (leaving) leaving.viewState = editor.saveViewState()

        const rec = ensure(file)
        rec.lastUsed = ++clock
        activeKeyRef.current = file.key
        if (editor.getModel() !== rec.model) editor.setModel(rec.model)
        if (rec.viewState) editor.restoreViewState(rec.viewState)
        evict()
      },

      has: (key) => modelsRef.current.has(key),

      replace: (key, value) => {
        const rec = modelsRef.current.get(key)
        if (!rec) return
        applying = true
        // setValue 会清空撤销栈，这正是「内容来自外部」想要的：
        // 留着旧的撤销历史，用户一按 Ctrl+Z 就回到和磁盘不一致的状态
        rec.model.setValue(value)
        applying = false
        rec.savedVersionId = rec.model.getAlternativeVersionId()
        notifyDirty(key, false)
      },

      getValue: (key) => resolve(key)?.model.getValue() ?? '',

      setLanguage: (key, language) => {
        const rec = modelsRef.current.get(key)
        if (rec) monaco.editor.setModelLanguage(rec.model, language)
      },

      markSaved: (key) => {
        const rec = modelsRef.current.get(key)
        if (!rec) return
        rec.savedVersionId = rec.model.getAlternativeVersionId()
        notifyDirty(key, false)
      },

      close: (key) => {
        const rec = modelsRef.current.get(key)
        if (!rec) return
        if (activeKeyRef.current === key) {
          editorRef.current?.setModel(null)
          activeKeyRef.current = null
        }
        drop(key, rec)
      },

      rekey: (oldKey, newKey, language) => {
        const rec = modelsRef.current.get(oldKey)
        if (!rec || oldKey === newKey) return
        const editor = editorRef.current
        const wasActive = activeKeyRef.current === oldKey
        // 当前文件的光标 / 滚动要从编辑器上现取：rec.viewState 是上次切走时存的
        const viewState = wasActive ? (editor?.saveViewState() ?? rec.viewState) : rec.viewState

        const next = ensure({
          key: newKey,
          value: rec.model.getValue(),
          language: language ?? rec.model.getLanguageId(),
        })
        next.viewState = viewState
        next.lastUsed = ++clock
        // 脏状态要原样带过去：磁盘上那份是改名前保存的内容，未保存的改动确实还没落盘，
        // 侧边栏那个点不能掉。-1 和任何真实的 alternativeVersionId（从 1 起）都不相等。
        if (rec.dirty) {
          next.savedVersionId = -1
          notifyDirty(newKey, true)
        }

        // 先把编辑器挂到新 model 上再 dispose 旧的：反过来会让编辑器短暂持有一个已销毁的 model。
        // 也因此不能走 close()，它在 active 时会先把 model 置空，屏幕会闪一下
        if (wasActive) {
          activeKeyRef.current = newKey
          editor?.setModel(next.model)
          if (viewState) editor?.restoreViewState(viewState)
        }
        drop(oldKey, rec)
        evict()
      },

      focus: () => editorRef.current?.focus(),
    }
  }, [])

  // 只在挂载时创建 Monaco 实例。model: null —— 内容一律由 open() 提供，
  // 让 create 自己造一个匿名 model 只会多出一个没人管的 model。
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    // 拿到本次挂载用的那张表，供 cleanup 使用（清理时不能再去读 ref）
    const models = modelsRef.current

    const editor = monaco.editor.create(container, {
      model: null,
      theme: themeRef.current === 'dark' ? 'vs-dark' : 'playground-light',
      automaticLayout: true,
    })
    editorRef.current = editor

    // 编辑器有焦点时的 Ctrl/Cmd+S 由 Monaco 的 keybinding 接住，
    // 它会 preventDefault，浏览器的「保存网页」不会弹出来
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      callbacksRef.current.onSave?.()
    })

    const pending = pendingOpenRef.current
    if (pending) {
      pendingOpenRef.current = null
      api.open(pending)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      handleResize.cancel()
      editor.dispose()
      editorRef.current = null
      for (const [key, rec] of models) {
        rec.listener.dispose()
        rec.model.dispose()
        models.delete(key)
      }
      activeKeyRef.current = null
    }
  }, [api, handleResize])

  // 焦点不在编辑器里时（比如刚在侧边栏点了文件）也要能 Ctrl+S。
  // hasTextFocus 的判断是为了不和上面 Monaco 的命令重复触发。
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey || e.key.toLowerCase() !== 's') return
      if (editorRef.current?.hasTextFocus()) return
      e.preventDefault()
      callbacksRef.current.onSave?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // 主题切换只改 Monaco 主题，不重建编辑器
  useEffect(() => {
    monaco.editor.setTheme(effective === 'dark' ? 'vs-dark' : 'playground-light')
  }, [effective])

  useImperativeHandle(ref, () => api, [api])

  return <div ref={containerRef} className="h-full min-h-0" />
})

export default Editor
