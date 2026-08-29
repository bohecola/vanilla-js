// 用户代码运行管理器：基于 Web Worker。
// - run(code, language)：先把 TS 编译成 JS（主线程），再创建 worker 执行
// - stop()：terminate 掉 worker，立即停止（含死循环）
// - destroy()：完全销毁，释放资源
//
// Worker 在独立线程运行，主线程永不卡顿；
// console 输出由 worker 内劫持后通过 postMessage 转发给父页面。
// worker 的 eval 返回后会发送 {type:'done'}，通知父页面「同步部分执行完毕」。

import RunnerWorker from './runner.worker?worker'
import { compileToJs } from './compile'

export class CodeRunner {
  private worker: Worker | null = null
  private onDone: (() => void) | null = null
  // 运行序号：编译是异步的，期间用户可能又点了运行或停止，
  // 靠它判断 await 回来的这次编译结果是否还有效
  private runId = 0

  /** 设置「运行完成」回调（同步代码 eval 返回时触发）。 */
  setOnDone(fn: (() => void) | null): void {
    this.onDone = fn
  }

  /** 创建并启动一次运行。重复调用会先终止上一次。 */
  async run(code: string, language: string = 'javascript'): Promise<void> {
    this.stop() // 先停掉上一次，避免并行 worker 堆积
    const runId = ++this.runId

    let jsCode: string
    try {
      // TS 编译在主线程做：wasm 只初始化一次，不必跟着 worker 反复重建
      jsCode = await compileToJs(code, language)
    } catch (err) {
      if (runId !== this.runId) return // 编译期间已被停止或重新运行
      this.emit('error', [err instanceof Error ? err.message : String(err)])
      this.onDone?.()
      return
    }
    if (runId !== this.runId) return // 同上：这次编译结果已作废

    const worker = new RunnerWorker()
    this.worker = worker

    // Worker 的 postMessage 只会送达 Worker 实例的 message 事件，不会出现在 window 上。
    // Console 面板监听 window 的 message 事件，因此这里把 worker 的输出转发到 window，
    // 保持现有 Console 的接收逻辑不变。
    worker.addEventListener('message', (e: MessageEvent) => {
      const data = e.data
      // 完成信号直接通过回调通知（避免再走一轮 window 事件）
      if (data?.from === 'worker' && data.type === 'done') {
        this.onDone?.()
        return
      }
      window.postMessage(data, '*')
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
  }

  // 以 worker 消息的格式往 Console 里写一条（编译错误发生在主线程，没有 worker 可用）
  private emit(type: string, args: unknown[]): void {
    window.postMessage({ from: 'worker', type, args, timestamp: Date.now() }, '*')
  }
}

export const codeRunner = new CodeRunner()
