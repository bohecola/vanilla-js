import { useRef, useEffect, useImperativeHandle, forwardRef, useMemo } from 'react'
import { monaco } from '@/monaco/setup'
import type { editor as MonacoEditorType } from 'monaco-editor'
import { debounce } from 'lodash-es'
import { useTheme } from '@/theme/index'

interface EditorProps {
  language: string
}

export interface EditorHandle {
  setValue: (value: string) => void
  getValue: () => string
}

const Editor = forwardRef<EditorHandle, EditorProps>(({ language }, ref) => {
  const editorRef = useRef<MonacoEditorType.IStandaloneCodeEditor | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { effective } = useTheme()

  // 用 useMemo 保持同一个 debounce 实例，避免每次渲染新建导致 effect 重跑、
  // Monaco 实例被反复 dispose
  const handleResize = useMemo(() => debounce(() => editorRef.current?.layout(), 100), [])

  // 首次挂载时的语言/主题：创建 effect 刻意不依赖它们（见下面两个 effect），
  // 用 ref 读当前值，避免闭包里拿到过期值
  const initialRef = useRef({ language, effective })
  initialRef.current = { language, effective }

  // 只在挂载时创建 Monaco 实例。语言与主题的变化都通过下面的 effect 增量更新，
  // 一旦把它们放进依赖数组，切换时编辑器会被重建，用户写的代码就丢了。
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const { language: initialLanguage, effective: initialTheme } = initialRef.current
    editorRef.current = monaco.editor.create(container, {
      value: '',
      language: initialLanguage,
      theme: initialTheme === 'dark' ? 'vs-dark' : 'playground-light',
      automaticLayout: true,
    })

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      handleResize.cancel()
      editorRef.current?.dispose()
      editorRef.current = null
    }
  }, [handleResize])

  // 语言切换（JS ⇄ TS）：只改 model 的语言，保留编辑器里已有的代码
  useEffect(() => {
    const model = editorRef.current?.getModel()
    if (model) monaco.editor.setModelLanguage(model, language)
  }, [language])

  // 主题切换时仅更新 Monaco 主题，避免重建编辑器丢失用户代码
  useEffect(() => {
    monaco.editor.setTheme(effective === 'dark' ? 'vs-dark' : 'playground-light')
  }, [effective])

  useImperativeHandle(ref, () => ({
    setValue: (value: string) => {
      if (editorRef.current) {
        editorRef.current.setValue(value)
      }
    },
    getValue: () => editorRef.current?.getValue() ?? '',
  }))

  return <div ref={containerRef} className="h-full min-h-0" />
})

export default Editor
