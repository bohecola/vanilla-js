/*
  Jotter 自己的标记：一页折角的草稿纸，上面两行字，旁边一条停着的光标。

  之前这里是一个纯色圆点（bg-[var(--accent-logo)] 的 12px span），favicon 也是同一个圆点，
  两个都不说明这是什么工具。现在换成有含义的形状：折角 = 草稿页，光标 = 「就在这儿写」。

  三个细节：
  - 「文字」和「光标」是挖空的（fillRule="evenodd"，三个内圈子路径就是三个洞），
    不是填成深色。洞里透出的是背后那层的颜色（顶栏是 --panel-bg，标签栏是浏览器自己的底色），
    所以深浅两套主题、以及任何颜色的标签栏，都只用这一份图形。
  - 渐变两端取的就是原来主题里那两支 logo 色：深色主题那支 sky-400、浅色主题那支 sky-600
    （标记在两套主题下应当是同一个东西，所以不跟着主题变，但两支色都在自家调色板里）。
  - 几何数据与 public/favicon.svg 完全相同，改一处要改两处 —— favicon 必须是静态文件，
    没法与这里共用同一份源码。

  与 GithubMark 一样是真 svg（不是图标插件那种 mask <span>），所以 shadcn 组件里的
  [&_svg] 规则对它有效。
*/
export function JotterMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <linearGradient id="jotter-mark" x1="8" y1="3" x2="24" y2="29" gradientUnits="userSpaceOnUse">
        {/* 渐变两端跟随配色（data-accent）：一支亮、一支深的同色系，见 index.css 的
            --logo-hi / --logo-lo。与 favicon.svg 那支静态蓝色不再强绑定。 */}
        <stop stopColor="var(--logo-hi)" />
        <stop offset="1" stopColor="var(--logo-lo)" />
      </linearGradient>
      <path
        fill="url(#jotter-mark)"
        fillRule="evenodd"
        d="M8 3h11l8 8v15a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Z
           M10.7 15.6h4.6a1.7 1.7 0 0 1 0 3.4h-4.6a1.7 1.7 0 0 1 0-3.4Z
           M10.7 20.8h1.8a1.7 1.7 0 0 1 0 3.4h-1.8a1.7 1.7 0 0 1 0-3.4Z
           M21.3 14.2a1.7 1.7 0 0 1 1.7 1.7v7.6a1.7 1.7 0 0 1-3.4 0v-7.6a1.7 1.7 0 0 1 1.7-1.7Z"
      />
    </svg>
  )
}
