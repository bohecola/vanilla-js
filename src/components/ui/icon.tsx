import { cn } from '@/lib/utils'

/**
 * 一个图标 = 一个带 mask 的 <span>。
 *
 * 图标由 @iconify/tailwind4 以工具类的形式给出（`icon-[lucide--play]`，见 style/index.css），
 * 插件把 SVG 内联成 mask-image、颜色走 currentColor。所以这个组件本身不认识任何图标名字：
 * 类名必须在调用点逐字写出来，Tailwind 才扫得到 —— 拼字符串的 `icon-[lucide--${name}]`
 * 一个都生成不出来。
 *
 * 刻意不带默认尺寸，保持和原来 lucide 那些 <svg> 一样的行为：
 * 尺寸由外面的容器决定（shadcn 的按钮、菜单都有 `:not([class*='size-'])` 那套规则），
 * 谁都没管的时候退回插件的 1em，跟着字号走。
 *
 * data-slot="icon" 是给那些规则用的钩子：它们原来选 `svg`，而图标现在不是 svg 了。
 */
function Icon({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      aria-hidden
      data-slot="icon"
      // pointer-events-none：图标是纯装饰，点击事件要落在外面那个按钮上
      className={cn('pointer-events-none inline-block shrink-0', className)}
      {...props}
    />
  )
}

export { Icon }
