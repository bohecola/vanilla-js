import { useState } from 'react'
import { take } from 'lodash-es'

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

// 不用 lodash 的 isPlainObject：它的返回类型是 boolean 而不是类型谓词，
// 换过去下面每一处 value.__type 的收窄都得改成断言
function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function isMarked(v: unknown): v is Marked {
  return isPlainObject(v) && '__type' in v
}

// 单值渲染（非可展开对象）
function ValueText({ value }: { value: unknown }) {
  if (value === null) return <span className="text-[var(--text-faint)]">null</span>
  if (isMarked(value)) {
    switch (value.__type) {
      case 'undefined':
        return <span className="text-[var(--text-faint)]">undefined</span>
      case 'null':
        return <span className="text-[var(--text-faint)]">null</span>
      case 'NaN':
        return <span className="text-[var(--accent-number)]">NaN</span>
      case 'Infinity':
        return <span className="text-[var(--accent-number)]">Infinity</span>
      case '-Infinity':
        return <span className="text-[var(--accent-number)]">-Infinity</span>
      case 'circular':
        return <span className="text-[var(--text-muted)]">[Circular]</span>
      case 'depth':
        return <span className="text-[var(--text-muted)]">[Depth Limit]</span>
      case 'function':
        return <span className="text-[var(--accent-number-bright)]">ƒ {value.name}()</span>
      case 'symbol':
        return <span className="text-[var(--accent-symbol)]">{value.desc}</span>
      case 'bigint':
        return <span className="text-[var(--accent-number)]">{value.value}n</span>
      case 'date':
        return <span className="text-[var(--text-body)]">{value.value}</span>
      case 'regexp':
        return <span className="text-[var(--accent-keyword)]">{value.value}</span>
      case 'error':
        return <span className="text-[var(--accent-error)]">{value.value}</span>
      default:
        break
    }
  }
  switch (typeof value) {
    case 'string':
      return <span className="text-[var(--accent-string)]">"{value}"</span>
    case 'number':
      return <span className="text-[var(--accent-number)]">{String(value)}</span>
    case 'boolean':
      return <span className="text-[var(--accent-bool)]">{String(value)}</span>
    default:
      return <span className="text-[var(--text-primary)]">{String(value)}</span>
  }
}

interface InspectorProps {
  value: unknown
  name?: string
  depth?: number
}

// 折叠时的摘要：{key1, key2, …} 或 Array(n)
function objectPreview(value: Record<string, unknown>): string {
  const keys = Object.keys(value)
  const shown = take(keys, 4).join(', ')
  const rest = keys.length > 4 ? ', …' : ''
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
      className="cursor-pointer select-none text-left text-[var(--text-faint)] hover:text-[var(--accent-number)] focus:outline-none"
    >
      <span className="mr-1 inline-block w-3 text-[var(--text-faint)]">{open ? '▾' : '▸'}</span>
      {name != null && <span className="text-[var(--text-faint)]">{name}: </span>}
      <span className="text-[var(--text-faint)]">
        {isArray ? arrayPreview(value as unknown[]) : objectPreview(value as Record<string, unknown>)}
      </span>
    </button>
  )

  // Map / Set：按标记对象渲染（不展开细节，用简洁形式）
  if (isMarked(value) && (value.__type === 'Map' || value.__type === 'Set')) {
    return (
      <div className={name != null ? 'pl-3 leading-5' : 'leading-5'}>
        {name != null && <span className="text-[var(--text-faint)]">{name}: </span>}
        <span className="text-[var(--accent-symbol)]">
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
        {name != null && <span className="text-[var(--text-faint)]">{name}: </span>}
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
          <span className="absolute inset-y-0 left-[3px] w-px bg-[var(--border-strong)]" />
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
