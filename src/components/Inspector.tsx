import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

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

/*
  排版参照 Chrome DevTools 的对象树：
  - 每行开头固定留一格「折叠槽」（GUTTER），可展开的行放三角，叶子行留空，
    这样同一层的 key 无论有没有三角都在同一列；
  - 子层整体缩进一格槽宽，缩进引导线画在上一级三角的正中，一眼能看出归属；
  - 折叠时的预览带上值（`{a: 1, b: "x", c: {…}}`），不用展开也能看到大概。
*/
// 槽宽 16px：三角图标 12px 居中，两侧各留 2px，加上图标自身的留白，与右侧文字之间
// 约 6px 空隙，和 DevTools 的三角-文字间距接近；再窄就会挤着 key
const GUTTER = 'w-4'
const INDENT = 'ps-4'
const GUIDE = 'start-[7px]'

// 值类型配色：见 index.css 的 --val-* 令牌。这组颜色不跟界面主色（data-accent）联动，
// 否则把主题切成粉色后数字也跟着变粉，读输出时会很别扭
const C = {
  key: 'text-[var(--val-key)]',
  string: 'text-[var(--val-string)]',
  number: 'text-[var(--val-number)]',
  bool: 'text-[var(--val-bool)]',
  nil: 'text-[var(--val-nil)]',
  fn: 'text-[var(--val-fn)] italic',
  regexp: 'text-[var(--val-regexp)]',
  symbol: 'text-[var(--val-symbol)]',
  error: 'text-[var(--accent-error)]',
  // 类名 / Array(n) / Map(n) 这类「容器名」：中性正文色，靠位置而不是颜色区分
  ctor: 'text-[var(--text-body)]',
  // 预览里的 {…} / [Circular] / 括号逗号 等次要内容
  dim: 'text-[var(--text-faint)]',
} as const

const STRING_PREVIEW_MAX = 40

function quote(s: string, max = Infinity) {
  const body = s.length > max ? s.slice(0, max) + '…' : s
  return `"${body}"`
}

// 单值渲染（非可展开对象）。inPreview 时字符串截短，函数只显示 ƒ
function ValueText({ value, inPreview = false }: { value: unknown; inPreview?: boolean }) {
  if (value === null) return <span className={C.nil}>null</span>
  if (isMarked(value)) {
    switch (value.__type) {
      case 'undefined':
        return <span className={C.nil}>undefined</span>
      case 'null':
        return <span className={C.nil}>null</span>
      case 'NaN':
        return <span className={C.number}>NaN</span>
      case 'Infinity':
        return <span className={C.number}>Infinity</span>
      case '-Infinity':
        return <span className={C.number}>-Infinity</span>
      case 'circular':
        return <span className={C.dim}>[Circular]</span>
      case 'depth':
        return <span className={C.dim}>[Depth Limit]</span>
      case 'function':
        return <span className={C.fn}>{inPreview ? 'ƒ' : `ƒ ${value.name}()`}</span>
      case 'symbol':
        return <span className={C.symbol}>{value.desc}</span>
      case 'bigint':
        return <span className={C.number}>{value.value}n</span>
      case 'date':
        return <span className={C.ctor}>{value.value}</span>
      case 'regexp':
        return <span className={C.regexp}>{value.value}</span>
      case 'error':
        return <span className={C.error}>{value.value}</span>
      default:
        break
    }
  }
  switch (typeof value) {
    case 'string':
      return (
        <span className={C.string}>
          {inPreview ? quote(value, STRING_PREVIEW_MAX) : quote(value)}
        </span>
      )
    case 'number':
      return <span className={C.number}>{String(value)}</span>
    case 'boolean':
      return <span className={C.bool}>{String(value)}</span>
    default:
      return <span className={C.ctor}>{String(value)}</span>
  }
}

/** 预览里的一个值：能展开的容器缩成一个名字（`{…}` / `Array(3)` / `Node` / `Map(2)`），其余按单值印 */
function PreviewValue({ value }: { value: unknown }) {
  if (Array.isArray(value)) return <span className={C.dim}>Array({value.length})</span>
  if (isPlainObject(value) && !isMarked(value)) return <span className={C.dim}>{'{…}'}</span>
  if (isMarked(value)) {
    switch (value.__type) {
      case 'instance':
        return <span className={C.ctor}>{value.class}</span>
      case 'Map':
        return <span className={C.ctor}>Map({value.entries.length})</span>
      case 'Set':
        return <span className={C.ctor}>Set({value.items.length})</span>
      case 'stack':
        return <span className={C.dim}>stack</span>
      default:
        break
    }
  }
  return <ValueText value={value} inPreview />
}

// 预览里最多列几项：对象 5 个 key（同 DevTools），数组多给一些，短数组能一眼看全
const PREVIEW_MAX = 5
const ARRAY_PREVIEW_MAX = 10

/**
 * 逗号拼接的一串预览项，超过 max 个用 … 收尾。
 * 每一项连同它后面的逗号做成 inline-block：外层 truncate 截断时，text-overflow 对
 * 原子内联盒是整块取舍的，省略号就只会落在项与项之间（`…, left: Node, …`），
 * 不会把 `right: No…` 从词中间切开
 */
function PreviewList({ items, max = PREVIEW_MAX }: { items: ReactNode[]; max?: number }) {
  const shown = items.slice(0, max)
  const more = items.length > max
  return (
    <>
      {shown.map((item, i) => (
        <span key={i} className="inline-block whitespace-pre">
          {item}
          {(i < shown.length - 1 || more) && ', '}
        </span>
      ))}
      {more && <span className={cn('inline-block', C.dim)}>…</span>}
    </>
  )
}

function ObjectPreview({ props }: { props: Record<string, unknown> }) {
  const entries = Object.entries(props)
  if (entries.length === 0) return <span className={C.dim}>{'{}'}</span>
  return (
    <span className={C.dim}>
      {'{'}
      <PreviewList
        items={entries.map(([k, v]) => (
          <>
            <span className={C.key}>{k}</span>: <PreviewValue value={v} />
          </>
        ))}
      />
      {'}'}
    </span>
  )
}

function ArrayPreview({ items }: { items: unknown[] }) {
  return (
    <span className={C.dim}>
      ({items.length}) [
      <PreviewList items={items.map((v) => <PreviewValue value={v} />)} max={ARRAY_PREVIEW_MAX} />]
    </span>
  )
}

// Map 的 key 在展开行里的写法：基本类型直接印出来，对象类 key 用序号占位
function mapKeyLabel(key: unknown, index: number): string {
  if (typeof key === 'string') return quote(key)
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
  preview: ReactNode
  children: () => ReactNode
}

function describe(value: unknown, depth: number): Node | null {
  if (Array.isArray(value)) {
    return {
      preview: <ArrayPreview items={value} />,
      children: () =>
        value.map((v, i) => <Inspector key={i} value={v} name={String(i)} depth={depth + 1} />),
    }
  }
  if (!isPlainObject(value)) return null
  if (!isMarked(value)) {
    return {
      preview: <ObjectPreview props={value} />,
      children: () =>
        Object.entries(value).map(([k, v]) => (
          <Inspector key={k} value={v} name={k} depth={depth + 1} />
        )),
    }
  }
  switch (value.__type) {
    case 'instance':
      return {
        preview: (
          <>
            <span className={C.ctor}>{value.class}</span> <ObjectPreview props={value.props} />
          </>
        ),
        children: () =>
          Object.entries(value.props).map(([k, v]) => (
            <Inspector key={k} value={v} name={k} depth={depth + 1} />
          )),
      }
    case 'Map':
      return {
        preview: (
          <>
            <span className={C.ctor}>Map({value.entries.length})</span>{' '}
            <span className={C.dim}>
              {'{'}
              <PreviewList
                items={value.entries.map(([k, v]) => (
                  <>
                    <PreviewValue value={k} /> {'=>'} <PreviewValue value={v} />
                  </>
                ))}
              />
              {'}'}
            </span>
          </>
        ),
        children: () =>
          value.entries.map(([k, v], i) => (
            <Inspector key={i} value={v} name={mapKeyLabel(k, i)} depth={depth + 1} />
          )),
      }
    case 'Set':
      return {
        preview: (
          <>
            <span className={C.ctor}>Set({value.items.length})</span>{' '}
            <span className={C.dim}>
              {'{'}
              <PreviewList items={value.items.map((v) => <PreviewValue value={v} />)} />
              {'}'}
            </span>
          </>
        ),
        children: () =>
          value.items.map((v, i) => <Inspector key={i} value={v} name={String(i)} depth={depth + 1} />),
      }
    case 'error':
      if (!value.stack || value.stack.length === 0) return null
      return {
        preview: <span className={C.error}>{value.value}</span>,
        children: () => <StackFrames frames={value.stack ?? []} />,
      }
    case 'stack':
      return {
        preview: <span className={C.dim}>stack</span>,
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
        <div key={i} className={cn('flex leading-5', C.dim)}>
          <span className={cn('shrink-0', GUTTER)} />
          <span className="min-w-0 break-all">{f}</span>
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
  // 错误与调用栈默认展开（在 playground 里行号就是最想看的东西）；其余节点和 DevTools 一样
  // 默认折叠，靠预览看大概，需要时再点开
  const [open, setOpen] = useState(
    isMarked(value) && (value.__type === 'error' || value.__type === 'stack')
  )

  const label = name != null && (
    <>
      <span className={C.key}>{name}</span>
      <span className={C.dim}>: </span>
    </>
  )

  // 普通单值（非对象/数组，或标记值）：留空折叠槽，让 key 与可展开行对齐
  if (!node) {
    return (
      <div className="flex leading-5">
        <span className={cn('shrink-0', GUTTER)} />
        <span className="min-w-0 break-words whitespace-pre-wrap">
          {label}
          <ValueText value={value} />
        </span>
      </div>
    )
  }

  return (
    // min-w-0 / max-w-full：作为多参数日志（flex-wrap）里的一项时也允许被压窄，预览才截得住
    <div className="min-w-0 max-w-full leading-5">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="group/row flex w-full cursor-pointer select-none text-left focus:outline-none"
      >
        <span
          className={cn(
            'flex h-5 shrink-0 items-center justify-center text-[var(--text-faint)] group-hover/row:text-[var(--text-body)]',
            GUTTER
          )}
        >
          <span
            className={cn(
              'icon-[lucide--chevron-right] size-3 transition-transform duration-100',
              open && 'rotate-90'
            )}
          />
        </span>
        {/* 折叠预览只占一行，宽度不够时省略号截断（同 DevTools）；展开后的叶子值才允许换行 */}
        <span className="min-w-0 truncate">
          {label}
          {node.preview}
        </span>
      </button>
      {open && (
        <div className={cn('relative', INDENT)}>
          {/* 缩进引导线：落在上一级三角的正中 */}
          <span className={cn('absolute inset-y-0 w-px bg-[var(--border-strong)]/60', GUIDE)} />
          {node.children()}
        </div>
      )}
    </div>
  )
}

export default Inspector
