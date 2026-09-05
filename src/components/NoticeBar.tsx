import { Icon } from '@/components/ui/icon'
import { useI18n } from '@/i18n/context'
import type { Notice, NoticeTone } from '@/types'

const NOTICE_STYLE: Record<NoticeTone, string> = {
  info: '',
  warn: 'border-[var(--accent-symbol)]/40 bg-[var(--panel-bg)] text-[var(--accent-symbol)]',
  error: 'border-[var(--accent-error)]/40 bg-[var(--panel-bg)] text-[var(--accent-error)]',
}


/**
 * warn / error 的通知：右下角浮层（同 VS Code 的通知），不占布局，出现 / 消失不会推动编辑器。
 * info 类一次性反馈（已保存、已重命名…）不走这里，由状态栏短暂显示，见 StatusBar 的 message。
 */
export function NoticeBar({ notice, onClose }: { notice: Notice | null; onClose: () => void }) {
  const { t } = useI18n()
  if (!notice || notice.tone === 'info') return null
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`fixed end-4 bottom-9 z-40 flex w-[min(24rem,calc(100vw-2rem))] items-start gap-2 rounded-md border px-3 py-2 text-[13px] shadow-lg ${NOTICE_STYLE[notice.tone]}`}
    >
      <span className="min-w-0 flex-1">{notice.text}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label={t('notice.close')}
        className="shrink-0 opacity-70 hover:opacity-100"
      >
        <Icon className="icon-[lucide--x] size-4" />
      </button>
    </div>
  )
}
