import { useRef, useEffect, useState, useCallback, type ChangeEvent } from 'react'
import { Select, Button, Space, Divider } from 'antd'
import { PlayCircleOutlined, FileAddOutlined, DownloadOutlined, UploadOutlined, GithubOutlined } from '@ant-design/icons'
import Editor, { EditorHandle } from './components/Editor'
import Console, { ConsoleHandle } from './components/Console'
import { listTemplates, loadTemplate } from './hooks'
import { buildRunnerDoc } from './lib/runner'

// 空白模板：下拉框中的特殊选项，选中后清空编辑器，供自由编写测试代码
const BLANK_TEMPLATE = '__blank__'
// 导入文件：选中本地文件后进入的临时状态，展示为「导入：文件名」
const IMPORTED_TEMPLATE = '__imported__'

function App() {
  const templates = listTemplates()
  const [currentPath, setCurrentPath] = useState<string>('../template/overrides/call.js')
  const [running, setRunning] = useState(false)
  const [runKey, setRunKey] = useState(0)
  const [importedName, setImportedName] = useState<string | null>(null)

  const editorRef = useRef<EditorHandle>(null)
  const consoleRef = useRef<ConsoleHandle>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const options = [
    { value: BLANK_TEMPLATE, label: '空白模板' },
    ...(importedName ? [{ value: IMPORTED_TEMPLATE, label: `导入：${importedName}` }] : []),
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

  // 当前选中变化时：空白/导入都不加载（由显式操作控制），否则加载对应模板
  useEffect(() => {
    if (currentPath === BLANK_TEMPLATE || currentPath === IMPORTED_TEMPLATE) {
      return
    }
    loadIntoEditor(currentPath)
  }, [currentPath, loadIntoEditor])

  // 切换选中项：清空 console；选「空白模板」时清空编辑器与导入名，选其他模板时清导入名
  function handleSelectChange(path: string) {
    setCurrentPath(path)
    consoleRef.current?.clear()
    if (path === BLANK_TEMPLATE) {
      setImportedName(null)
      editorRef.current?.setValue('')
    } else if (path !== IMPORTED_TEMPLATE) {
      setImportedName(null)
    }
  }

  // 新建：切到空白模板，清空编辑器与 console
  function handleNewFile() {
    handleSelectChange(BLANK_TEMPLATE)
  }

  // 导入：打开本地文件选择，读取 .js 内容到编辑器
  function handleImport() {
    fileInputRef.current?.click()
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    file
      .text()
      .then((text) => {
        editorRef.current?.setValue(text)
        setImportedName(file.name)
        setCurrentPath(IMPORTED_TEMPLATE)
        consoleRef.current?.clear()
      })
      .catch((err) => console.error('读取文件失败', err))
    // 重置 input，允许再次导入同一文件
    e.target.value = ''
  }

  // 下载：把编辑器当前代码导出为 .js 文件
  function handleDownload() {
    const code = editorRef.current?.getValue() ?? ''
    const filename =
      importedName ??
      (currentPath === BLANK_TEMPLATE
        ? 'code.js'
        : (currentPath.split('/').pop() ?? 'code.js'))

    const blob = new Blob([code], { type: 'text/javascript;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
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

  // 当前文件名（展示在编辑器标题栏）
  const currentLabel =
    importedName ??
    (currentPath === BLANK_TEMPLATE
      ? '空白模板'
      : currentPath === IMPORTED_TEMPLATE
        ? '导入文件'
        : currentPath.replace('../template/', ''))

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-950 text-slate-100">
      {/* 顶部工具栏 */}
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-slate-800 bg-slate-900 px-4 py-3">
        <div className="flex items-center gap-2 text-base font-semibold">
          <span className="inline-block h-3 w-3 rounded-full bg-sky-400" />
          JS Playground
        </div>
        <Divider orientation="vertical" className="border-slate-700" />
        <Space size={8}>
          <Button icon={<FileAddOutlined />} onClick={handleNewFile}>
            新建
          </Button>
          <Button icon={<UploadOutlined />} onClick={handleImport}>
            导入
          </Button>
          <div className="w-[200px] sm:w-[300px]">
            <Select
              value={currentPath}
              style={{ width: '100%' }}
              options={options}
              onChange={handleSelectChange}
              popupMatchSelectWidth={320}
              variant="filled"
            />
          </div>
        </Space>
        <div className="ml-auto">
          <a
            href="https://github.com/bohecola/vanilla-js"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-slate-400 transition-colors hover:text-sky-300"
            title="GitHub 仓库"
          >
            <GithubOutlined style={{ fontSize: 22 }} />
          </a>
        </div>
      </header>

      {/* 主区域：编辑器 + 输出 */}
      <main className="flex min-h-0 flex-1 flex-col gap-3 p-3 md:flex-row">
        {/* 左：编辑器 */}
        <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-800 bg-slate-900 md:flex-[1.2]">
          <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2">
            <span className="truncate text-sm text-slate-300">{currentLabel}</span>
            <Space size={8}>
              <Button size="small" icon={<DownloadOutlined />} onClick={handleDownload}>
                下载
              </Button>
              <Button
                size="small"
                type="primary"
                icon={<PlayCircleOutlined />}
                loading={running}
                onClick={runCode}
              >
                Run
              </Button>
            </Space>
          </div>
          <div className="min-h-0 flex-1">
            <Editor ref={editorRef} language="javascript" />
          </div>
        </section>

        {/* 右：输出 */}
        <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
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

      {/* 隐藏的文件选择框，用于「导入」按钮读取本地 .js 文件 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".js,.mjs,.ts,.jsx,.txt"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}

export default App
