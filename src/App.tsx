import { useRef, useEffect } from "react"
import { Select, Button } from "antd"
import { useTemplate } from "@/hooks"
import Editor, { EditorHandle } from './components/Editor';
import Console, { ConsoleHandle } from "./components/Console";

function App() {
  // 代码模块
  const modules = useTemplate()
  // 选项
  const options = Object.keys(modules).map(key => ({ value: key, label: key.replace("../", "") }))
  // 默认选择
  const utilsPath = '../template/overrides/call.js'

  // 选择器 change
  function handleChange(val: string) {    
    modules[val]().then((res) => {
      editorRef.current?.setValue(res)
    })
  }

  // 编辑器 ref
  const editorRef = useRef<EditorHandle>(null)
  // console ref
  const consoleRef = useRef<ConsoleHandle>(null)
  // 编辑器设置初始值
  useEffect(() => {
    modules[utilsPath]().then((res) => {
      editorRef.current?.setValue(res);
    })
  }, [])

  const iframeRef = useRef<HTMLIFrameElement>(null)
  // 运行
  function runCode() {
    // 清空控制台
    consoleRef.current?.clear()
    // 当前代码
    const code = editorRef.current?.getValue()

    const iframe = iframeRef.current;
    if (!iframe) return;

    iframe.contentWindow?.document.open();
    iframe.contentWindow?.document.write(`
    <body>
      <script>
        try {
          ${code}
        } catch(e) {
          console.error(e.name, e.message)
        }
      </script>
    </body>
    `);
    iframe.contentWindow?.document.close();
  }

  return (
    <div>
      <main className="p-5 flex gap-5">
        <div className="p-2 border-4 rounded-lg w-[45vw]">
          <div className="">
            <Select
              className="mb-2"
              defaultValue={utilsPath}
              style={{ width: 290 }}
              onChange={handleChange}
              options={options}
            />

            <Button
              type="primary"
              className="ml-2"
              onClick={runCode}>
              Run
            </Button>
          </div>
          <Editor
            ref={editorRef}
            language="javascript"
          />
        </div>

        <div className="p-2 border-4 rounded-lg w-[45vw]">
          <iframe 
            ref={iframeRef}
            src="/preview.html"
            className="hidden"
            sandbox="allow-same-origin allow-scripts">
          </iframe>
          
          <div className="p-2 border-b">Console（注：对象输出请在控制台查看）</div>
          <Console ref={consoleRef} />
        </div>
      </main>
    </div>
  )
}

export default App
