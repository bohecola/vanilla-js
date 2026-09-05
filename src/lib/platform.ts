/** 是否 macOS：决定快捷键的写法（⌘ 还是 Ctrl）和「回车改名」这类平台习惯。只在模块加载时判断一次。 */
export const isMac =
  typeof navigator !== 'undefined' &&
  /mac/i.test(
    (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ||
      navigator.platform ||
      navigator.userAgent
  )

/** 给按钮 title 用的快捷键写法 */
export const shortcut = {
  run: isMac ? '⌘↩' : 'Ctrl+Enter',
  stop: 'Shift+F5',
  save: isMac ? '⌘S' : 'Ctrl+S',
}

/** 当前文档是否从右往左（阿拉伯语）。分栏、标签栏、滚动条的左右方向都要跟着翻。 */
export const isRtl = () => document.documentElement.dir === 'rtl'
