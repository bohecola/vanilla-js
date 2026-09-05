/*
  找出代码里的模块 specifier（import / export … from / 动态 import('…') 引号里的那串）。

  两个用途：
  - runner 判断入口要不要按 ES 模块跑（hasModuleSyntax）；
  - module-graph 解析依赖，并把 specifier 改写成依赖模块的 Blob URL（rewriteSpecifiers）。

  匹配策略：静态 import / export 按行首锚定，接受「模板字符串里独占一行、以 import 开头的
  文本会被误判」这个代价 —— playground 场景下无所谓。动态 import('…') 不锚定行首，
  只认字符串字面量参数；注释里的 import('x') 会被误认，代价同上。

  纯类型导入（import type ... / import { type A, type B }）不算：TS 编译时会把它们整段擦掉，
  这里也跟着忽略，免得去解析一个运行时根本不需要的文件。
*/

import { compact } from 'lodash-es'

export type SpecifierKind = 'import' | 'export' | 'dynamic'

export interface ModuleSpecifier {
  spec: string
  /** specifier 字符串（不含引号）在源码里的起止偏移，供改写用 */
  start: number
  end: number
  kind: SpecifierKind
}

// import 'mod'  —— 只求副作用，没有绑定
const SIDE_EFFECT_IMPORT = /^[ \t]*import[ \t]+(['"])([^'"]+)\1[ \t]*;?[ \t]*$/gmd

// import x / * as ns / { a, b } from 'mod'  —— 绑定列表可能跨多行
const BINDING_IMPORT = /^[ \t]*import[ \t]+([\s\S]*?)[ \t\n]+from[ \t]*(['"])([^'"]+)\2/gmd

// export * from 'mod' / export * as ns from 'mod' / export { a, b as c } from 'mod'
const EXPORT_FROM = /^[ \t]*export[ \t]+(?:\*(?:[ \t]+as[ \t]+[$\w]+)?|\{[\s\S]*?\})[ \t]*from[ \t]*(['"])([^'"]+)\1/gmd

// import('mod')  —— 只认字符串字面量
const DYNAMIC_IMPORT = /\bimport[ \t]*\([ \t]*(['"])([^'"]+)\1[ \t]*\)/gd

function isTypeOnlyClause(clause: string): boolean {
  const c = clause.trim()
  // import type { Foo } from './x'
  if (/^type\b/.test(c)) return true
  // import { type A, type B } from './x' —— 全部是内联类型标记。只要有一个不带 type 就算真导入
  if (c.startsWith('{') && c.endsWith('}')) {
    const names = compact(c.slice(1, -1).split(',').map((s) => s.trim()))
    return names.length > 0 && names.every((n) => /^type\b/.test(n))
  }
  return false
}

/** 按出现位置排序的全部 specifier（同一个模块被导入多次会出现多次，改写时需要每一处） */
export function findModuleSpecifiers(code: string): ModuleSpecifier[] {
  const out: ModuleSpecifier[] = []
  const push = (m: RegExpMatchArray, group: number, kind: SpecifierKind) => {
    const range = m.indices?.[group]
    if (!range) return
    out.push({ spec: m[group], start: range[0], end: range[1], kind })
  }

  for (const m of code.matchAll(SIDE_EFFECT_IMPORT)) push(m, 2, 'import')
  for (const m of code.matchAll(BINDING_IMPORT)) {
    if (isTypeOnlyClause(m[1])) continue
    push(m, 3, 'import')
  }
  for (const m of code.matchAll(EXPORT_FROM)) push(m, 2, 'export')
  for (const m of code.matchAll(DYNAMIC_IMPORT)) push(m, 2, 'dynamic')

  return out.sort((a, b) => a.start - b.start)
}

/** 入口要不要按 ES 模块执行：有任何一处需要解析的 specifier 就要 */
export function hasModuleSyntax(code: string): boolean {
  return findModuleSpecifiers(code).length > 0
}

/**
 * 把每个 specifier 换成 map(spec) 的结果。从后往前替换，前面的偏移不受影响；
 * 只动引号里的内容，行号不变（调用栈才对得上编辑器）。
 */
export function rewriteSpecifiers(code: string, map: (spec: string) => string): string {
  const specs = findModuleSpecifiers(code)
  let out = code
  for (let i = specs.length - 1; i >= 0; i--) {
    const s = specs[i]
    out = out.slice(0, s.start) + map(s.spec) + out.slice(s.end)
  }
  return out
}
