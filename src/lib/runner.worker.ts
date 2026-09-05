// 用户代码的运行环境：Web Worker。
// 在独立线程里执行用户 JS，主线程永不卡顿；
// 「停止」= worker.terminate()，即使 while(true) 死循环也能强制中断。
// 用户代码被包进 async 函数执行，所以顶层 await 可用（见文件末尾的 onmessage）。

/// <reference lib="webworker" />
// 将全局 self 断言为 Worker 作用域（避免与 DOM lib 的 self 声明冲突）
const workerScope = self as unknown as DedicatedWorkerGlobalScope

// TS 代码在主线程编译好再发进来（见 src/lib/compile.ts），
// 这里收到的始终是可直接 eval 的 JS。

// ---------------------------------------------------------------------------
// 序列化：把任意值变成可 postMessage、且父页面能按 JS 类型外观渲染的结构。
// 特殊值用 { __type } 标记；标记的种类与 Inspector.tsx 里的 Marked 联合类型一一对应。
// ---------------------------------------------------------------------------

function marker(type: string) {
  return { __type: type }
}

/**
 * 把 V8 的 stack 整理成只剩用户代码的帧。
 * 用户代码是 `(async () => {` 紧贴第一行 eval 出来的，V8 里这类帧长这样：
 *   at fn (eval at workerScope.onmessage (…/runner.worker.ts:1:2), <anonymous>:3:9)
 * 只保留其中的函数名和 <anonymous>:行:列；不含 <anonymous> 的帧都是 worker 自身或
 * Promise 内部的，对用户没有意义，丢掉。
 */
function cleanStack(stack: string | undefined): string[] {
  if (!stack) return []
  const frames: string[] = []
  for (const raw of stack.split('\n')) {
    const line = raw.trim()
    if (!line.startsWith('at ')) continue
    const m = /^at (?:(.+?) \()?.*<anonymous>:(\d+):(\d+)\)?$/.exec(line)
    if (m) {
      const fn = m[1] && m[1] !== 'eval' ? m[1] : '<anonymous>'
      frames.push(`at ${fn} (line ${m[2]}:${m[3]})`)
      continue
    }
    // 模块模式：帧长这样 `at add (blob:http://…/uuid:3:9)`，顶层代码没有函数名和括号。
    // 用主线程发来的映射表把 blob URL 换回文件名；映射表里没有的是浏览器 / Monaco 内部的帧，丢掉
    const b = /^at (?:(.+?) \()?(blob:[^\s)]+?):(\d+):(\d+)\)?$/.exec(line)
    if (b) {
      const name = moduleNames[b[2]]
      if (!name) continue
      frames.push(`at ${b[1] ?? '<module>'} (${name}:${b[3]}:${b[4]})`)
    }
  }
  return frames
}

/** 模块模式下 Blob URL → 文件显示名（随 run 消息发来），给 cleanStack 用 */
let moduleNames: Record<string, string> = {}

function constructorName(value: object): string | null {
  const proto = Object.getPrototypeOf(value)
  if (proto === null || proto === Object.prototype) return null
  const name = proto.constructor?.name
  return typeof name === 'string' && name && name !== 'Object' ? name : null
}

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
    if (value instanceof Error) {
      return {
        __type: 'error',
        value: value.name + ': ' + value.message,
        stack: cleanStack(value.stack),
      }
    }
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
    // class 实例带上构造器名，父页面显示成 `Node {v, next}` 而不是匿名的 `{v, next}`
    const cls = constructorName(value as object)
    return cls ? { __type: 'instance', class: cls, props: obj } : obj
  }
  return String(value)
}

function safeSerialize(args: unknown[]): unknown[] {
  const seen = new Set<unknown>()
  return args.map((arg) => stringify(arg, seen, 0))
}

// ---------------------------------------------------------------------------
// console.log('%s is %d', …) 这类格式串：按 Console 标准做替换。
// %c 的样式参数直接吞掉（面板不支持自定义样式）；%o / %O / %j 内联成简短文本。
// ---------------------------------------------------------------------------

function inlineValue(v: unknown): string {
  if (typeof v === 'string') return v
  if (typeof v === 'symbol' || typeof v === 'function' || typeof v === 'bigint') return String(v)
  try {
    const s = JSON.stringify(v)
    return s === undefined ? String(v) : s
  } catch {
    return String(v)
  }
}

function applyFormat(args: unknown[]): unknown[] {
  if (args.length < 2 || typeof args[0] !== 'string' || !args[0].includes('%')) return args
  const rest = args.slice(1)
  let i = 0
  const text = (args[0] as string).replace(/%([sdifoOjc%])/g, (whole, spec: string) => {
    if (spec === '%') return '%'
    if (i >= rest.length) return whole
    const v = rest[i++]
    switch (spec) {
      case 's':
        return inlineValue(v)
      case 'd':
      case 'i':
        return typeof v === 'bigint' ? `${v}n` : String(parseInt(String(v), 10))
      case 'f':
        return String(parseFloat(String(v)))
      case 'c':
        return ''
      default:
        return inlineValue(v)
    }
  })
  return [text, ...rest.slice(i)]
}

// ---------------------------------------------------------------------------
// console 劫持：每个方法都转发一份结构化消息给父页面，再调用原实现（DevTools 里也能看）。
// ---------------------------------------------------------------------------

/** console.group 的嵌套深度：随每条消息一起发出去，父页面按它缩进 */
let groupDepth = 0

/*
  批量发送：同一轮任务里的输出先攒着，微任务里一次 postMessage 出去。
  一个 for 循环里 console.log 两万次，之前是两万次 postMessage + 父页面两万次 setState，
  主线程会卡住十几秒；攒成一批之后父页面只处理一次。

  死循环里的输出（微任务永远轮不到）另有两道闸：
  - 每隔 MIN_FLUSH_INTERVAL 才往外发一次，且只发最近的 BATCH_LIMIT 条，用户能看到进度，
    主线程也不会被每秒几千次消息淹没；
  - 攒着的总量超过 MAX_PENDING 就丢最旧的，只记个数。父页面本来也只留这么多行，
    多发过去也是白白序列化一遍。
  丢掉的条数随批一起发出去，父页面显示成「已省略 N 条」。
*/
const BATCH_LIMIT = 500
const MAX_PENDING = 5000
const MIN_FLUSH_INTERVAL = 300
let pending: unknown[] = []
let dropped = 0
let flushScheduled = false
let lastFlushAt = -Infinity

function post(items: unknown[], droppedCount: number) {
  workerScope.postMessage({ from: 'worker', type: 'batch', items, dropped: droppedCount })
  lastFlushAt = performance.now()
}

/** 任务结束时的正常刷新：把攒着的全发出去 */
function flush() {
  flushScheduled = false
  if (pending.length === 0 && dropped === 0) return
  const items = pending
  const droppedCount = dropped
  pending = []
  dropped = 0
  post(items, droppedCount)
}

/** 同步循环里的中途刷新：只发最近 BATCH_LIMIT 条，其余算作丢弃 */
function flushPartial() {
  const keep = pending.slice(-BATCH_LIMIT)
  const droppedCount = dropped + (pending.length - keep.length)
  pending = []
  dropped = 0
  post(keep, droppedCount)
}

function enqueue(item: unknown) {
  pending.push(item)
  if (pending.length >= BATCH_LIMIT && performance.now() - lastFlushAt >= MIN_FLUSH_INTERVAL) {
    flushPartial()
    return
  }
  // 超出上限就成批地丢最旧的（一次丢一半，别每条都 shift）
  if (pending.length >= MAX_PENDING * 2) {
    dropped += pending.length - MAX_PENDING
    pending = pending.slice(-MAX_PENDING)
  }
  if (!flushScheduled) {
    flushScheduled = true
    queueMicrotask(flush)
  }
}

function send(type: string, args: unknown[]) {
  enqueue({ type, args: safeSerialize(args), indent: groupDepth, timestamp: Date.now() })
}

function sendSafe(type: string, args: unknown[]) {
  try {
    send(type, args)
  } catch {
    // 序列化失败（极端情况，比如 getter 抛错）时降级为字符串
    enqueue({ type, args: args.map(String), indent: groupDepth, timestamp: Date.now() })
  }
}

type AnyFn = (...args: unknown[]) => unknown
const rawConsole = console as unknown as Record<string, AnyFn | undefined>

/** 用 patched 替换 console[name]，并在 patched 之后调用原实现。原实现不存在时也照样装上。 */
// 开发模式下 Vite 会把它的 HMR 客户端注入 module worker，客户端连上后会 console.debug 一句
// 「[vite] connected.」，被下面的劫持转发到面板里就成了一条莫名其妙的 DBG。
// 按调用栈里有没有 @vite/client 过滤，只影响 dev；生产构建里没有这个客户端
function fromViteClient(): boolean {
  return import.meta.env.DEV && (new Error().stack ?? '').includes('@vite/client')
}

function patch(name: string, patched: AnyFn) {
  const origin = rawConsole[name]
  rawConsole[name] = (...args: unknown[]) => {
    if (!fromViteClient()) patched(...args)
    if (typeof origin === 'function') return origin.apply(console, args)
  }
}

// 普通输出：只是级别不同
for (const level of ['log', 'info', 'debug', 'warn', 'error']) {
  patch(level, (...args) => sendSafe(level, applyFormat(args)))
}
// dir / dirxml：面板里和 log 一样按对象树展示
patch('dir', (obj) => sendSafe('log', [obj]))
patch('dirxml', (...args) => sendSafe('log', args))
patch('table', (data) => sendSafe('table', [data]))

patch('assert', (cond, ...args) => {
  if (cond) return
  const [first, ...rest] = applyFormat(args)
  const head = typeof first === 'string' ? `Assertion failed: ${first}` : 'Assertion failed'
  sendSafe('error', typeof first === 'string' ? [head, ...rest] : [head, ...args])
})

patch('trace', (...args) => {
  const stack = cleanStack(new Error().stack).slice(1) // 去掉 trace 自身这一帧
  sendSafe('trace', [...(args.length ? applyFormat(args) : ['console.trace']), { __type: 'stack', frames: stack }])
})

const counters = new Map<string, number>()
patch('count', (label = 'default') => {
  const key = String(label)
  const n = (counters.get(key) ?? 0) + 1
  counters.set(key, n)
  sendSafe('log', [`${key}: ${n}`])
})
patch('countReset', (label = 'default') => {
  const key = String(label)
  if (counters.has(key)) counters.set(key, 0)
  else sendSafe('warn', [`Count for '${key}' does not exist`])
})

const timers = new Map<string, number>()
const elapsed = (key: string) => `${(performance.now() - (timers.get(key) ?? 0)).toFixed(3)} ms`
patch('time', (label = 'default') => {
  const key = String(label)
  if (timers.has(key)) sendSafe('warn', [`Timer '${key}' already exists`])
  else timers.set(key, performance.now())
})
patch('timeLog', (label = 'default', ...args) => {
  const key = String(label)
  if (!timers.has(key)) return sendSafe('warn', [`Timer '${key}' does not exist`])
  sendSafe('time', [`${key}: ${elapsed(key)}`, ...args])
})
patch('timeEnd', (label = 'default') => {
  const key = String(label)
  if (!timers.has(key)) return sendSafe('warn', [`Timer '${key}' does not exist`])
  sendSafe('time', [`${key}: ${elapsed(key)}`])
  timers.delete(key)
})

// 分组：group 本身作为一行标题发出（用当前深度），之后的输出深度 +1
const openGroup = (...args: unknown[]) => {
  sendSafe('group', args.length ? applyFormat(args) : ['console.group'])
  groupDepth++
}
patch('group', openGroup)
patch('groupCollapsed', openGroup)
patch('groupEnd', () => {
  if (groupDepth > 0) groupDepth--
})

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
  flush() // 先把攒着的输出发出去，done 才是最后一条
  workerScope.postMessage({ from: 'worker', type: 'done', timestamp: Date.now() })
}

type TimerFn = (...args: unknown[]) => void
const origSetTimeout = workerScope.setTimeout.bind(workerScope)
const origSetInterval = workerScope.setInterval.bind(workerScope)
const origClearTimeout = workerScope.clearTimeout.bind(workerScope)
const origClearInterval = workerScope.clearInterval.bind(workerScope)

workerScope.setTimeout = ((fn: TimerFn, delay?: number, ...args: unknown[]) => {
  // 字符串形式的回调不常见，直接交给原生实现，不纳入统计。
  // Vite 开发客户端（HMR 心跳）排的定时器也不算：否则它一直挂着，done 永远发不出去
  if (typeof fn !== 'function' || fromViteClient()) return origSetTimeout(fn as never, delay, ...args)
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
  if (typeof fn !== 'function' || fromViteClient()) return origSetInterval(fn as never, delay, ...args)
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
  sendSafe('error', [ev.error ?? ev.message])
})
workerScope.addEventListener('unhandledrejection', (ev: PromiseRejectionEvent) => {
  ev.preventDefault()
  sendSafe('error', [ev.reason])
})

// 收到运行指令后执行用户代码（TS 已在主线程编译成 JS）。
// 代码被包进一个 async 箭头函数：这样顶层 await 可以直接用，
// 并且 `(async () => {` 紧贴用户代码第一行（中间不加换行），异常栈里的行号与编辑器一致。
// 用间接 eval 避免污染本文件作用域；语法错误在 eval 阶段就会抛出。
// - 同步或已 await 完的代码：主体 settle 且没有挂着的定时器 → 发 done，父页面隐藏「停止」。
// - 还有 setInterval / 未触发的 setTimeout：等它们真正结束后才发 done。
// - while(true) 死循环：fn() 永不返回，不发 done，「停止」保持可点（terminate 兜底）。
workerScope.onmessage = (e: MessageEvent) => {
  const data = e.data ?? {}
  const code = typeof data.code === 'string' ? data.code : ''
  moduleNames = data.mode === 'module' && data.names ? data.names : {}
  pendingTimeouts.clear()
  activeIntervals.clear()
  bodySettled = false
  doneSent = false
  groupDepth = 0
  pending = []
  dropped = 0

  let body: Promise<unknown>
  try {
    if (data.mode === 'module') {
      // 模块模式：入口是主线程建好的 Blob URL（依赖的 specifier 已改写成各自的 URL），
      // 用真正的 import() 执行，import / export / 顶层 await 都是原生语义。
      // 语法错误会让 import() reject，走下面同一条错误通道
      body = import(/* @vite-ignore */ String(data.entry))
    } else {
      const fn = (0, eval)('(async () => {' + code + '\n})') as () => Promise<unknown>
      body = fn()
    }
  } catch (err) {
    sendSafe('error', [err])
    bodySettled = true
    maybeDone()
    return
  }

  body
    .catch((err) => sendSafe('error', [err]))
    .finally(() => {
      bodySettled = true
      maybeDone()
    })
}
