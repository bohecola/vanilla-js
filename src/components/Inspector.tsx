import { useState, type ReactNode } from 'react'
import { take } from 'lodash-es'

// runner.worker.ts 序列化后值的类型。普通 JSON 值（string/number/boolean/array/plain object）
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
  | { __type: 'error'; value: string; stack?: string[] }
  | { __type: 'stack'; frames: string[] }
  | { __type: 'instance'; class: string; props: Record<string, unknown> }
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

// 折叠时的摘要：{key1, key2, …}
function keysPreview(value: Record<string, unknown>): string {
  const keys = Object.keys(value)
  const shown = take(keys, 4).join(', ')
  const rest = keys.length > 4 ? ', …' : ''
  return `{${shown}${rest}}`
}

// Map 的 key 在折叠行里的写法：基本类型直接印出来，对象类 key 用序号占位
function mapKeyLabel(key: unknown, index: number): string {
  if (typeof key === 'string') return `"${key}"`
  if (typeof key === 'number' || typeof key === 'boolean') return String(key)
  if (isMarked(key)) {
    if (key.__type === 'symbol') return key.desc
    if (key.__type === 'bigint') return `${key.value}n`
    if (key.__type === 'null' || key.__type === 'undefined' || key.__type === 'NaN') return key.__type
  }
  return `[key ${index}]`
}

/** 一个可展开节点：折叠行显示 preview，展开后按 children 逐行渲染 */
interface Node {
  /** 折叠行的文本，比如 `Array(3)` / `Node {v, next}` / `Map(2)` */
  preview: string
  previewClass: string
  children: () => ReactNode
}

function describe(value: unknown, depth: number): Node | null {
  if (Array.isArray(value)) {
    return {
      preview: `Array(${value.length})`,
      previewClass: 'text-[var(--text-faint)]',
      children: () =>
        value.map((v, i) => <Inspector key={i} value={v} name={String(i)} depth={depth + 1} />),
    }
  }
  if (!isPlainObject(value)) return null
  if (!isMarked(value)) {
    return {
      preview: keysPreview(value),
      previewClass: 'text-[var(--text-faint)]',
      children: () =>
        Object.entries(value).map(([k, v]) => (
          <Inspector key={k} value={v} name={k} depth={depth + 1} />
        )),
    }
  }
  switch (value.__type) {
    case 'instance':
      return {
        preview: `${value.class} ${keysPreview(value.props)}`,
        previewClass: 'text-[var(--accent-symbol)]',
        children: () =>
          Object.entries(value.props).map(([k, v]) => (
            <Inspector key={k} value={v} name={k} depth={depth + 1} />
          )),
      }
    case 'Map':
      return {
        preview: `Map(${value.entries.length})`,
        previewClass: 'text-[var(--accent-symbol)]',
        children: () =>
          value.entries.map(([k, v], i) => (
            <Inspector key={i} value={v} name={mapKeyLabel(k, i)} depth={depth + 1} />
          )),
      }
    case 'Set':
      return {
        preview: `Set(${value.items.length})`,
        previewClass: 'text-[var(--accent-symbol)]',
        children: () =>
          value.items.map((v, i) => <Inspector key={i} value={v} name={String(i)} depth={depth + 1} />),
      }
    case 'error':
      if (!value.stack || value.stack.length === 0) return null
      return {
        preview: value.value,
        previewClass: 'text-[var(--accent-error)]',
        children: () => <StackFrames frames={value.stack ?? []} />,
      }
    case 'stack':
      return {
        preview: 'stack',
        previewClass: 'text-[var(--text-faint)]',
        children: () => <StackFrames frames={value.frames} />,
      }
    default:
      return null
  }
}

function StackFrames({ frames }: { frames: string[] }) {
  return (
    <>
      {frames.map((f, i) => (
        <div key={i} className="leading-5 text-[var(--text-muted)]">
          {f}
        </div>
      ))}
    </>
  )
}

interface InspectorProps {
  value: unknown
  name?: string
  depth?: number
}

function Inspector({ value, name, depth = 0 }: InspectorProps) {
  const node = describe(value, depth)
  // 错误与调用栈默认展开（在 playground 里行号就是最想看的东西），其他节点前两层展开
  const [open, setOpen] = useState(
    isMarked(value) && (value.__type === 'error' || value.__type === 'stack') ? true : depth < 2
  )

  // 普通单值（非对象/数组，或标记值）：直接输出
  if (!node) {
    return (
      <div className={name != null ? 'pl-3 leading-5' : 'leading-5'}>
        {name != null && <span className="text-[var(--text-faint)]">{name}: </span>}
        <ValueText value={value} />
      </div>
    )
  }

  return (
    <div className="leading-5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="cursor-pointer select-none text-left text-[var(--text-faint)] hover:text-[var(--accent-number)] focus:outline-none"
      >
        <span className="mr-1 inline-block w-3 text-[var(--text-faint)]">{open ? '▾' : '▸'}</span>
        {name != null && <span className="text-[var(--text-faint)]">{name}: </span>}
        <span className={node.previewClass}>{node.preview}</span>
      </button>
      {open && (
        <div className="relative">
          {/* 缩进引导竖线：与上级箭头的水平位置对齐 */}
          <span className="absolute inset-y-0 left-[3px] w-px bg-[var(--border-strong)]" />
          <div className="ml-4">{node.children()}</div>
        </div>
      )}
    </div>
  )
}

export default Inspector
