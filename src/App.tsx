import { useRef, useEffect, useState, useCallback, type ChangeEvent } from 'react'
import { Select, Button, Space, Divider, Tag, Dropdown, Segmented } from 'antd'
import { PlayCircleOutlined, StopOutlined, FileAddOutlined, DownloadOutlined, UploadOutlined, GithubOutlined, SunOutlined, MoonOutlined, DesktopOutlined } from '@ant-design/icons'
import Editor, { EditorHandle } from './components/Editor'
import Console, { ConsoleHandle } from './components/Console'
import { listTemplates, loadTemplate } from './hooks'
import { codeRunner } from './lib/runner'
import { warmupCompiler } from './lib/compile'
import { useTheme, type ThemeMode } from './theme/index.tsx'

// 空白模板：下拉框中的特殊选项，选中后清空编辑器，供自由编写测试代码
const BLANK_TEMPLATE = '__blank__'
// 导入文件：选中本地文件后进入的临时状态，展示为「导入：文件名」
const IMPORTED_TEMPLATE = '__imported__'

type Language = 'javascript' | 'typescript'

// 按文件后缀猜语言（导入 .ts 文件时自动切到 TS，否则代码不会经过 TS 编译）
function languageFromFilename(name: string): Language {
  return /\.(ts|tsx|mts|cts)$/i.test(name) ? 'typescript' : 'javascript'
}

// 让下载的文件后缀与当前语言一致：TS 代码存成 .js 打开就是坏的
function withLanguageExt(filename: string, language: Language): string {
  const ext = language === 'typescript' ? 'ts' : 'js'
  return filename.replace(/\.(js|mjs|cjs|jsx|ts|tsx|mts|cts)$/i, `.${ext}`)
}

function App() {
  const templates = listTemplates()
  const [currentPath, setCurrentPath] = useState<string>('../template/overrides/call.js')
  const [running, setRunning] = useState(false)
  const [importedName, setImportedName] = useState<string | null>(null)
  // 语言选择：影响编辑器补全/高亮，以及运行时是否先做 TS→JS 编译
  const [language, setLanguage] = useState<Language>('javascript')
  const { mode, setMode } = useTheme()

  // 切到 TS 时提前初始化 esbuild wasm（~10MB），别等到点「运行」才干等
  useEffect(() => {
    if (language === 'typescript') warmupCompiler()
  }, [language])

  // 组件卸载时释放 worker 资源
  useEffect(() => {
    return () => codeRunner.destroy()
  }, [])

  const editorRef = useRef<EditorHandle>(null)
  const consoleRef = useRef<ConsoleHandle>(null)
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
        setLanguage(languageFromFilename(file.name))
        setCurrentPath(IMPORTED_TEMPLATE)
        consoleRef.current?.clear()
      })
      .catch((err) => console.error('读取文件失败', err))
    // 重置 input，允许再次导入同一文件
    e.target.value = ''
  }

  // 下载：把编辑器当前代码导出为对应语言后缀的文件
  function handleDownload() {
    const code = editorRef.current?.getValue() ?? ''
    const ext = language === 'typescript' ? 'ts' : 'js'
    const filename = withLanguageExt(
      importedName ??
        (currentPath === BLANK_TEMPLATE
          ? `code.${ext}`
          : (currentPath.split('/').pop() ?? `code.${ext}`)),
      language
    )

    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  // 运行：在 Web Worker 里执行用户代码，主线程不卡，死循环也能用「停止」强制终止。
  // TS 代码会先在主线程用 esbuild 转成 JS（首次需要等 wasm 就绪）。
  function runCode() {
    const code = editorRef.current?.getValue() ?? ''
    consoleRef.current?.clear()
    void codeRunner.run(code, language)
    setRunning(true)
  }

  // 停止：terminate worker，立即终止运行（包括 while(true) 死循环）
  function stopCode() {
    codeRunner.stop()
    setRunning(false)
  }

  // 监听 worker 的「完成」信号：同步代码 eval 返回后自动复位运行状态。
  // 有定时器/死循环的代码不会走到 done（死循环永不返回），因此停止按钮会保持可用。
  useEffect(() => {
    codeRunner.setOnDone(() => setRunning(false))
    return () => codeRunner.setOnDone(null)
  }, [])

  // 当前文件名（展示在编辑器标题栏）
  const currentLabel =
    importedName ??
    (currentPath === BLANK_TEMPLATE
      ? '空白模板'
      : currentPath === IMPORTED_TEMPLATE
        ? '导入文件'
        : currentPath.replace('../template/', ''))

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[var(--app-bg)] text-[var(--text-primary)]">
      {/* 顶部工具栏 */}
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-[var(--border)] bg-[var(--panel-bg)] px-4 py-3">
        <div className="flex items-center gap-2 text-base font-semibold">
          <span className="inline-block h-3 w-3 rounded-full bg-[var(--accent-logo)]" />
          Jotter
        </div>
        <Divider orientation="vertical" className="border-[var(--border-strong)]" />
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
        <div className="ml-auto flex items-center gap-2">
          <Segmented
            value={language}
            onChange={(value) => setLanguage(value as Language)}
            options={[
              { value: 'javascript', label: 'JS' },
              { value: 'typescript', label: 'TS' },
            ]}
            size="small"
          />
          <Dropdown
            menu={{
              items: [
                { key: 'dark', icon: <MoonOutlined />, label: '深色' },
                { key: 'light', icon: <SunOutlined />, label: '浅色' },
                { key: 'system', icon: <DesktopOutlined />, label: '跟随系统' },
              ],
              selectable: true,
              selectedKeys: [mode],
              onClick: ({ key }) => setMode(key as ThemeMode),
            }}
            trigger={['click']}
          >
            <Button type="text" size="middle" title="切换主题">
              {/* 用固定尺寸的 span 作为稳定容器，只替换内部图标，避免图标闪没；
                  图标颜色用 CSS 变量而非 antd token，切换主题时颜色稳定不闪变 */}
              <span
                className="flex h-[18px] w-[18px] items-center justify-center text-[var(--text-muted)] transition-colors duration-200"
                style={{ fontSize: 18 }}
              >
                {mode === 'light' ? (
                  <SunOutlined />
                ) : mode === 'dark' ? (
                  <MoonOutlined />
                ) : (
                  <DesktopOutlined />
                )}
              </span>
            </Button>
          </Dropdown>
          <a
            href="https://github.com/bohecola/jotter"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-[var(--text-muted)] transition-colors hover:text-[var(--accent-number)]"
            title="GitHub 仓库"
          >
            <GithubOutlined style={{ fontSize: 22 }} />
          </a>
        </div>
      </header>

      {/* 主区域：编辑器 + 输出 */}
      <main className="flex min-h-0 flex-1 flex-col gap-3 p-3 md:flex-row">
        {/* 左：编辑器 */}
        <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel-bg)] md:flex-[1.2]">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="text-sm text-[var(--text-muted)]">Editor</span>
              <Tag color="blue" style={{ marginInlineEnd: 0 }}>
                {currentLabel}
              </Tag>
            </div>
            <Space size={8}>
              <Button size="small" icon={<DownloadOutlined />} onClick={handleDownload}>
                下载
              </Button>
              <Button
                size="small"
                danger
                icon={<StopOutlined />}
                onClick={stopCode}
                disabled={!running}
              >
                停止
              </Button>
              <Button
                size="small"
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={runCode}
              >
                Run
              </Button>
            </Space>
          </div>
          <div className="min-h-0 flex-1">
            <Editor ref={editorRef} language={language} />
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

      {/* 隐藏的文件选择框，用于「导入」按钮读取本地代码文件。
          不收 .jsx/.tsx：运行环境是没有 DOM 的 Web Worker，JSX 编译出来也没法渲染 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".js,.mjs,.cjs,.ts,.mts,.txt"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}

export default App
