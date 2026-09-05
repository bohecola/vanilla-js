// 用户代码运行管理器：基于 Web Worker。
// - run(code, language)：先把 TS 编译成 JS（主线程），再创建 worker 执行
// - stop()：terminate 掉 worker，立即停止（含死循环）
// - destroy()：完全销毁，释放资源
//
// Worker 在独立线程运行，主线程永不卡顿；
// console 输出由 worker 内劫持后攒成一批 postMessage 出来，这里再分发给订阅者（Console 面板）。
// worker 的 eval 返回后会发送 {type:'done'}，通知父页面「同步部分执行完毕」。

import RunnerWorker from './runner.worker?worker'
import { compileToJs } from './compile'
import { findStaticImports, unresolvedImportProblem } from './imports'
import { messageOf, translate, type T } from '@/i18n/context'
import type { LogLevel } from '@/types'

/** worker 发出的一条 console 输出（还没分配 id，id 由 Console 面板在入列时给） */
export interface RawConsoleMessage {
  type: LogLevel
  args: unknown[]
  indent: number
  timestamp: number
}

/** batch：这一批消息；dropped：worker 在发出前因为攒得太多而丢掉的条数 */
type Listener = (batch: RawConsoleMessage[], dropped: number) => void

export class CodeRunner {
  private worker: Worker | null = null
  private onDone: (() => void) | null = null
  private listeners = new Set<Listener>()
  // 运行序号：编译是异步的，期间用户可能又点了运行或停止，
  // 靠它判断 await 回来的这次编译结果是否还有效
  private runId = 0

  /*
    「取当前 t」的 getter。runner 是模块级单例（codeRunner），而 t 是 React 的东西，
    这里只能被注入。

    注入 getter 而不是 t 本身：切了语言之后 runner 手里不能还攥着旧字典。
    App 那边传进来的是一个读 ref 的函数，每次报错都现取一次。
    已经打印在 Console 里的旧行不会跟着变 —— 那是历史记录，按当时的语言留着。
  */
  private translator: (() => T) | null = null

  /** 注入 t 的 getter。App 挂载时设一次即可。 */
  setTranslator(get: (() => T) | null): void {
    this.translator = get
  }

  /** 设置「运行完成」回调（同步代码 eval 返回时触发）。 */
  setOnDone(fn: (() => void) | null): void {
    this.onDone = fn
  }

  /**
   * 订阅 console 输出。一次回调收到一批消息（worker 把同一轮任务里的输出攒在一起发），
   * 返回取消订阅的函数。
   */
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private emit(batch: RawConsoleMessage[], dropped = 0): void {
    if (batch.length === 0 && dropped === 0) return
    for (const listener of this.listeners) listener(batch, dropped)
  }

  /** 创建并启动一次运行。重复调用会先终止上一次。key 是编辑器里 model 的 key（TS 编译要用）。 */
  async run(code: string, language: string = 'javascript', key?: string): Promise<void> {
    this.stop() // 先停掉上一次，避免并行 worker 堆积
    const runId = ++this.runId

    // 先拦 import：worker 里的 eval 是脚本上下文，没有模块解析。
    // 让它自己撞上去只会得到一句「Cannot use import statement outside a module」，
    // 说不清是环境限制还是代码写错了。
    const imports = findStaticImports(code)
    if (imports.length > 0) {
      const t = this.translator?.()
      const problem = unresolvedImportProblem(imports)
      this.emitError(t ? translate(problem, t) : problem.key)
      // 这条分支是整个 run() 里唯一同步就结束的：调用方紧接着还要 setRunning(true)，
      // 同步回调会被它盖掉。推到微任务里，「停止」按钮才不会一直亮着。
      await Promise.resolve()
      this.onDone?.()
      return
    }

    let jsCode: string
    try {
      // TS 编译交给 Monaco 常驻的 TS worker（见 compile.ts）
      jsCode = await compileToJs(code, language, key)
    } catch (err) {
      if (runId !== this.runId) return // 编译期间已被停止或重新运行
      const t = this.translator?.()
      this.emitError(t ? messageOf(err, t) : err instanceof Error ? err.message : String(err))
      this.onDone?.()
      return
    }
    if (runId !== this.runId) return // 同上：这次编译结果已作废

    const worker = new RunnerWorker()
    this.worker = worker

    worker.addEventListener('message', (e: MessageEvent) => {
      const data = e.data
      if (data?.from !== 'worker') return
      if (data.type === 'done') {
        this.onDone?.()
        return
      }
      if (data.type === 'batch' && Array.isArray(data.items)) {
        this.emit(data.items as RawConsoleMessage[], typeof data.dropped === 'number' ? data.dropped : 0)
      }
    })

    worker.postMessage({ code: jsCode })
  }

  /** 停止当前运行：强制终止 worker 线程。 */
  stop(): void {
    this.runId++ // 让正在进行的编译结果作废
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }
  }

  /** 释放资源。 */
  destroy(): void {
    this.stop()
    this.onDone = null
    this.translator = null
    this.listeners.clear()
  }

  // 往 Console 里写一条错误（编译失败、import 拦截都发生在主线程，没有 worker 可用）。
  // args 用 worker 序列化 Error 时的同一种标记：Console 才会按错误渲染，
  // 而不是当成一个普通字符串。
  private emitError(message: string): void {
    this.emit([
      {
        type: 'error',
        args: [{ __type: 'error', value: message }],
        indent: 0,
        timestamp: Date.now(),
      },
    ])
  }
}

export const codeRunner = new CodeRunner()
