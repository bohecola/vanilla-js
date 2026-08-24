import { useState } from 'react'

// init.js 序列化后值的类型。普通 JSON 值（string/number/boolean/array/plain object）
// 直接透传；特殊值用 { __type: '...' } 标记，这里负责把它们渲染成对应的 JS 类型外观。
type Marked =
  | { __type: 'null' }
  | { __type: 'undefined' }
  | { __type: 'NaN' }
  | { __type: 'Infinity' }
  | { __type: '-Infinity' }
  | { __type: 'depth' }
  | { __type: 'circular' }
  | { __type: 'function'; name: string }
  | { __type: 'symbol'; desc: string }
  | { __type: 'bigint'; value: string }
  | { __type: 'date'; value: string }
  | { __type: 'regexp'; value: string }
  | { __type: 'error'; value: string }
  | { __type: 'Map'; entries: [unknown, unknown][] }
  | { __type: 'Set'; items: unknown[] }

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function isMarked(v: unknown): v is Marked {
  return isPlainObject(v) && '__type' in v
}

// 单值渲染（非可展开对象）
function ValueText({ value }: { value: unknown }) {
  if (value === null) return <span className="text-slate-500">null</span>
  if (isMarked(value)) {
    switch (value.__type) {
      case 'undefined':
        return <span className="text-slate-500">undefined</span>
      case 'null':
        return <span className="text-slate-500">null</span>
      case 'NaN':
        return <span className="text-sky-400">NaN</span>
      case 'Infinity':
        return <span className="text-sky-400">Infinity</span>
      case '-Infinity':
        return <span className="text-sky-400">-Infinity</span>
      case 'circular':
        return <span className="text-slate-400">[Circular]</span>
      case 'depth':
        return <span className="text-slate-400">[Depth Limit]</span>
      case 'function':
        return <span className="text-sky-300">ƒ {value.name}()</span>
      case 'symbol':
        return <span className="text-amber-300">{value.desc}</span>
      case 'bigint':
        return <span className="text-sky-400">{value.value}n</span>
      case 'date':
        return <span className="text-slate-300">{value.value}</span>
      case 'regexp':
        return <span className="text-violet-300">{value.value}</span>
      case 'error':
        return <span className="text-red-400">{value.value}</span>
      default:
        break
    }
  }
  switch (typeof value) {
    case 'string':
      return <span className="text-emerald-400">"{value}"</span>
    case 'number':
      return <span className="text-sky-400">{String(value)}</span>
    case 'boolean':
      return <span className="text-violet-400">{String(value)}</span>
    default:
      return <span className="text-slate-200">{String(value)}</span>
  }
}

interface InspectorProps {
  value: unknown
  name?: string
  depth?: number
}

// 折叠时的摘要：{key1, key2, …} 或 Array(n)
function objectPreview(value: Record<string, unknown>): string {
  const keys = Object.keys(value).slice(0, 4)
  const shown = keys.join(', ')
  const rest = Object.keys(value).length > 4 ? ', …' : ''
  return `{${shown}${rest}}`
}

function arrayPreview(value: unknown[]): string {
  return `Array(${value.length})`
}

function Inspector({ value, name, depth = 0 }: InspectorProps) {
  const [open, setOpen] = useState(depth < 2)

  const isArray = Array.isArray(value)
  const isObj = isPlainObject(value) && !isMarked(value) && value.__type !== 'Map' && value.__type !== 'Set'

  // 折叠开关按钮
  const toggle = (
    <button
      type="button"
      onClick={() => setOpen((o) => !o)}
      className="cursor-pointer select-none text-left text-slate-500 hover:text-sky-300 focus:outline-none"
    >
      <span className="mr-1 inline-block w-3 text-slate-600">{open ? '▾' : '▸'}</span>
      {name != null && <span className="text-slate-500">{name}: </span>}
      <span className="text-slate-500">
        {isArray ? arrayPreview(value as unknown[]) : objectPreview(value as Record<string, unknown>)}
      </span>
    </button>
  )

  // Map / Set：按标记对象渲染（不展开细节，用简洁形式）
  if (isMarked(value) && (value.__type === 'Map' || value.__type === 'Set')) {
    return (
      <div className={name != null ? 'pl-3 leading-5' : 'leading-5'}>
        {name != null && <span className="text-slate-500">{name}: </span>}
        <span className="text-amber-300">
          {value.__type === 'Map'
            ? `Map(${value.entries.length})`
            : `Set(${value.items.length})`}
        </span>
      </div>
    )
  }

  // 普通单值（非对象/数组，或标记值）：直接输出
  if (!isArray && !isObj) {
    return (
      <div className={name != null ? 'pl-3 leading-5' : 'leading-5'}>
        {name != null && <span className="text-slate-500">{name}: </span>}
        <ValueText value={value} />
      </div>
    )
  }

  // 数组 / 普通对象：可展开
  const entries: [string, unknown][] = isArray
    ? (value as unknown[]).map((v, i) => [String(i), v])
    : Object.entries(value as Record<string, unknown>)

  return (
    <div className="leading-5">
      {toggle}
      {open && (
        <div className="relative">
          {/* 缩进引导竖线：与上级箭头的水平位置对齐 */}
          <span className="absolute inset-y-0 left-[3px] w-px bg-slate-700" />
          <div className="ml-4">
            {entries.map(([k, v]) => (
              <Inspector key={k} value={v} name={k} depth={depth + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Inspector
