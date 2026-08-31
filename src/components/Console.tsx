import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react'
import { useI18n } from '@/i18n/context'
import type { ConsoleMessage, LogLevel } from '../types'
import Inspector from './Inspector'

export interface ConsoleHandle {
  clear: () => void
}

// 各日志级别的配色与图标
const LEVEL_META: Record<LogLevel, { color: string; badge: string }> = {
  log: { color: 'text-[var(--text-body)]', badge: '' },
  info: { color: 'text-[var(--accent-number)]', badge: 'i' },
  debug: { color: 'text-[var(--text-faint)]', badge: 'dbg' },
  warn: { color: 'text-[var(--accent-symbol)]', badge: 'warn' },
  error: { color: 'text-[var(--accent-error)]', badge: 'err' },
  table: { color: 'text-[var(--accent-string)]', badge: 'table' },
  time: { color: 'text-[var(--accent-number)]', badge: '⏱' },
  timeEnd: { color: 'text-[var(--accent-number)]', badge: '⏱' },
}

// 把一串序列化参数渲染成可读的一行（对象/数组用 Inspector 可折叠展开，单值也交给 Inspector 统一识别标记）
function renderArgs(args: unknown[], key: string) {
  if (args.length === 1) {
    return <Inspector key={key} value={args[0]} />
  }
  return (
    <span key={key} className="flex flex-wrap items-baseline gap-x-2">
      {args.map((a, i) => (
        <Inspector key={i} value={a} />
      ))}
    </span>
  )
}

export default forwardRef<ConsoleHandle>(function Console(_props, ref) {
  const { t } = useI18n()
  const [logs, setLogs] = useState<ConsoleMessage[]>([])
  const idRef = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // 校验消息来源：接受本页内部 iframe 或 Web Worker 转发的 console 输出
  function isTrustedMessage(e: MessageEvent) {
    const from = e.data?.from
    if (from === 'worker') {
      // Worker 消息：source 是 Worker 实例，且必须携带结构化 args
      return Array.isArray(e.data.args) && typeof e.data.type === 'string'
    }
    if (from === 'iframe' && e.source != null) {
      // 兼容旧的 iframe 运行方式（source 须能对应到本页某个 iframe）
      const frames = window.frames
      for (let i = 0; i < frames.length; i++) {
        if (frames[i] === e.source) return true
      }
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
    <div ref={containerRef} className="h-full overflow-auto bg-[var(--panel-bg)] px-2 py-1 font-mono text-[12px] leading-5">
      {logs.length === 0 ? (
        <div className="mt-1 text-[var(--text-faint)]">{t('console.empty')}</div>
      ) : (
        logs.map((log) => {
          const meta = LEVEL_META[log.type]
          // 时间戳的格式跟着界面语言走（中文 24 小时制、英文也用 24 小时制，
          // 差别在分隔符与前导零，交给 Intl 按 locale 决定）
          const time = new Date(log.timestamp).toLocaleTimeString(t('locale.bcp47'), {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
          return (
            <div key={log.id} className={`flex gap-2 py-0.5 ${meta.color} border-b border-[var(--border)]/60 last:border-0`}>
              <span className="shrink-0 text-[var(--text-faint)]">{time}</span>
              {meta.badge && (
                <span className="shrink-0 rounded bg-[var(--badge-bg)] px-1 text-[10px] uppercase">{meta.badge}</span>
              )}
              <div className="min-w-0 flex-1 break-words">{renderArgs(log.args, String(log.id))}</div>
            </div>
          )
        })
      )}
    </div>
  )
})
