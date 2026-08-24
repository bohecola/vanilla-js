import { useRef, useEffect, useImperativeHandle, forwardRef, useMemo } from 'react'
import { monaco } from '@/monaco/setup'
import type { editor as MonacoEditorType } from 'monaco-editor'
import { debounce } from 'lodash-es'

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

  // 用 useMemo 保持同一个 debounce 实例，避免每次渲染新建导致 effect 重跑、
  // Monaco 实例被反复 dispose
  const handleResize = useMemo(() => debounce(() => editorRef.current?.layout(), 100), [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    editorRef.current = monaco.editor.create(container, {
      value: '',
      language,
      theme: 'vs-dark',
      automaticLayout: true,
    })

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      handleResize.cancel()
      editorRef.current?.dispose()
      editorRef.current = null
    }
  }, [language, handleResize])

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
