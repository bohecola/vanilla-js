// 用户代码的运行环境：Web Worker。
// 在独立线程里执行用户 JS，主线程永不卡顿；
// 「停止」= worker.terminate()，即使 while(true) 死循环也能强制中断。

/// <reference lib="webworker" />
// 将全局 self 断言为 Worker 作用域（避免与 DOM lib 的 self 声明冲突）
const workerScope = self as unknown as DedicatedWorkerGlobalScope

// 特殊值标记：父页面据此渲染成对应类型，而不是当成普通字符串
function marker(type: string) {
  return { __type: type }
}

// 可序列化参数（逻辑与旧 iframe init.js 一致）
function stringify(value: unknown, seen: Set<unknown>, depth: number): unknown {
  if (depth > 12) return marker('depth')
  if (value === null) return marker('null')

  const t = typeof value
  if (t === 'function') return { __type: 'function', name: (value as Function).name || 'anonymous' }
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

function overrideConsole(type: 'log' | 'info' | 'debug' | 'warn' | 'error' | 'table' | 'time' | 'timeEnd') {
  const origin = console[type]
  if (typeof origin !== 'function') return
  ;(console as any)[type] = function () {
    const args = Array.prototype.slice.call(arguments)
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
}

overrideConsole('log')
overrideConsole('info')
overrideConsole('debug')
overrideConsole('warn')
overrideConsole('error')
overrideConsole('table')
overrideConsole('time')
overrideConsole('timeEnd')

// 记录本次运行是否排过定时器（setTimeout/setInterval）。
// 只要排过定时器，就视为「长期运行」（间隔/异步任务），不再发送 done，
// 从而让父页面保持「停止」按钮可用，用户可以随时终止。
let scheduledTimer = false
const origSetTimeout = workerScope.setTimeout.bind(workerScope)
const origSetInterval = workerScope.setInterval.bind(workerScope)
workerScope.setTimeout = ((fn: any, delay?: number, ...args: any[]) => {
  scheduledTimer = true
  return origSetTimeout(fn, delay, ...args)
}) as typeof setTimeout
workerScope.setInterval = ((fn: any, delay?: number, ...args: any[]) => {
  scheduledTimer = true
  return origSetInterval(fn, delay, ...args)
}) as typeof setInterval

// 收到运行指令后，直接在当前 worker 作用域执行用户代码。
// 用间接 eval 避免污染本文件作用域；用户代码抛错则捕获并转发。
// - 纯同步代码：eval 返回且未排定时器 → 发送 done，父页面隐藏「停止」。
// - 排了定时器：虽 eval 返回，但不发 done，保持「停止」可点。
// - while(true) 死循环：eval 永不返回，不发 done，保持「停止」可点。
workerScope.onmessage = (e: MessageEvent) => {
  const code = typeof e.data?.code === 'string' ? e.data.code : ''
  scheduledTimer = false
  try {
    ;(0, eval)(code)
  } catch (err) {
    send('error', [err])
  }
  if (!scheduledTimer) {
    workerScope.postMessage({ from: 'worker', type: 'done', timestamp: Date.now() })
  }
}
