// 用户代码运行管理器：基于 Web Worker。
// - run(code)：创建（或复用）worker 并执行用户代码
// - stop()：terminate 掉 worker，立即停止（含死循环）
// - destroy()：完全销毁，释放资源
//
// Worker 在独立线程运行，主线程永不卡顿；
// console 输出由 worker 内劫持后通过 postMessage 转发给父页面。
// worker 的 eval 返回后会发送 {type:'done'}，通知父页面「同步部分执行完毕」。

import RunnerWorker from './runner.worker?worker'

export class CodeRunner {
  private worker: Worker | null = null
  private onDone: (() => void) | null = null

  /** 设置「运行完成」回调（同步代码 eval 返回时触发）。 */
  setOnDone(fn: (() => void) | null): void {
    this.onDone = fn
  }

  /** 创建并启动一次运行。重复调用会先终止上一次。 */
  run(code: string): void {
    this.stop() // 先停掉上一次，避免并行 worker 堆积

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

    worker.postMessage({ code })
  }

  /** 停止当前运行：强制终止 worker 线程。 */
  stop(): void {
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
}

export const codeRunner = new CodeRunner()
