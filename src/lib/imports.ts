/*
  检测顶层 import 语句。

  为什么需要它：runner 是一个不带模块解析的 Web Worker，用户代码最终走 eval
  （脚本上下文）。export 可以靠 strip-exports 剥掉，import 剥不掉 —— 它要真的去
  取另一个文件。所以带 import 的代码在这里跑不了，eval 只会抛一句
  「Cannot use import statement outside a module」，用户根本看不出问题在哪。
  预先检出来，换成一句说清原因的提示。

  匹配策略和 strip-exports 一致：按行首锚定，接受「模板字符串里独占一行、
  以 import 开头的文本会被误判」这个代价 —— playground 场景下无所谓，
  而且误判只是多一句提示，不会改动代码。

  刻意只查静态 import：动态 import() 在 worker 里语法上是合法的，
  相对路径会以 worker 自己的 URL 为基准去请求，失败时浏览器给的网络错误
  本身就比较直白，不需要额外翻译。
*/

import { compact, uniq } from 'lodash-es'

import type { Problem } from './app-error'

// import 'mod'  —— 只求副作用，没有绑定
const SIDE_EFFECT_IMPORT = /^[ \t]*import[ \t]+(['"])([^'"]+)\1[ \t]*;?[ \t]*$/gm

// import x / * as ns / { a, b } from 'mod'  —— 绑定列表可能跨多行
const BINDING_IMPORT = /^[ \t]*import[ \t]+([\s\S]*?)[ \t\n]+from[ \t]*(['"])([^'"]+)\2/gm

/**
 * 返回代码里所有静态 import 的模块名（去重，保持出现顺序）。
 * 纯类型导入（import type ...）不算：esbuild 编译 TS 时会把它们整段擦掉。
 */
export function findStaticImports(code: string): string[] {
  const specs: string[] = []

  for (const m of code.matchAll(SIDE_EFFECT_IMPORT)) {
    specs.push(m[2])
  }

  for (const m of code.matchAll(BINDING_IMPORT)) {
    const clause = m[1].trim()
    // import type { Foo } from './x' —— 类型导入，编译后不留痕迹
    if (/^type\b/.test(clause)) continue
    // import { type A, type B } from './x' —— 全部是内联类型标记，同样会被擦掉。
    // 只要有一个不带 type 的绑定就算真导入，宁可多报不可漏报的反面：
    // 漏报只是退回到原本那句难懂的 SyntaxError，误报则会拦下本来能跑的代码。
    if (clause.startsWith('{') && clause.endsWith('}')) {
      const names = compact(clause.slice(1, -1).split(',').map((s) => s.trim()))
      if (names.length > 0 && names.every((n) => /^type\b/.test(n))) continue
    }
    specs.push(m[3])
  }

  // uniq 保留首次出现的顺序，正好是这里要的语义
  return uniq(specs)
}

/**
 * 「代码里有 import，跑不了」这条提示的描述符。
 *
 * 引号、顿号这些拼接细节都在字典里 —— 中文用「“…”、」，英文用 `"…", `，
 * 它们是随语言变的标点，不该硬写在这儿。
 */
export function unresolvedImportProblem(specs: string[]): Problem {
  return { key: 'err.imports.unresolved', params: { specs } }
}
