import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { GithubMark } from './GithubMark'
import { JotterMark } from './JotterMark'
import { useI18n, LANGS, type LangMode } from '@/i18n/context'
import { useTheme, type Accent, type ThemeMode, ACCENTS } from '@/theme/index'

// 配色下拉里每个选项的「线稿小图标 + 它的颜色」：像儿童绘本里克制的一枚枚小画，干净又俏皮。
// icon 存完整类名字面量（icon-[lucide--…]），Tailwind 需要源码里逐字出现才扫得到。
// 标签文案走 i18n（header.accent.*）。
type AccentLabelKey =
  | 'header.accent.blue'
  | 'header.accent.pink'
  | 'header.accent.orange'
  | 'header.accent.green'

const ACCENT_META: Record<Accent, { icon: string; color: string; labelKey: AccentLabelKey }> = {
  blue: { icon: 'icon-[lucide--droplet]', color: '#0ea5e9', labelKey: 'header.accent.blue' },
  pink: { icon: 'icon-[lucide--flower]', color: '#ec4899', labelKey: 'header.accent.pink' },
  orange: { icon: 'icon-[lucide--sun]', color: '#f97316', labelKey: 'header.accent.orange' },
  green: { icon: 'icon-[lucide--leaf]', color: '#22c55e', labelKey: 'header.accent.green' },
}


interface HeaderBarProps {
  /** 不支持目录 API 的浏览器上才显示「导入」按钮 */
  showImport: boolean
  onImport: () => void
}

/** 顶栏：品牌、（可选的）导入、语言 / 配色 / 主题下拉、GitHub 链接。全部状态来自 Context。 */
export function HeaderBar({ showImport, onImport }: HeaderBarProps) {
  const { mode, setMode, accent, setAccent } = useTheme()
  const { mode: langMode, setMode: setLangMode, t } = useI18n()
  return (
    <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-[var(--border)] bg-[var(--panel-bg)] px-4 py-3">
      <div className="flex items-center gap-2 text-base font-semibold">
        <JotterMark className="size-5" />
        Jotter
      </div>

      {/* 「新建」挪到文件栏的标题行上去了：它和那边的「新建文件 / 新建文件夹」是一类事，
          顶栏留给运行相关的东西。
          「导入」只在不支持目录 API 的浏览器上留着 —— 那里没有「打开文件夹」，
          这个隐藏的 <input type=file> 是唯一能读到本地文件的路（侧栏那段提示也指着它）。
          Chromium 上它是纯冗余：导进来的文件存不回原处，只能下载。 */}
      {showImport && (
        <>
          <div aria-hidden className="h-5 w-px shrink-0 bg-[var(--border)]" />
          <Button variant="ghost" size="sm" onClick={onImport}>
            <Icon className="icon-[lucide--upload]" />
            {t('header.import')}
          </Button>
        </>
      )}

      <div className="ml-auto flex items-center gap-2">
        {/* 语言显示移到底部状态栏（见页面底部），右上角不再放语言徽标 */}

        {/* 语言。形状与右边的主题下拉完全同构（多态 + 跟随系统）。
            触发器固定用 languages 图标，不随当前值变 —— 没有哪两个图标能自明地
            代表「语言」这种概念，图标一直换反而看不出按钮是干什么的。
            各语言项的名字刻意不翻译（用各自母语写）：看不懂当前界面语言的人，
            正需要用目标语言认出自己那一项。 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              title={t('header.lang')}
              aria-label={t('header.lang')}
              className="text-[var(--text-muted)]"
            >
              <Icon className="icon-[lucide--languages]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
            <DropdownMenuRadioGroup
              value={langMode}
              onValueChange={(value) => setLangMode(value as LangMode)}
            >
              {LANGS.map(({ value, label }) => (
                <DropdownMenuRadioItem key={value} value={value}>
                  <span className="font-medium">{label}</span>
                </DropdownMenuRadioItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuRadioItem value="system">
                <Icon className="icon-[lucide--monitor]" />
                {t('header.lang.system')}
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 配色：蓝 / 粉 / 橙 / 绿，配上面那个明暗一起用（蓝黑 / 粉白……）。
            trigger 图标用当前配色的高亮主色来画，一眼看出现在是哪档色 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              title={t('header.accent')}
              aria-label={t('header.accent')}
              className="text-[var(--text-muted)]"
            >
              <Icon className="icon-[lucide--palette]" style={{ color: 'var(--accent-number)' }} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[8.5rem]">
            <DropdownMenuRadioGroup
              value={accent}
              onValueChange={(value) => setAccent(value as Accent)}
            >
              {/* 竖排列表：每行一枚代表该配色的线稿小图标 + 名字，像儿童绘本里克制的一排小画。
                  当前配色不铺整行底色（那样会和相邻行的 hover 底贴在一起），改用在当前色里
                  着色的名字 + 右端亮起的对勾来表达选中 —— 干净，且和悬停互不粘连 */}
              {ACCENTS.map((a) => {
                const meta = ACCENT_META[a]
                const selected = a === accent
                return (
                  <DropdownMenuRadioItem
                    key={a}
                    value={a}
                    title={t(meta.labelKey)}
                    className="gap-2.5 pr-3"
                  >
                    <Icon
                      className={cn('size-4', meta.icon)}
                      style={{ color: meta.color }}
                    />
                    <span
                      className="min-w-0 flex-1"
                      style={selected ? { color: meta.color } : undefined}
                    >
                      {t(meta.labelKey)}
                    </span>
                  </DropdownMenuRadioItem>
                )
              })}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              title={t('header.theme')}
              aria-label={t('header.theme')}
              className="text-[var(--text-muted)]"
            >
              {mode === 'light' ? (
                <Icon className="icon-[lucide--sun]" />
              ) : mode === 'dark' ? (
                <Icon className="icon-[lucide--moon]" />
              ) : (
                <Icon className="icon-[lucide--monitor]" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup
              value={mode}
              onValueChange={(value) => setMode(value as ThemeMode)}
            >
              <DropdownMenuRadioItem value="dark">
                <Icon className="icon-[lucide--moon]" />
                {t('header.theme.dark')}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="light">
                <Icon className="icon-[lucide--sun]" />
                {t('header.theme.light')}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="system">
                <Icon className="icon-[lucide--monitor]" />
                {t('header.theme.system')}
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          asChild
          variant="ghost"
          size="icon-sm"
          className="text-[var(--text-muted)]"
          title={t('header.github')}
        >
          <a
            href="https://github.com/bohecola/jotter"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('header.github')}
          >
            <GithubMark className="size-[18px]" />
          </a>
        </Button>
      </div>
    </header>
  )
}
