import { useRef, useEffect, useState, useCallback } from 'react'
import { Select, Button, Space, Tag, Divider } from 'antd'
import { PlayCircleOutlined, FileAddOutlined } from '@ant-design/icons'
import Editor, { EditorHandle } from './components/Editor'
import Console, { ConsoleHandle } from './components/Console'
import { listTemplates, loadTemplate } from './hooks'
import { buildRunnerDoc } from './lib/runner'

// 空白模板：下拉框中的特殊选项，选中后清空编辑器，供自由编写测试代码
const BLANK_TEMPLATE = '__blank__'

function App() {
  const templates = listTemplates()
  const [currentPath, setCurrentPath] = useState<string>('../template/overrides/call.js')
  const [running, setRunning] = useState(false)
  const [runKey, setRunKey] = useState(0)

  const editorRef = useRef<EditorHandle>(null)
  const consoleRef = useRef<ConsoleHandle>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const options = [
    { value: BLANK_TEMPLATE, label: '空白模板' },
    ...templates.map((value) => ({
      value,
      label: value.replace('../template/', ''),
    })),
  ]

  // 加载某个模板到编辑器
  const loadIntoEditor = useCallback(
    async (path: string) => {
      try {
        const code = await loadTemplate(path)
        editorRef.current?.setValue(code)
      } catch (e) {
        console.error('加载模板失败', e)
      }
    },
    []
  )

  // 当前模板变化时：空白模板清空编辑器，否则加载对应模板
  useEffect(() => {
    if (currentPath === BLANK_TEMPLATE) {
      editorRef.current?.setValue('')
    } else {
      loadIntoEditor(currentPath)
    }
  }, [currentPath, loadIntoEditor])

  // 切换模板：更新选中项并清空 console（加载逻辑交给上面的 effect）
  function handleSelectChange(path: string) {
    setCurrentPath(path)
    consoleRef.current?.clear()
  }

  // 新建：切到空白模板，清空编辑器与 console
  function handleNewFile() {
    handleSelectChange(BLANK_TEMPLATE)
  }

  // 运行：重建 iframe（srcdoc 全新文档）清空上次的全局状态与定时器
  function runCode() {
    const code = editorRef.current?.getValue() ?? ''
    consoleRef.current?.clear()
    setRunning(true)
    // 递增 key 强制 React 重建 iframe
    setRunKey((k) => k + 1)
    // 等 iframe 重建后更新 srcdoc
    requestAnimationFrame(() => {
      if (iframeRef.current) {
        iframeRef.current.srcdoc = buildRunnerDoc(code)
      }
      // 给个短暂延迟让运行状态看起来更自然
      setTimeout(() => setRunning(false), 400)
    })
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-950 text-slate-100">
      {/* 顶部工具栏 */}
      <header className="flex items-center gap-3 border-b border-slate-800 bg-slate-900 px-4 py-3">
        <div className="flex items-center gap-2 text-base font-semibold">
          <span className="inline-block h-3 w-3 rounded-full bg-sky-400" />
          JS Playground
        </div>
        <Divider orientation="vertical" className="border-slate-700" />
        <Space size={8}>
          <Button icon={<FileAddOutlined />} onClick={handleNewFile}>
            新建
          </Button>
          <Select
            value={currentPath}
            style={{ width: 300 }}
            options={options}
            onChange={handleSelectChange}
            popupMatchSelectWidth={320}
            variant="filled"
          />
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            loading={running}
            onClick={runCode}
          >
            Run
          </Button>
        </Space>
        <div className="ml-auto">
          <Tag color="blue" style={{ marginInlineEnd: 0 }}>
            {currentPath === BLANK_TEMPLATE ? '空白模板' : currentPath.replace('../template/', '')}
          </Tag>
        </div>
      </header>

      {/* 主区域：编辑器 + 输出 */}
      <main className="flex min-h-0 flex-1 gap-3 p-3">
        {/* 左：编辑器 */}
        <section className="flex min-w-0 flex-[1.2] flex-col overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 px-3 py-2 text-sm text-slate-400">
            Editor
          </div>
          <div className="min-h-0 flex-1">
            <Editor ref={editorRef} language="javascript" />
          </div>
        </section>

        {/* 右：输出 */}
        <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 px-3 py-2 text-sm text-slate-400">
            Console
          </div>
          <div className="min-h-0 flex-1">
            <Console ref={consoleRef} />
          </div>
        </section>
      </main>

      {/* 隐藏的 iframe 用于运行用户代码（sandbox 严格隔离） */}
      <iframe
        key={runKey}
        ref={iframeRef}
        title="runner"
        className="hidden"
        sandbox="allow-scripts"
      />
    </div>
  )
}

export default App
