import { Icon } from '@/components/ui/icon'
import { useI18n } from '@/i18n/context'
import type { Notice, NoticeTone } from '@/types'

const NOTICE_STYLE: Record<NoticeTone, string> = {
  info: 'border-[var(--border)] bg-[var(--panel-bg)] text-[var(--text-body)]',
  warn: 'border-[var(--accent-symbol)]/40 bg-[var(--accent-symbol)]/10 text-[var(--accent-symbol)]',
  error: 'border-[var(--accent-error)]/40 bg-[var(--accent-error)]/10 text-[var(--accent-error)]',
}


/** 顶栏下面那条通用提示位：保存结果、外部改动、权限被拒、非文本文件都走这里 */
export function NoticeBar({ notice, onClose }: { notice: Notice | null; onClose: () => void }) {
  const { t } = useI18n()
  if (!notice) return null
  return (
    <div
      // 读屏：info 是「已保存」这类顺带一提的反馈，polite；warn / error 要立刻播报
      role={notice.tone === 'info' ? 'status' : 'alert'}
      aria-live={notice.tone === 'info' ? 'polite' : 'assertive'}
      className={`flex items-start gap-2 border-b px-4 py-2 text-[13px] ${NOTICE_STYLE[notice.tone]}`}
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
