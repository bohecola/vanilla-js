import { useState } from 'react'

// 用于在 Console 里递归渲染序列化后的值（来自 init.js 的 safeSerialize）
// 支持对象/数组展开折叠、内建类型标记（Map/Set）、循环引用占位等

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

// init.js 序列化 Map 为 { __type:'Map', entries:[...] }，Set 为 { __type:'Set', items:[...] }
function mapSize(v: Record<string, unknown>): number {
  const entries = v.entries
  return Array.isArray(entries) ? entries.length : 0
}

function setSize(v: Record<string, unknown>): number {
  const items = v.items
  return Array.isArray(items) ? items.length : 0
}

interface InspectorProps {
  value: unknown
  name?: string
  depth?: number
}

function ValueText({ value }: { value: unknown }) {
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

function Inspector({ value, name, depth = 0 }: InspectorProps) {
  const [open, setOpen] = useState(depth < 2)

  const isArray = Array.isArray(value)
  const isObj = isPlainObject(value)
  const isCollapsible = isArray || isObj
  const isMap = isObj && value.__type === 'Map'
  const isSet = isObj && value.__type === 'Set'

  // 非可折叠值：直接输出 key: value
  if (!isCollapsible || isMap || isSet) {
    return (
      <div className="pl-3 leading-5">
        {name != null && <span className="text-slate-400">{name}: </span>}
        {isMap || isSet ? (
          <span className="text-amber-300">
            {isMap ? 'Map' : 'Set'}({isMap ? mapSize(value) : setSize(value)})
          </span>
        ) : (
          <ValueText value={value} />
        )}
      </div>
    )
  }

  const entries: [string, unknown][] = isArray
    ? (value as unknown[]).map((v, i) => [String(i), v])
    : Object.entries(value as Record<string, unknown>)

  const preview = isArray
    ? `Array(${entries.length})`
    : `{${entries.length > 0 ? '…' : ''}}`

  return (
    <div className="leading-5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="cursor-pointer select-none text-left hover:text-sky-300 focus:outline-none"
      >
        <span className="mr-1 inline-block w-3 text-slate-500">{open ? '▾' : '▸'}</span>
        {name != null && <span className="text-slate-400">{name}: </span>}
        <span className="text-slate-200">{preview}</span>
      </button>
      {open && (
        <div className="ml-3 border-l border-slate-700 pl-2">
          {entries.map(([k, v]) => (
            <Inspector key={k} value={v} name={k} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Inspector
