import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { clamp, groupBy, map } from 'lodash-es'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { MAX_ENTRIES_PER_DIR, languageOf, type Entry, type FileEntry } from '@/lib/fs-access'
import { translate, useI18n, type T } from '@/i18n/context'
import { rootAsEntry, type Workspace, type WorkspaceRoot } from '@/hooks/useWorkspace'
import type { Draft, FileDraft } from '@/hooks/useFileDraft'

/*
  左侧文件栏：上半是用户的本地目录（可以同时开多个，懒展开），下半是内置 Demo。

  宽度用手写的拖拽把手，没有引入 react-resizable-panels：整个界面只有这一条分隔线
  需要拖，而引入它意味着把编辑器/控制台那套本来没人抱怨的 flex 布局也一起改掉。
*/

const WIDTH_KEY = 'jotter:sidebarWidth'
const COLLAPSED_KEY = 'jotter:sidebarCollapsed'
/**
 * Demo 那一段的展开状态。
 *
 * 键名从 `jotter:templatesCollapsed` 换成了这个，不是为了好看：那一版的默认值是「展开」，
 * 而持久化的 effect 每次挂载都会写一遍，于是所有老用户本地都存着「展开」——
 * 沿用同一个键的话，「默认收起」这件事对他们永远不会生效。
 */
const TEMPLATES_KEY = 'jotter:templatesOpen'
/** 上一版的键。语义正好相反，留在 localStorage 里只会让人读错，见一次清一次。 */
const LEGACY_TEMPLATES_KEY = 'jotter:templatesCollapsed'
const MIN_WIDTH = 180
const MAX_WIDTH = 480
const DEFAULT_WIDTH = 264

/**
 * 刷新的最短转圈时长。读盘通常几毫秒就回来，转不满一圈就停，看着和没点一样。
 * 数值要和图标上的 animation-duration 一致：正好转满一整圈，收尾时不会从半圈跳回原位。
 */
const REFRESH_SPIN_MS = 500

/**
 * 每层缩进的宽度，刻意等于「图标 + 图标后的间距」（size-3.5 = 14px，gap-1.5 = 6px）：
 * 这样子项的图标正好落在父项名字的起点上，箭头不会戳到上一层的名字前面去。
 * 改图标尺寸或行内 gap 时这个数要跟着改，三者是一组。
 */
const INDENT = 20

/** 一行的左内边距。根目录行是 depth 0，它下面的第一层是 1。 */
const padOf = (depth: number) => 8 + depth * INDENT

/* 全局选中行 id 的拼法。文件/模板行直接用打开 key（local:… / builtin:…）；
   目录与根没有对应的打开 key，各带前缀，避免和同名文件撞 id。 */
const dirSelId = (path: string) => `dir:${path}`
const rootSelId = (id: string) => `root:${id}`

/**
 * 行首那个图标槽（折叠箭头 / 文件图标都放这里）。
 *
 * `flex` 不是装饰：图标是 inline-block、按基线对齐，而这个 <span> 作为 flex item
 * 的高度跟着 line-height 走（13px 字号 → 19.5px），14px 的图标于是被顶到基线上方，
 * 中线比文字高出 1.75px —— 看着就是「箭头没和文字居中」。让槽自己先居中一次，
 * 图标就只按自身高度参与外层那个 items-center，两边中线才真正对齐。
 */
const ICON_SLOT = 'flex shrink-0 items-center text-[var(--text-muted)] [&>[data-slot=icon]]:size-3.5'

/**
 * 平滑推进的进度条。
 *
 * 底层的真实进度是异步一步步跳上来的（demo 文件都很小，每个文件通常只报一两次），
 * 直接拿来渲染会把 50% 一步弹到 70%。这里用 rAF 把「显示的百分比」以固定速度追向
 * 真实值，看起来就是下载管理器那种连续推进，而不是一格格跳。
 */
function SmoothProgressBar({ value }: { value: number }) {
  const [shown, setShown] = useState(0)
  const shownRef = useRef(0)
  // 每次 rAF 最多推进多少个百分点。太快不「平滑」，太慢会显得很拖。
  const SPEED = 1.2

  useEffect(() => {
    let raf = 0
    const tick = () => {
      const cur = shownRef.current
      if (Math.abs(value - cur) < 0.01) {
        shownRef.current = value
        setShown(value)
        return
      }
      const next =
        cur < value ? Math.min(cur + SPEED, value) : Math.max(cur - SPEED, value)
      shownRef.current = next
      setShown(next)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value])

  return (
    <>
      <div className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-[var(--panel-hover)]">
        <div className="h-full bg-[var(--primary)]/70" style={{ width: `${shown}%` }} />
      </div>
      <span className="shrink-0 text-[11px] tabular-nums text-[var(--text-faint)]">
        {Math.round(shown)}%
      </span>
    </>
  )
}

/**
 * 内置 Demo 按所在目录分组：路径提到分组标题上，条目里只留文件名。
 *
 * t 是传进来的而不是在函数里取的 —— 这是个纯函数，不是组件，钩子在这里用不了。
 */
function groupTemplates(paths: string[], t: T) {
  const byDir = groupBy(paths, (path) => {
    const rel = path.replace('../template/', '')
    const slash = rel.lastIndexOf('/')
    return slash === -1 ? t('sidebar.uncategorized') : rel.slice(0, slash)
  })
  return map(byDir, (items, dir) => ({
    dir,
    items: items.map((path) => ({ path, label: path.slice(path.lastIndexOf('/') + 1) })),
  }))
}

function readWidth(): number {
  try {
    const raw = Number(localStorage.getItem(WIDTH_KEY))
    return Number.isFinite(raw) && raw >= MIN_WIDTH && raw <= MAX_WIDTH ? raw : DEFAULT_WIDTH
  } catch {
    return DEFAULT_WIDTH
  }
}

/**
 * 树里的一行。
 *
 * 剩下的 props（含 ref）原样透传到那个 <button>：右键菜单要把事件和 ref 挂在
 * 这个可聚焦元素上，键盘的 Shift+F10 / 菜单键才打得开菜单。
 * React 19 里 ref 就是普通 prop，不用 forwardRef。
 */
interface RowProps extends React.ComponentProps<'button'> {
  depth: number
  label: string
  /** 是否命中全局选中（同 VS Code：同一时刻侧栏只有一行是选中态）。
      命中则整行无圆角平铺 --list-active 底色 + 一圈细的焦点描边。 */
  selected?: boolean
  /** 与 selected 同义，历史遗留名：当前打开文件也当选中处理。调用来统一传 selected */
  active?: boolean
  dirty?: boolean
  /** 命中忽略名单的目录、以及非文本文件：显示为淡色，但照样可点 */
  dimmed?: boolean
  icon: React.ReactNode
}

/** 缩进走 padding 而不是嵌套 margin，hover 背景才能铺满整行。 */
function Row({
  depth,
  label,
  active,
  dirty,
  selected,
  dimmed,
  icon,
  className,
  style,
  ...rest
}: RowProps) {
  const { t } = useI18n()
  const isSelected = selected || active
  return (
    <button
      type="button"
      title={label}
      // style 要和外面传进来的合并：ContextMenuTrigger asChild 会往下塞一个
      // style（WebkitTouchCallout），直接 {...rest} 会把这里的缩进整个顶掉
      style={{ paddingLeft: padOf(depth), ...style }}
      className={cn(
        // 不加圆角：VS Code 的选中 / hover 是贴边的整行矩形
        // 预留 1px 透明边框：选中时改成主色细框，四周都画得出来、且不造成布局跳动
        'relative flex w-full items-center gap-1.5 border border-transparent py-1 pr-2 text-left text-[13px] text-[var(--text-body)]',
        // hover 只加在非选中行上，避免悬停时把选中底色盖成普通 hover
        !isSelected && 'hover:bg-[var(--panel-hover)]',
        // 选中行：整行平铺半透明底色 + 四周 1px 细框（同 VS Code 的焦点描边）
        isSelected &&
          'bg-[var(--list-active)] border-[var(--list-active-ring)]',
        dimmed && !isSelected && 'text-[var(--text-faint)]',
        className
      )}
      {...rest}
    >
      <span className={ICON_SLOT}>{icon}</span>
      <span className="truncate font-mono">{label}</span>
      {dirty && (
        <span
          aria-label={t('sidebar.unsaved')}
          className="ml-auto size-1.5 shrink-0 rounded-full bg-[var(--accent-symbol)]"
        />
      )}
    </button>
  )
}

/**
 * 文件行 / 目录行的右键菜单。
 *
 * trigger 用 asChild 直接套在行本身那个 <button> 上，而不是外面包一层 <div>：
 * 落在可聚焦元素上，键盘的 Shift+F10 / 菜单键才能打开它。
 * 根目录行刻意不套 —— 那一行右边的 × 是「关闭目录」（不动磁盘），
 * 把「删掉整个目录」放在同一行上太危险。
 */
function EntryMenu({
  entry,
  onRename,
  onDelete,
  onCopyPath,
  children,
}: {
  entry: Entry
  onRename: (entry: Entry) => void
  onDelete: (entry: Entry) => void
  onCopyPath: (path: string) => void
  children: React.ReactNode
}) {
  const { t } = useI18n()
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent
        className="min-w-[10rem]"
        // 菜单关掉时不要把焦点还给那一行：重命名会当场把这一行换成输入框，
        // 焦点被抢回去等于触发输入框的失焦取消，这次改名就没了
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <ContextMenuItem onSelect={() => onCopyPath(entry.path)}>
          <Icon className="icon-[lucide--copy]" />
          {t('menu.copyPath')}
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => onRename(entry)}>
          <Icon className="icon-[codicon--edit]" />
          {t('menu.rename')}
          {/* 快捷键：macOS 回车、其它平台 F2 */}
          <ContextMenuShortcut>
            {/mac/i.test(navigator.platform || navigator.userAgent) ? 'Enter' : 'F2'}
          </ContextMenuShortcut>
        </ContextMenuItem>
        {/* 图标显式给 text-destructive：菜单项里没写颜色的图标会被统一压成 muted，
            这一项的文字是红的，图标得跟着 */}
        <ContextMenuItem variant="destructive" onSelect={() => onDelete(entry)}>
          <Icon className="icon-[codicon--trash] text-destructive" />
          {t('menu.delete')}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

/**
 * 行内命名输入。新建时插在子列表第一行，重命名时就地替换掉原来那一行。
 * 样式刻意照抄 Row：它应该看着就是树里的一行，
 * 而不是一个凭空插进来的表单控件（这也是没用 shadcn 的 Input 的原因，
 * 它自带的高度和 padding 和树行对不齐）。
 */
function DraftRow({ depth, draft, value }: { depth: number; draft: FileDraft; value: Draft }) {
  const { t } = useI18n()
  const renaming = value.mode === 'rename'
  return (
    <li>
      <div
        style={{ paddingLeft: padOf(depth) }}
        className="flex w-full items-center gap-1.5 py-1 pr-2"
      >
        <span className={ICON_SLOT}>
          {value.kind === 'file' ? (
            <Icon className="icon-[lucide--file-code-2]" />
          ) : renaming ? (
            <Icon className="icon-[lucide--chevron-right]" />
          ) : (
            <Icon className="icon-[lucide--folder-plus]" />
          )}
        </span>
        <input
          // 输入框是点击「新建」/「重命名」后当场出现的，焦点必须跟过来，
          // 否则得再点一下才能打字
          autoFocus
          value={value.name}
          disabled={draft.busy}
          aria-label={
            renaming
              ? t('sidebar.renameAria')
              : value.kind === 'file'
                ? t('sidebar.newFileAria')
                : t('sidebar.newDirAria')
          }
          onChange={(e) => draft.setName(e.target.value)}
          onFocus={(e) => e.currentTarget.select()}
          onKeyDown={(e) => {
            if (e.key === 'Enter') draft.submit()
            else if (e.key === 'Escape') draft.cancel()
          }}
          // 失焦取消而不是提交：新建和改名都是有副作用的动作，点到别处顺手建出一个
          // 「未命名.js」比丢掉几个字更烦人
          onBlur={draft.cancel}
          className="min-w-0 flex-1 rounded-sm border border-[var(--primary)]/60 bg-[var(--panel-bg)] px-1 font-mono text-[13px] text-[var(--text-primary)] outline-none"
        />
      </div>
      {value.error && (
        <p
          style={{ paddingLeft: padOf(depth + 1) }}
          className="pb-1 pr-2 text-[12px] leading-snug text-[var(--accent-error)]"
        >
          {translate(value.error, t)}
        </p>
      )}
    </li>
  )
}

/**
 * 根目录那一行。和普通目录行的差别：名字加粗，右边挂一个「操作」菜单，
 * 没授权时整行变成「点我恢复」。它自己不缩进，子层从 depth 1 起 ——
 * 同时开好几个目录时，缩进是唯一能看出「这堆文件属于哪个根」的线索。
 *
 * 那些动作（新建、刷新、移除）都收进一个菜单里，而不是在行尾摊开成一排图标：
 * 行尾常驻一个 × 太像「删掉这个目录」，而它其实只是从列表里去掉。
 * 菜单同时挂在 ⋯ 按钮和整行的右键上 —— 右键是 VS Code 的习惯，
 * ⋯ 是给不知道有右键这回事的人留的入口。
 */
function RootRow({
  root,
  workspace,
  draft,
  onClose,
  selected,
  onSelect,
}: {
  root: WorkspaceRoot
  workspace: Workspace
  draft: FileDraft
  onClose: (root: WorkspaceRoot) => void
  /** 是否全局选中（同 VS Code：整行高亮） */
  selected: boolean
  /** 点这一行时把它设为全局选中 */
  onSelect: () => void
}) {
  const { t } = useI18n()
  const open = workspace.expanded.has(root.id)
  const locked = root.needsPermission
  // 菜单是受控的：⋯ 按钮和整行的右键要打开同一个菜单
  const [menuOpen, setMenuOpen] = useState(false)

  /*
    菜单项的动作一律等菜单关完再执行，而不是在 onSelect 里当场做。

    Radix 关菜单有退出动画，它的 FocusScope 要等动画播完才拆；在 onSelect 里就把
    输入框插进树里的话，输入框 autoFocus 拿到的焦点会被随后的 FocusScope 拆除
    甩回 <body>（实测就是这样），用户得再点一次才能打字。
    onCloseAutoFocus 正好是「已经关完、焦点还没归位」的那一刻。

    赋值都写在各个 onSelect 里，而不是抽一个 afterClose(fn) helper ——
    helper 是在渲染期间被调用的，react-hooks/refs 会把它当成「渲染时读 ref」。
  */
  const afterCloseRef = useRef<(() => void) | null>(null)

  // 新建落在这个根上，而不是当前的「目标目录」。select 是异步的，
  // start 读到的还是旧 target，所以父目录显式传进去
  const startIn = (kind: 'file' | 'directory') => {
    workspace.select(root.id)
    draft.start(kind, { parentPath: root.id })
  }

  return (
    <div className="group flex items-center gap-0.5 pr-1">
      <button
        type="button"
        title={
          locked
            ? t('sidebar.rootLocked', { name: root.name })
            : t('sidebar.rootHint', { name: root.name })
        }
        // 没授权时点击就是去要权限：requestPermission 只能在用户手势里发起，
        // 而这一行本身就是那个手势最自然的落点
        onClick={() => {
          if (locked) {
            void workspace.restore(root.id)
            return
          }
          workspace.select(root.id)
          void workspace.toggle(rootAsEntry(root))
          onSelect()
        }}
        // 右键落在行上，菜单开在 ⋯ 那个位置（Radix 的 DropdownMenu 是贴着
        // trigger 定位的）。位置固定反而比跟着指针跑好认。
        onContextMenu={(e) => {
          e.preventDefault()
          setMenuOpen(true)
        }}
        style={{ paddingLeft: padOf(0) }}
        className={cn(
          // 预留 1px 透明边框：选中时改成主色细框，四周都画得出来、不造成布局跳动
          'relative flex min-w-0 flex-1 items-center gap-1.5 border border-transparent py-1 pr-1 text-left text-[13px]',
          // 选中行：无圆角平铺 + 四周 1px 细描边；hover 不盖掉选中
          selected
            ? 'bg-[var(--list-active)] border-[var(--list-active-ring)]'
            : 'hover:bg-[var(--panel-hover)]'
        )}
      >
        <span className={ICON_SLOT}>
          {locked ? (
            <Icon className="icon-[lucide--lock]" />
          ) : open ? (
            <Icon className="icon-[lucide--chevron-down]" />
          ) : (
            <Icon className="icon-[lucide--chevron-right]" />
          )}
        </span>
        <span
          className={cn(
            'truncate font-mono',
            locked ? 'text-[var(--text-faint)]' : 'font-medium text-[var(--text-primary)]'
          )}
        >
          {root.name}
        </span>
        {locked && (
          <span className="ml-auto shrink-0 text-[11px] text-[var(--text-faint)]">
            {t('sidebar.needAuth')}
          </span>
        )}
      </button>
      {/* ⋯ 只在悬停 / 聚焦 / 菜单开着时露出来：目录多了之后，一排常驻的图标全是噪音 */}
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            title={t('sidebar.rootMenu', { name: root.name })}
            aria-label={t('sidebar.rootMenu', { name: root.name })}
            className="shrink-0 rounded-sm p-0.5 text-[var(--text-faint)] opacity-0 transition-opacity group-hover:opacity-100 hover:bg-[var(--panel-hover)] hover:text-[var(--text-body)] focus-visible:opacity-100 data-[state=open]:opacity-100"
          >
            <Icon className="icon-[lucide--ellipsis] size-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="min-w-[9rem]"
          onCloseAutoFocus={(e) => {
            // 焦点不要回到 ⋯：新建的输入框马上就要用它，
            // 回到 ⋯ 再被输入框抢走，等于给输入框来一次失焦（= 取消）
            e.preventDefault()
            const run = afterCloseRef.current
            afterCloseRef.current = null
            run?.()
          }}
        >
          {/* 没授权的目录读不出内容，新建和刷新都没有意义，但「移除」得留着 ——
              否则一个待授权的目录就再也去不掉了 */}
          {!locked && (
            <>
              <DropdownMenuItem
                onSelect={() => {
                  afterCloseRef.current = () => startIn('file')
                }}
              >
                <Icon className="icon-[codicon--new-file]" />
                {t('menu.newFile')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  afterCloseRef.current = () => startIn('directory')
                }}
              >
                <Icon className="icon-[codicon--new-folder]" />
                {t('menu.newDir')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  afterCloseRef.current = () => void workspace.refresh(root.id)
                }}
              >
                <Icon className="icon-[codicon--refresh]" />
                {t('menu.refresh')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          {/* 图标显式给 text-destructive：菜单项里没写颜色的图标会被统一压成 muted */}
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => {
              afterCloseRef.current = () => onClose(root)
            }}
          >
            <Icon className="icon-[codicon--close] text-destructive" />
            {t('menu.removeRoot')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

interface TreeProps {
  path: string
  depth: number
  workspace: Workspace
  draft: FileDraft
  activeKey: string | null
  dirtyKeys: Set<string>
  /** 全局选中的行 id（见 Sidebar 里 selectedId 的说明） */
  selectedId: string | null
  /** 点某一行时把它设为全局选中。行 id 的拼法见 dirSelId / rootSelId / 打开 key */
  onSelect: (id: string) => void
  onOpenFile: (entry: FileEntry) => void
  onRenameEntry: (entry: Entry) => void
  onDeleteEntry: (entry: Entry) => void
  onCopyPath: (path: string) => void
  /** 某一行被点击/选中时回调，用于记住「最近操作的是谁」供重命名快捷键用 */
  onSelectEntry: (entry: Entry) => void
}

/** 递归渲染一层目录。没有缓存到 childrenByPath 的层不渲染（还没展开过）。 */
function Tree({
  path,
  depth,
  workspace,
  draft,
  activeKey,
  dirtyKeys,
  selectedId,
  onSelect,
  onOpenFile,
  onRenameEntry,
  onDeleteEntry,
  onCopyPath,
  onSelectEntry,
}: TreeProps) {
  const { t } = useI18n()
  const listing = workspace.childrenByPath.get(path)
  if (!listing) return null

  const editing = draft.draft
  // 新建的输入框插在这一层的第一行；重命名的输入框在下面就地替换掉那一行
  const drafting = editing?.mode === 'create' && editing.parentPath === path ? editing : null

  const rowFor = (entry: Entry) => {
    if (editing?.mode === 'rename' && editing.target?.path === entry.path) {
      return <DraftRow key={entry.path} depth={depth} draft={draft} value={editing} />
    }

    if (entry.kind === 'directory') {
      const open = workspace.expanded.has(entry.path)
      return (
        <li key={entry.path}>
          <EntryMenu
            entry={entry}
            onRename={onRenameEntry}
            onDelete={onDeleteEntry}
            onCopyPath={onCopyPath}
          >
            <Row
              depth={depth}
              label={entry.name}
              dimmed={entry.ignored}
              selected={selectedId === dirSelId(entry.path)}
              icon={
                open ? (
                  <Icon className="icon-[lucide--chevron-down]" />
                ) : (
                  <Icon className="icon-[lucide--chevron-right]" />
                )
              }
              // 一次点击同时做两件事：展开/收起，并把它设为新建目标 + 全局选中。
              // 不拆成「点箭头展开、点名字选中」——这条侧栏最窄只有 180px，
              // 两个命中区挤在一起只会点错。
              onClick={() => {
                workspace.select(entry.path)
                void workspace.toggle(entry)
                onSelect(dirSelId(entry.path))
                onSelectEntry(entry)
              }}
            />
          </EntryMenu>
          {open && (
            <Tree
              path={entry.path}
              depth={depth + 1}
              workspace={workspace}
              draft={draft}
              activeKey={activeKey}
              dirtyKeys={dirtyKeys}
              selectedId={selectedId}
              onSelect={onSelect}
              onOpenFile={onOpenFile}
              onRenameEntry={onRenameEntry}
              onDeleteEntry={onDeleteEntry}
              onCopyPath={onCopyPath}
              onSelectEntry={onSelectEntry}
            />
          )}
        </li>
      )
    }

    const key = `local:${entry.path}`
    const language = languageOf(entry.name)
    return (
      <li key={entry.path}>
        <EntryMenu
          entry={entry}
          onRename={onRenameEntry}
          onDelete={onDeleteEntry}
          onCopyPath={onCopyPath}
        >
          <Row
            depth={depth}
            label={entry.name}
            selected={selectedId === key}
            dirty={dirtyKeys.has(key)}
            // 认不出后缀的文件点开会被拒（可能是二进制），先在视觉上说明它不一样
            dimmed={language === null}
            icon={
              language === null ? (
                <Icon className="icon-[lucide--file-text]" />
              ) : (
                <Icon className="icon-[lucide--file-code-2]" />
              )
            }
            onClick={() => {
              onOpenFile(entry)
              onSelect(key)
              onSelectEntry(entry)
            }}
          />
        </EntryMenu>
      </li>
    )
  }

  return (
    <ul>
      {drafting && <DraftRow depth={depth} draft={draft} value={drafting} />}
      {listing.entries.map(rowFor)}
      {listing.entries.length === 0 && !drafting && (
        <li
          style={{ paddingLeft: padOf(depth + 1) }}
          className="py-1 text-[12px] text-[var(--text-faint)]"
        >
          {t('sidebar.emptyDir')}
        </li>
      )}
      {listing.truncated && (
        <li
          style={{ paddingLeft: padOf(depth + 1) }}
          className="py-1 text-[12px] text-[var(--text-faint)]"
        >
          {/* 上限从常量取，不写在句子里：否则中英两份字典各自记一个 500，改的时候准漏 */}
          {t('sidebar.truncated', { max: MAX_ENTRIES_PER_DIR })}
        </li>
      )}
    </ul>
  )
}

export interface SidebarProps {
  workspace: Workspace
  draft: FileDraft
  /** 内置 Demo 的 glob 路径列表 */
  templates: string[]
  activeKey: string | null
  dirtyKeys: Set<string>
  /** 开一份空白草稿。不落在任何目录里，Ctrl+S 时再决定存到哪 */
  onNewScratch: () => void
  onOpenTemplate: (path: string) => void
  onOpenLocalFile: (entry: FileEntry) => void
  /** 「把全部 Demo 存到本地文件夹」。选文件夹、落盘、接管成根都在 App 那边 */
  onSaveDemos: () => void
  /** 写入进行中时点「取消」：停止写入并清理已写残留 */
  onCancelSave: () => void
  /** 是否正在执行取消（点了确认、在清理残留），用于把取消按钮置灰防重复 */
  cancelling: boolean
  /** 正在把 Demo 存到本地的写入进度（文件级 + 字节级）；null 表示当前没有正在进行的保存 */
  saveProgress: {
    file: string
    doneFiles: number
    totalFiles: number
    writtenBytes: number
    totalBytes: number
  } | null
  /** 右键菜单里的两项。都只作用在树里的项上，根目录行不给（那一行的 × 是「关闭目录」） */
  onRenameEntry: (entry: Entry) => void
  onDeleteEntry: (entry: Entry) => void
  /** 右键「复制路径」：复制应用内相对路径到剪贴板 */
  onCopyPath: (path: string) => void
  /** 根目录菜单里的「移除目录」。不动磁盘，但要确认、并且要清掉这棵树里打开过的文件 */
  onCloseRoot: (root: WorkspaceRoot) => void
}

export default function Sidebar({
  workspace,
  draft,
  templates,
  activeKey,
  dirtyKeys,
  onNewScratch,
  onOpenTemplate,
  onOpenLocalFile,
  onSaveDemos,
  onCancelSave,
  cancelling,
  saveProgress,
  onRenameEntry,
  onDeleteEntry,
  onCopyPath,
  onCloseRoot,
}: SidebarProps) {
  const { t } = useI18n()
  const [width, setWidth] = useState(readWidth)
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSED_KEY) === '1'
    } catch {
      return false
    }
  })
  // Demo 这一段默认收起：它是「要用的时候才翻开」的东西，
  // 首屏摊开一堆别人的文件名，会把上面真正在用的本地目录挤下去
  const [templatesOpen, setTemplatesOpen] = useState(() => {
    try {
      return localStorage.getItem(TEMPLATES_KEY) === '1'
    } catch {
      return false
    }
  })
  const [refreshing, setRefreshing] = useState(false)
  /** 正在拖动侧栏宽度：拖动全程把手会整条加粗变亮（同 VS Code 拖分栏） */
  const [dragging, setDragging] = useState(false)
  // 边界 hover 高亮做「延迟」：鼠标刚移到边界先不高亮（否则想在边界旁拖滚动条时会立刻
  // 弹粗线干扰），要停留一小会儿才亮（VS Code 同款）。拖动开始则立即亮。
  const [resizeHover, setResizeHover] = useState(false)
  const resizeHoverTimer = useRef<number | null>(null)
  const clearResizeHoverTimer = () => {
    if (resizeHoverTimer.current !== null) {
      window.clearTimeout(resizeHoverTimer.current)
      resizeHoverTimer.current = null
    }
  }
  const armResizeHover = () => {
    clearResizeHoverTimer()
    resizeHoverTimer.current = window.setTimeout(() => setResizeHover(true), 180)
  }
  const disarmResizeHover = () => {
    clearResizeHoverTimer()
    setResizeHover(false)
  }

  // ---- 目录列表竖向悬浮滚动条（同 VS Code：原生隐藏、不占宽，鼠标移到列表上才浮现）----
  const vScrollRef = useRef<HTMLDivElement | null>(null)
  /** thumb 几何：y=距容器顶偏移、h=高度（px），overflow 表示内容是否溢出 */
  const [vBar, setVBar] = useState({ y: 0, h: 0, overflow: false })
  /** 正在拖 thumb：拖拽中即使鼠标移出列表，滚动条也保持显示（同 VS Code 的按住态） */
  const [vBarDragging, setVBarDragging] = useState(false)
  const updateVBar = useCallback(() => {
    const el = vScrollRef.current
    if (!el) return
    const sh = el.scrollHeight
    const ch = el.clientHeight
    const overflow = sh > ch
    if (!overflow) {
      setVBar((p) => (p.overflow ? { y: 0, h: 0, overflow: false } : p))
      return
    }
    const h = Math.max(30, (ch * ch) / sh)
    const maxScroll = sh - ch
    const y = (el.scrollTop / maxScroll) * (ch - h)
    setVBar((p) => (p.y === y && p.h === h && p.overflow ? p : { y, h, overflow: true }))
  }, [])
  useEffect(() => {
    updateVBar()
    const el = vScrollRef.current
    if (!el) return
    const ro = new ResizeObserver(updateVBar)
    ro.observe(el)
    el.addEventListener('scroll', updateVBar, { passive: true })
    return () => {
      ro.disconnect()
      el.removeEventListener('scroll', updateVBar)
    }
  }, [updateVBar])
  // 树内容增删会让 scrollHeight 变化但不触发上面的 ResizeObserver（容器本身没变大），
  // 所以每次提交后都重算一次（带守卫，值没变就不 set，避免多余渲染）。
  useLayoutEffect(() => {
    updateVBar()
  }, [updateVBar])

  // 竖向悬浮 thumb 可拖拽滚动（同 VS Code）：按住 thumb 上下拖，把 scrollTop 带过去。
  // thumb 位移 → scrollTop 的换算按「可滚动余量 / thumb 可走空间」的比值来。
  const vDragRef = useRef<{ startY: number; startTop: number } | null>(null)
  const startVBarDrag = (e: React.PointerEvent) => {
    const el = vScrollRef.current
    if (!el) return
    e.preventDefault()
    vDragRef.current = { startY: e.clientY, startTop: el.scrollTop }
    // 全屏透明覆盖层：拖动期间盖在最上层，避免鼠标移到别处触发 hover / 选中文本，
    // 让拖动稳定跟手。不加手型光标 —— 保持系统默认指针（同 VS Code）。松开移除。
    const overlay = document.createElement('div')
    overlay.style.cssText =
      'position:fixed;inset:0;z-index:2147483647;touch-action:none;user-select:none;'
    document.body.appendChild(overlay)
    setVBarDragging(true)
    const move = (ev: PointerEvent) => {
      const el2 = vScrollRef.current
      const st = vDragRef.current
      if (!el2 || !st) return
      const sh = el2.scrollHeight
      const ch = el2.clientHeight
      const ratio = (sh - ch) / Math.max(ch - vBar.h, 1)
      el2.scrollTop = st.startTop + (ev.clientY - st.startY) * ratio
    }
    const up = () => {
      setVBarDragging(false)
      overlay.remove()
      vDragRef.current = null
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  // 最近一次在侧边栏点击的条目（目录或文件）。重命名快捷键（F2 / Mac 回车）作用于它。
  const selectedEntryRef = useRef<Entry | null>(null)

  // 全局选中行 id（同 VS Code：同一时刻整条侧栏只有一行高亮）。
  // 文件 / 模板行的 id 就是它们的打开 key（local:… / builtin:…），目录 / 根是带前缀的
  // 合成 id（dir:… / root:…），三者互不撞名。目录点击不影响 activeKey，所以这里独立存一份。
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // 打开某个文件/模板（activeKey 变化）视为选中了那一行；目录选中不触发 activeKey，
  // 靠各行的 onClick 显式 set，这里不用管
  useEffect(() => {
    if (activeKey) setSelectedId(activeKey)
  }, [activeKey])

  // macOS 上「回车」进入重命名，其它平台回车另有他用，F2 全平台通用
  const isMac =
    typeof navigator !== 'undefined' &&
    (navigator.platform?.toLowerCase().includes('mac') ||
      navigator.userAgent.toLowerCase().includes('mac'))

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // 输入框聚焦时不响应：重命名框里回车=保存、Escape=取消
      const el = document.activeElement
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return
      const entry = selectedEntryRef.current
      if (!entry) return
      if (e.key === 'F2' || (e.key === 'Enter' && isMac)) {
        e.preventDefault()
        onRenameEntry(entry)
      }
    }
    // 用捕获阶段：点文件后焦点进了编辑器，编辑器的 keydown 可能在冒泡阶段 stopPropagation，
    // 冒泡阶段的 window 监听就收不到 F2 了。捕获阶段先于编辑器触发，最稳。
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [isMac, onRenameEntry])

  useEffect(() => {
    try {
      localStorage.setItem(WIDTH_KEY, String(width))
      localStorage.setItem(COLLAPSED_KEY, collapsed ? '1' : '0')
      localStorage.setItem(TEMPLATES_KEY, templatesOpen ? '1' : '0')
      localStorage.removeItem(LEGACY_TEMPLATES_KEY)
    } catch {
      // 记不住就记不住
    }
  }, [width, collapsed, templatesOpen])

  // 转圈至少持续 REFRESH_SPIN_MS，否则「点了刷新」这件事用户根本看不见。
  // 期间再点直接忽略，免得转圈被下一次点击打断又重来。
  async function handleRefresh() {
    if (refreshing) return
    setRefreshing(true)
    await Promise.all([
      workspace.refresh(workspace.target),
      new Promise((resolve) => setTimeout(resolve, REFRESH_SPIN_MS)),
    ])
    setRefreshing(false)
  }

  // 手写拖拽：pointer 事件挂在 window 上，指针移出把手甚至移出窗口也不会中断。
  // 起始宽度从 DOM 上量，省掉一个「把 state 镜像到 ref」的中间层。
  const startDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const panel = e.currentTarget.parentElement
    if (!panel) return
    e.preventDefault()
    const startX = e.clientX
    const startWidth = panel.getBoundingClientRect().width
    setDragging(true)
    clearResizeHoverTimer()
    setResizeHover(true)
    const onMove = (ev: PointerEvent) => {
      setWidth(clamp(startWidth + ev.clientX - startX, MIN_WIDTH, MAX_WIDTH))
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      document.body.style.removeProperty('cursor')
      document.body.style.removeProperty('user-select')
      setDragging(false)
      clearResizeHoverTimer()
      setResizeHover(false)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    // 拖动期间锁住光标和选区，否则鼠标划过编辑器会选中一大片文字
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  if (collapsed) {
    return (
      <div className="flex shrink-0 flex-col items-center border-r border-[var(--border)] bg-[var(--panel-bg)] px-1.5 py-2">
        <Button
          variant="ghost"
          size="icon-sm"
          title={t('sidebar.expand')}
          aria-label={t('sidebar.expand')}
          className="text-[var(--text-muted)]"
          onClick={() => setCollapsed(false)}
        >
          <Icon className="icon-[lucide--panel-left-open]" />
        </Button>
      </div>
    )
  }

  const groups = groupTemplates(templates, t)
  // 收起后 Demo 里的未保存改动就看不见了，在标题上留一个点顶上
  const templatesDirty = [...dirtyKeys].some((key) => key.startsWith('builtin:'))
  // 新建按钮的 title 要说清「建到哪」，否则用户看不出目标是哪个目录。
  // 多根之后路径里带的是内部 id，得先换成目录名。
  const targetLabel = workspace.displayPath(workspace.target)
  const anyLocked = workspace.roots.some((root) => root.needsPermission)

  return (
    <div
      style={{ width }}
      className="relative flex shrink-0 flex-col overflow-hidden bg-[var(--panel-bg)]"
    >
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-sm text-[var(--text-muted)]">{t('sidebar.title')}</span>
        <div className="flex items-center">
          {/* 「新建草稿」原来在顶部工具栏上。挪到这里是因为它和下面那些新建一样是
              「开一份新东西」，只是它不落在任何目录里；顶栏留给运行相关的东西。
              图标沿用顶栏那个 lucide file-plus，而不是下面那排的 codicon new-file ——
              后者的 title 是「在某个目录中新建文件」，两件事不能长成一个样 */}
          <Button
            variant="ghost"
            size="icon-sm"
            title={t('sidebar.newScratch')}
            aria-label={t('sidebar.newScratch')}
            className="text-[var(--text-muted)]"
            onClick={onNewScratch}
          >
            <Icon className="icon-[lucide--file-plus]" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            title={t('sidebar.collapse')}
            aria-label={t('sidebar.collapse')}
            className="text-[var(--text-muted)]"
            onClick={() => setCollapsed(true)}
          >
            <Icon className="icon-[lucide--panel-left-close]" />
          </Button>
        </div>
      </div>

      {/* 竖向悬浮滚动条：相对定位一个外层，内层才是真正滚动区（原生隐藏），
          overlay 贴右、悬停浮现、不占宽度 */}
      <div className="group relative min-h-0 flex-1">
        <div
          ref={vScrollRef}
          className="v-scrollbar h-full min-h-0 overflow-y-auto pb-3"
        >
        {/* ---- 本地目录 ---- */}
        {/* 分组标题吸顶（sticky），滚动时标题留在顶部、只有下面内容滚走（同 VS Code
            的分组区）。铺面板底色盖住滑过下方的条目，悬停浮现的竖向滚动条在它右侧 */}
        <div className="sticky top-0 z-10 flex items-center gap-0.5 border-b border-[var(--border)] bg-[var(--panel-bg)] px-2 pb-1 pt-1">
          <span className="mr-auto text-[11px] tracking-wide text-[var(--text-faint)]">
            {t('sidebar.localDirs')}
          </span>
          {workspace.supported && (
            <>
              {/* 这一排用的是 codicon —— VS Code 自己那套图标，「新建文件 / 新建文件夹」
                  就是它最有辨识度的两个。它是 16px 网格上的实心画法，和别处 lucide 的
                  24px 描边混在同一行会明显更粗，所以整排统一成 codicon，
                  并且显式给到 size-3.5：icon-xs 默认的 12px 会把角上那个小加号糊掉 */}
              {/* 新建 / 刷新都作用在「目标目录」上，所以一个目录都没开时它们没有意义 */}
              {workspace.hasRoot && (
                <>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    title={t('sidebar.newFileIn', { target: targetLabel })}
                    aria-label={t('sidebar.newFileIn', { target: targetLabel })}
                    className="text-[var(--text-muted)]"
                    onClick={() => draft.start('file')}
                  >
                    <Icon className="icon-[codicon--new-file] size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    title={t('sidebar.newDirIn', { target: targetLabel })}
                    aria-label={t('sidebar.newDirIn', { target: targetLabel })}
                    className="text-[var(--text-muted)]"
                    onClick={() => draft.start('directory')}
                  >
                    <Icon className="icon-[codicon--new-folder] size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    title={t('sidebar.refreshTarget', { target: targetLabel })}
                    aria-label={t('sidebar.refreshTarget', { target: targetLabel })}
                    className="text-[var(--text-muted)]"
                    onClick={() => void handleRefresh()}
                  >
                    <Icon
                      className={cn(
                        'icon-[codicon--refresh] size-3.5',
                        refreshing && 'animate-spin [animation-duration:500ms]'
                      )}
                    />
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="icon-xs"
                title={t('sidebar.openAnother')}
                aria-label={t('sidebar.openAnother')}
                className="text-[var(--text-muted)]"
                onClick={() => void workspace.pick()}
              >
                <Icon className="icon-[codicon--folder-opened] size-3.5" />
              </Button>
            </>
          )}
        </div>

        {!workspace.supported ? (
          <p className="px-2 pb-2 text-[12px] leading-relaxed text-[var(--text-faint)]">
            {/* 句子里要提顶栏那个按钮的名字，所以把标签当参数传进去 ——
                按钮改名时这段说明跟着变，不会脱节 */}
            {t('sidebar.unsupported', { label: t('header.import') })}
          </p>
        ) : workspace.roots.length === 0 ? (
          <div className="px-2 pb-2">
            <Button variant="secondary" size="sm" onClick={() => void workspace.pick()}>
              <Icon className="icon-[codicon--folder-opened]" />
              {t('sidebar.openFolder')}
            </Button>
          </div>
        ) : (
          <>
            {workspace.roots.map((root) => (
              <div key={root.id}>
                <RootRow
                  root={root}
                  workspace={workspace}
                  draft={draft}
                  onClose={onCloseRoot}
                  selected={selectedId === rootSelId(root.id)}
                  onSelect={() => setSelectedId(rootSelId(root.id))}
                />
                {!root.needsPermission && workspace.expanded.has(root.id) && (
                  <Tree
                    path={root.id}
                    depth={1}
                    workspace={workspace}
                    draft={draft}
                    activeKey={activeKey}
                    dirtyKeys={dirtyKeys}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    onOpenFile={onOpenLocalFile}
                    onRenameEntry={onRenameEntry}
                    onDeleteEntry={onDeleteEntry}
                    onCopyPath={onCopyPath}
                    onSelectEntry={(entry) => {
                      selectedEntryRef.current = entry
                    }}
                  />
                )}
              </div>
            ))}
            {/* 重新授权必须发生在用户手势里，所以只能由用户点那一行把目录带回来 */}
            {anyLocked && (
              <p className="px-2 pb-1 pt-0.5 text-[12px] leading-relaxed text-[var(--text-faint)]">
                {/* 同上：引用的是行尾那个角标的文字 */}
                {t('sidebar.reauthHint', { label: t('sidebar.needAuth') })}
              </p>
            )}
          </>
        )}

        {saveProgress && (
          <div className="mx-2 mb-2 mt-2 flex flex-col gap-1.5 rounded-md border border-[var(--border)] bg-[var(--panel-bg)] px-2 py-1.5">
            <div className="flex items-center gap-2">
              <span className="min-w-0 flex-1 truncate text-[12px] leading-snug text-[var(--text-faint)]">
                {saveProgress.file
                  ? t('sidebar.savingDemosFile', {
                      name: saveProgress.file.slice(saveProgress.file.lastIndexOf('/') + 1),
                      done: saveProgress.doneFiles,
                      total: saveProgress.totalFiles,
                    })
                  : t('sidebar.savingDemos', {
                      done: saveProgress.doneFiles,
                      total: saveProgress.totalFiles,
                    })}
              </span>
              <button
                type="button"
                onClick={onCancelSave}
                disabled={cancelling}
                title={cancelling ? t('sidebar.cancellingSave') : t('sidebar.cancelSave')}
                aria-label={cancelling ? t('sidebar.cancellingSave') : t('sidebar.cancelSave')}
                className="flex shrink-0 items-center gap-0.5 text-[var(--text-muted)] hover:text-[var(--text-body)] disabled:pointer-events-none disabled:opacity-60"
              >
                <Icon
                  className={`size-3.5 ${cancelling ? 'icon-[lucide--loader-circle] animate-spin' : 'icon-[lucide--x]'}`}
                />
                {cancelling && (
                  <span className="text-[11px] text-[var(--text-faint)]">{t('sidebar.cancellingSave')}</span>
                )}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <SmoothProgressBar
                value={
                  saveProgress.totalBytes > 0
                    ? (saveProgress.writtenBytes / saveProgress.totalBytes) * 100
                    : 0
                }
              />
            </div>
          </div>
        )}
        {workspace.busy && !saveProgress && (
          <p className="px-2 py-1 text-[12px] text-[var(--text-faint)]">{t('sidebar.loading')}</p>
        )}

        {workspace.error && (
          <div className="mx-2 mb-2 flex items-start gap-1 rounded-md border border-[var(--accent-error)]/40 bg-[var(--accent-error)]/10 px-2 py-1.5">
            <p className="min-w-0 flex-1 text-[12px] leading-relaxed text-[var(--accent-error)]">
              {workspace.error}
            </p>
            <button
              type="button"
              onClick={workspace.clearError}
              aria-label={t('notice.close')}
              className="shrink-0 text-[var(--accent-error)]"
            >
              <Icon className="icon-[lucide--x] size-3.5" />
            </button>
          </div>
        )}

        {/* ---- Demo 片段 ---- */}
        <div className="mt-3 flex items-center gap-0.5 pb-1 pr-2">
          <button
            type="button"
            onClick={() => setTemplatesOpen((open) => !open)}
            aria-expanded={templatesOpen}
            className="flex min-w-0 flex-1 items-center gap-1 px-2 text-left text-[11px] tracking-wide text-[var(--text-faint)] hover:text-[var(--text-body)]"
          >
            {/* 和 ICON_SLOT 同一个道理，只是这里的图标更小、颜色跟着标题走 */}
            <span className="flex shrink-0 items-center [&>[data-slot=icon]]:size-3">
              {templatesOpen ? (
                <Icon className="icon-[lucide--chevron-down]" />
              ) : (
                <Icon className="icon-[lucide--chevron-right]" />
              )}
            </span>
            {t('sidebar.demos')}
            {!templatesOpen && templatesDirty && (
              <span
                aria-label={t('sidebar.demosDirty')}
                className="ml-auto size-1.5 shrink-0 rounded-full bg-[var(--accent-symbol)]"
              />
            )}
          </button>
          {/* 这些 Demo 打开后改得动，但存不回去（它们是打包进来的字符串，不是磁盘上的文件）。
              存到本地文件夹之后就是普通的本地文件了，改完 Ctrl+S 直接写回 —— 所以这个
              按钮才是「真的要用它们」的入口，不支持目录 API 的浏览器上没有意义，直接不显示 */}
          {workspace.supported && (
            <Button
              variant="ghost"
              size="icon-xs"
              title={t('sidebar.saveDemos')}
              aria-label={t('sidebar.saveDemos')}
              className="text-[var(--text-muted)]"
              onClick={onSaveDemos}
              // 正在写入时禁用：重复触发会并发写、弹多个确认框、生成重复目录
              disabled={saveProgress !== null}
            >
              <Icon className="icon-[codicon--desktop-download] size-3.5" />
            </Button>
          )}
        </div>
        {templatesOpen &&
          groups.map(({ dir, items }) => (
            <div key={dir}>
              <div className="px-2 py-0.5 font-mono text-[12px] text-[var(--text-muted)]">{dir}</div>
              <ul>
                {items.map((item) => {
                  const key = `builtin:${item.path}`
                  return (
                    <li key={item.path}>
                      <Row
                        depth={1}
                        label={item.label}
                        selected={selectedId === key}
                        dirty={dirtyKeys.has(key)}
                        icon={<Icon className="icon-[lucide--file-code-2]" />}
                        onClick={() => {
                          onOpenTemplate(item.path)
                          setSelectedId(key)
                        }}
                      />
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
        {/* 竖向悬浮进度条：贴容器右缘、方形直角、不占宽度，悬停列表才浮现（同 VS Code）。
            浮现后可按住 thumb 上下拖拽滚动（同 VS Code）—— 平时整条 pointer-events-none 不挡
            行点击，列表 hover 时才把命中交给这一列的拖拽条 */}
        {vBar.overflow && (
          <div
            aria-hidden
            onPointerDown={startVBarDrag}
            className={cn(
              'absolute inset-y-0 right-0 w-[16px] touch-none',
              vBarDragging
                ? 'opacity-100'
                : 'pointer-events-none opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100'
            )}
          >
            <div
              className="pointer-events-none absolute right-0 w-[10px] bg-[var(--border-strong)]/60"
              style={{ top: vBar.y, height: vBar.h }}
            />
          </div>
        )}
      </div>

      {/* 当前目标目录的可读路径。浏览器拿不到真实绝对路径，只能展示应用内相对路径，
         但足以让用户知道它在哪个根目录下 */}
      {workspace.hasRoot && targetLabel && (
        <div className="flex items-center gap-1 border-t border-[var(--border)] px-2 py-1">
          <Icon className="icon-[lucide--folder] size-3 shrink-0 text-[var(--text-faint)]" />
          <span
            className="truncate text-[11px] text-[var(--text-faint)]"
            title={t('sidebar.currentPath', { path: targetLabel })}
          >
            {targetLabel}
          </span>
        </div>
      )}

      {/* 拖拽把手：命中区 6px 好抓。侧栏右缘那根边界发丝线就由这根亮线承担（容器不再画
          border-r），贴 right-0 = 真实边界。平时 w-px 发丝线；鼠标放上去（hover）加粗到
          4px 并亮主色；按住拖动保持 hover 亮度（不再更亮）。 */}
      <div
        role="separator"
        aria-orientation="vertical"
        onPointerDown={startDrag}
        onDoubleClick={() => setWidth(DEFAULT_WIDTH)}
        onMouseEnter={armResizeHover}
        onMouseLeave={disarmResizeHover}
        title={t('sidebar.resize')}
        className="absolute inset-y-0 right-0 z-10 w-[6px] cursor-col-resize"
      >
        <span
          className={cn(
            'absolute inset-y-0 right-0 transition-[width,background-color] duration-100',
            dragging || resizeHover
              ? 'w-[4px] bg-[var(--primary)]/70'
              : 'w-px bg-[var(--border)]'
          )}
        />
      </div>
    </div>
  )
}
