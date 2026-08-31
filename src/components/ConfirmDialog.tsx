import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n/context'
import type { Confirm } from '@/hooks/useConfirm'

/*
  useConfirm 的渲染端。自己不持有任何状态，内容全部来自 confirm.request。

  用 AlertDialog 而不是 Dialog：它默认把焦点放在「取消」上、Esc 能退、点遮罩不关，
  正好是「不可逆操作」该有的行为 —— 一回车就把文件删了不行。
*/
export default function ConfirmDialog({ confirm }: { confirm: Confirm }) {
  const { t } = useI18n()
  const request = confirm.request
  return (
    <AlertDialog
      open={request !== null}
      onOpenChange={(open) => {
        if (!open) confirm.settle(false)
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{request?.title}</AlertDialogTitle>
          {/* asChild + div：正文是多行，<p> 里套 <p> 是非法嵌套，浏览器会把它拆开 */}
          <AlertDialogDescription asChild>
            <div className="space-y-1.5 leading-relaxed">
              {request?.lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => confirm.settle(false)}>
            {t('confirm.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            className={cn(
              request?.tone === 'danger' &&
                'bg-destructive text-white hover:bg-destructive/90 dark:bg-destructive/70'
            )}
            onClick={() => confirm.settle(true)}
          >
            {request?.confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
