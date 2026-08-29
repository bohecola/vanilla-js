// 用户代码的运行环境：Web Worker。
// 在独立线程里执行用户 JS，主线程永不卡顿；
// 「停止」= worker.terminate()，即使 while(true) 死循环也能强制中断。
// 用户代码被包进 async 函数执行，所以顶层 await 可用（见文件末尾的 onmessage）。

/// <reference lib="webworker" />
// 将全局 self 断言为 Worker 作用域（避免与 DOM lib 的 self 声明冲突）
const workerScope = self as unknown as DedicatedWorkerGlobalScope

// TS 代码在主线程用 esbuild 编译好再发进来（见 src/lib/compile.ts），
// 这里收到的始终是可直接 eval 的 JS。

// 特殊值标记：父页面据此渲染成对应类型，而不是当成普通字符串
function marker(type: string) {
  return { __type: type }
}

// 可序列化参数（逻辑与旧 iframe init.js 一致）
function stringify(value: unknown, seen: Set<unknown>, depth: number): unknown {
  if (depth > 12) return marker('depth')
  if (value === null) return marker('null')

  const t = typeof value
  if (t === 'function')
    return { __type: 'function', name: (value as { name?: string }).name || 'anonymous' }
  if (t === 'symbol') return { __type: 'symbol', desc: (value as symbol).toString() }
  if (t === 'bigint') return { __type: 'bigint', value: (value as bigint).toString() }
  if (t === 'undefined') return marker('undefined')

  if (t === 'number') {
    if (Number.isNaN(value)) return marker('NaN')
    if (value === Infinity) return marker('Infinity')
    if (value === -Infinity) return marker('-Infinity')
    return value
  }
  if (t === 'string' || t === 'boolean') return value

  if (t === 'object') {
    if (seen.has(value)) return marker('circular')
    if (value instanceof Date) return { __type: 'date', value: value.toISOString() }
    if (value instanceof RegExp) return { __type: 'regexp', value: value.toString() }
    if (value instanceof Error) return { __type: 'error', value: value.name + ': ' + value.message }
    if (value instanceof Map) {
      seen.add(value)
      const entries: unknown[] = []
      value.forEach((v, k) => entries.push([stringify(k, seen, depth + 1), stringify(v, seen, depth + 1)]))
      seen.delete(value)
      return { __type: 'Map', entries }
    }
    if (value instanceof Set) {
      seen.add(value)
      const items: unknown[] = []
      value.forEach((v) => items.push(stringify(v, seen, depth + 1)))
      seen.delete(value)
      return { __type: 'Set', items }
    }
    seen.add(value)
    if (Array.isArray(value)) {
      const arr = value.map((item) => stringify(item, seen, depth + 1))
      seen.delete(value)
      return arr
    }
    const obj: Record<string, unknown> = {}
    for (const key of Object.keys(value as Record<string, unknown>)) {
      obj[key] = stringify((value as Record<string, unknown>)[key], seen, depth + 1)
    }
    seen.delete(value)
    return obj
  }
  return String(value)
}

function safeSerialize(args: unknown[]): unknown[] {
  const seen = new Set<unknown>()
  return args.map((arg) => stringify(arg, seen, 0))
}

function send(type: string, args: unknown[]) {
  workerScope.postMessage({
    from: 'worker',
    type,
    args: safeSerialize(args),
    timestamp: Date.now(),
  })
}

type ConsoleMethod = 'log' | 'info' | 'debug' | 'warn' | 'error' | 'table' | 'time' | 'timeEnd'

function overrideConsole(type: ConsoleMethod) {
  const origin = console[type] as ((...args: unknown[]) => void) | undefined
  if (typeof origin !== 'function') return
  const patched = (...args: unknown[]) => {
    try {
      send(type, args)
    } catch {
      // 序列化失败时降级为字符串
      workerScope.postMessage({
        from: 'worker',
        type,
        args: args.map(String),
        timestamp: Date.now(),
      })
    }
    return origin.apply(console, args)
  }
  ;(console as unknown as Record<ConsoleMethod, unknown>)[type] = patched
}

overrideConsole('log')
overrideConsole('info')
overrideConsole('debug')
overrideConsole('warn')
overrideConsole('error')
overrideConsole('table')
overrideConsole('time')
overrideConsole('timeEnd')

// —— 运行结束的判定 ——
// 「结束」= 用户代码主体（含顶层 await）已 settle，且没有未完成的异步工作：
// 待触发的 setTimeout 和仍在跑的 setInterval。归零时发 done，父页面复位「停止」按钮。
// 之前的做法是「只要排过定时器就永不发 done」，导致 setTimeout(fn, 100) 这类代码
// 跑完之后「停止」按钮一直亮着。
const pendingTimeouts = new Set<number>()
const activeIntervals = new Set<number>()
let bodySettled = false
let doneSent = false

function maybeDone() {
  if (doneSent || !bodySettled) return
  if (pendingTimeouts.size > 0 || activeIntervals.size > 0) return
  doneSent = true
  workerScope.postMessage({ from: 'worker', type: 'done', timestamp: Date.now() })
}

type TimerFn = (...args: unknown[]) => void
const origSetTimeout = workerScope.setTimeout.bind(workerScope)
const origSetInterval = workerScope.setInterval.bind(workerScope)
const origClearTimeout = workerScope.clearTimeout.bind(workerScope)
const origClearInterval = workerScope.clearInterval.bind(workerScope)

workerScope.setTimeout = ((fn: TimerFn, delay?: number, ...args: unknown[]) => {
  // 字符串形式的回调不常见，直接交给原生实现，不纳入统计
  if (typeof fn !== 'function') return origSetTimeout(fn as never, delay)
  let id = 0
  id = origSetTimeout(
    (...cbArgs: unknown[]) => {
      try {
        fn(...cbArgs)
      } finally {
        // 先执行回调再销账：回调里又排定时器时，计数不会中途归零而误报结束
        pendingTimeouts.delete(id)
        maybeDone()
      }
    },
    delay,
    ...args
  )
  pendingTimeouts.add(id)
  return id
}) as typeof setTimeout

workerScope.setInterval = ((fn: TimerFn, delay?: number, ...args: unknown[]) => {
  if (typeof fn !== 'function') return origSetInterval(fn as never, delay)
  const id = origSetInterval(fn, delay, ...args)
  activeIntervals.add(id)
  return id
}) as typeof setInterval

workerScope.clearTimeout = ((id?: number) => {
  origClearTimeout(id)
  if (typeof id === 'number' && pendingTimeouts.delete(id)) maybeDone()
}) as typeof clearTimeout

workerScope.clearInterval = ((id?: number) => {
  origClearInterval(id)
  // 定时器自己 clearInterval 停掉自己时，这里就是本次运行的终点
  if (typeof id === 'number' && activeIntervals.delete(id)) maybeDone()
}) as typeof clearInterval

// 定时器回调里抛的错、以及没人 catch 的 Promise 拒绝，默认不会经过下方的 try/catch，
// 在控制台里会完全看不见 —— 统一转发出去。
workerScope.addEventListener('error', (ev: ErrorEvent) => {
  ev.preventDefault()
  send('error', [ev.error ?? ev.message])
})
workerScope.addEventListener('unhandledrejection', (ev: PromiseRejectionEvent) => {
  ev.preventDefault()
  send('error', [ev.reason])
})

// 收到运行指令后执行用户代码（TS 已在主线程编译成 JS）。
// 代码被包进一个 async 箭头函数：这样顶层 await 可以直接用，
// 并且 `(async () => {` 紧贴用户代码第一行（中间不加换行），异常栈里的行号与编辑器一致。
// 用间接 eval 避免污染本文件作用域；语法错误在 eval 阶段就会抛出。
// - 同步或已 await 完的代码：主体 settle 且没有挂着的定时器 → 发 done，父页面隐藏「停止」。
// - 还有 setInterval / 未触发的 setTimeout：等它们真正结束后才发 done。
// - while(true) 死循环：fn() 永不返回，不发 done，「停止」保持可点（terminate 兜底）。
workerScope.onmessage = (e: MessageEvent) => {
  const code = typeof e.data?.code === 'string' ? e.data.code : ''
  pendingTimeouts.clear()
  activeIntervals.clear()
  bodySettled = false
  doneSent = false

  let body: Promise<unknown>
  try {
    const fn = (0, eval)('(async () => {' + code + '\n})') as () => Promise<unknown>
    body = fn()
  } catch (err) {
    send('error', [err])
    bodySettled = true
    maybeDone()
    return
  }

  body
    .catch((err) => send('error', [err]))
    .finally(() => {
      bodySettled = true
      maybeDone()
    })
}
