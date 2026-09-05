/*
  拖拽会话的公共骨架：分栏把手、侧栏宽度、悬浮滚动条的 thumb 都是「按下 → 跟着指针动 → 松开」，
  区别只在 onMove 里怎么算。之前四处各写一份，而且都只监听 pointerup —— 触屏或浏览器接管手势
  （长按、系统手势、Alt-Tab 切走）时只会派发 pointercancel / blur，松开的清理就不会跑：
  全屏遮罩留在最上层，整页点不动；body 上的 cursor / user-select 也卡住。
  这里把所有结束路径收口到同一个 end()，谁先到谁清理，只清一次。
*/

export interface PointerDragOptions {
  onMove: (ev: PointerEvent) => void
  /** 任何结束路径（pointerup / pointercancel / 窗口失焦）都会调一次 */
  onEnd?: () => void
  /** 拖动期间 body 的光标，比如 'col-resize'；不传就保持系统默认 */
  cursor?: string
  /**
   * 是否盖一层全屏透明遮罩。拖 thumb 时要它：指针划过别的元素不会触发 hover / 选中文本。
   * 分栏那类把手不需要 —— 它们靠 user-select: none 就够了。
   */
  overlay?: boolean
}

export function startPointerDrag(options: PointerDragOptions): void {
  const { onMove, onEnd, cursor, overlay } = options
  const prevCursor = document.body.style.cursor
  const prevUserSelect = document.body.style.userSelect
  if (cursor) document.body.style.cursor = cursor
  document.body.style.userSelect = 'none'

  let shield: HTMLDivElement | null = null
  if (overlay) {
    shield = document.createElement('div')
    shield.style.cssText = 'position:fixed;inset:0;z-index:2147483647;touch-action:none;user-select:none;'
    document.body.appendChild(shield)
  }

  let ended = false
  const end = () => {
    if (ended) return
    ended = true
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', end)
    window.removeEventListener('pointercancel', end)
    window.removeEventListener('blur', end)
    shield?.remove()
    document.body.style.cursor = prevCursor
    document.body.style.userSelect = prevUserSelect
    onEnd?.()
  }
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', end)
  window.addEventListener('pointercancel', end)
  // 拖到一半切去别的窗口：pointerup 永远不会来，靠 blur 收尾
  window.addEventListener('blur', end)
}
