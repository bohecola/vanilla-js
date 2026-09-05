import { useEffect, type Dispatch, type RefObject, type SetStateAction } from 'react'
import type { EditorHandle } from '@/components/Editor'
import { getLastModified, readTextFile } from '@/lib/fs-access'
import type { T } from '@/i18n/context'
import type { ActiveFile, LocalMeta, Notice } from '@/types'

interface Options {
  activeRef: RefObject<ActiveFile | null>
  dirtyRef: RefObject<Set<string>>
  localMetaRef: RefObject<Map<string, LocalMeta>>
  editorRef: RefObject<EditorHandle | null>
  setTabs: Dispatch<SetStateAction<ActiveFile[]>>
  setNotice: (notice: Notice) => void
  t: T
}

/** 窗口重新获得焦点时，检查当前本地文件是否被别的程序改过：干净就静默重载，脏了就只提示。 */
export function useExternalChangeWatcher({
  activeRef,
  dirtyRef,
  localMetaRef,
  editorRef,
  setTabs,
  setNotice,
  t,
}: Options) {
  /*
    回到页面时对一下 mtime。没有文件监听 API，这是唯一能发现「文件被别的编辑器改过」
    的时机，也正好是用户从别处切回来的那一刻。
    干净就静默重载，脏了就只提示 —— 直接覆盖用户没保存的改动是最不该做的事。
  */
  useEffect(() => {
    const onFocus = async () => {
      const file = activeRef.current
      if (file?.kind !== 'local' || !file.handle) return
      const meta = localMetaRef.current.get(file.key)
      if (!meta) return
      // 两次 await 之间用户可能切了文件、或刚敲了几个字：回来后都要重新核对，
      // 否则会把别的文件、或用户刚写的内容覆盖掉
      const stillCurrent = () => activeRef.current?.key === file.key
      try {
        if ((await getLastModified(file.handle)) === meta.lastModified) return
        if (!stillCurrent()) return
        if (dirtyRef.current.has(file.key)) {
          setNotice({
            tone: 'warn',
            text: t('notice.externalChanged', { name: file.name }),
          })
          return
        }
        const { text, lastModified, encoding } = await readTextFile(file.handle)
        if (!stillCurrent() || dirtyRef.current.has(file.key)) return
        editorRef.current?.replace(file.key, text)
        localMetaRef.current.set(file.key, { handle: file.handle, lastModified, encoding })
        // 正在看的这个文件编码也可能被外部改过，顺手刷新对应标签 / 状态栏的编码
        setTabs((prev) => prev.map((x) => (x.key === file.key ? { ...x, encoding } : x)))
        setNotice({ tone: 'info', text: t('notice.reloaded', { name: file.name }) })
      } catch {
        // 文件被删/被移走，等用户自己刷新目录，不用弹提示打扰
      }
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [activeRef, dirtyRef, localMetaRef, editorRef, setTabs, setNotice, t])
}
