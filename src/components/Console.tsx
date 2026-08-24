import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react'
import type { ConsoleMessage, LogLevel } from '../types'
import Inspector from './Inspector'

export interface ConsoleHandle {
  clear: () => void
}

// 各日志级别的配色与图标
const LEVEL_META: Record<LogLevel, { color: string; badge: string }> = {
  log: { color: 'text-slate-300', badge: '' },
  info: { color: 'text-sky-400', badge: 'i' },
  debug: { color: 'text-slate-500', badge: 'dbg' },
  warn: { color: 'text-amber-400', badge: 'warn' },
  error: { color: 'text-red-400', badge: 'err' },
  table: { color: 'text-emerald-400', badge: 'table' },
  time: { color: 'text-sky-400', badge: '⏱' },
  timeEnd: { color: 'text-sky-400', badge: '⏱' },
}

// 把一串序列化参数渲染成可读的一行（对象用 Inspector 展开）
function renderArgs(args: unknown[], key: string) {
  if (args.length === 1) {
    const only = args[0]
    if (typeof only === 'object' && only !== null) {
      return <Inspector key={key} value={only} />
    }
    return <ValueCell key={key} value={only} />
  }
  return (
    <span key={key} className="flex flex-wrap gap-x-2">
      {args.map((a, i) =>
        typeof a === 'object' && a !== null ? (
          <Inspector key={i} value={a} />
        ) : (
          <ValueCell key={i} value={a} />
        )
      )}
    </span>
  )
}

function ValueCell({ value }: { value: unknown }) {
  if (value === null) return <span className="text-slate-500">null</span>
  switch (typeof value) {
    case 'string':
      return <span className="text-emerald-400">"{value}"</span>
    case 'number':
      return <span className="text-sky-400">{String(value)}</span>
    case 'boolean':
      return <span className="text-violet-400">{String(value)}</span>
    case 'undefined':
      return <span className="text-slate-500">undefined</span>
    default:
      return <span className="text-slate-200">{String(value)}</span>
  }
}

export default forwardRef<ConsoleHandle>(function Console(_props, ref) {
  const [logs, setLogs] = useState<ConsoleMessage[]>([])
  const idRef = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // 校验消息来源：必须来自页面内部的 iframe，且 from 标记正确
  function isTrustedMessage(e: MessageEvent) {
    if (e.source == null) return false
    // 只接受来自本页面 window 内部的 iframe 消息
    // source 必须能对应到本页面的某个 iframe
    const frames = window.frames
    for (let i = 0; i < frames.length; i++) {
      if (frames[i] === e.source) return e.data?.from === 'iframe'
    }
    return false
  }

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (!isTrustedMessage(e)) return
      const { type, args, timestamp } = e.data
      if (!type || !Array.isArray(args)) return
      setLogs((prev) => [
        ...prev,
        {
          id: ++idRef.current,
          type,
          args,
          timestamp: typeof timestamp === 'number' ? timestamp : Date.now(),
        },
      ])
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // 新日志自动滚动到底部
  useEffect(() => {
    const el = containerRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [logs])

  useImperativeHandle(ref, () => ({
    clear: () => {
      setLogs([])
    },
  }))

  return (
    <div ref={containerRef} className="h-full overflow-auto bg-slate-900 px-2 py-1 font-mono text-[12px] leading-5">
      {logs.length === 0 ? (
        <div className="mt-1 text-slate-600">// console 输出会显示在这里</div>
      ) : (
        logs.map((log) => {
          const meta = LEVEL_META[log.type]
          const time = new Date(log.timestamp).toLocaleTimeString('zh-CN', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
          return (
            <div key={log.id} className={`flex gap-2 py-0.5 ${meta.color} border-b border-slate-800/60 last:border-0`}>
              <span className="shrink-0 text-slate-600">{time}</span>
              {meta.badge && (
                <span className="shrink-0 rounded bg-slate-700 px-1 text-[10px] uppercase">{meta.badge}</span>
              )}
              <div className="min-w-0 flex-1 break-words">{renderArgs(log.args, String(log.id))}</div>
            </div>
          )
        })
      )}
    </div>
  )
})
