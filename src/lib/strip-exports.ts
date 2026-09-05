// 剥离顶层的 export 语法。
//
// 用户代码（模板、导入的文件、TS 编译出的 JS）最终都由 worker 里的 eval 执行，
// 而 eval 是「脚本」上下文，出现 export 语句会直接抛 SyntaxError，所以运行前先去掉。
//
// 按行首匹配（缩进 + export 关键字），不会误伤普通字符串里的 "export "；
// 代价是模板字符串里独占一行、以 export 开头的文本也会被改写 —— playground 场景可接受。
export function stripExports(code: string): string {
  return (
    code
      // export { a, b as c } / export { x } from './m'  → 整段删掉（列表可能跨行）
      .replace(
        /^[ \t]*export[ \t]*\{[\s\S]*?\}[ \t]*(?:from[ \t]*(['"])[^'"]*\1)?[ \t]*;?[ \t]*$/gm,
        ''
      )
      // export * from './m' / export * as ns from './m'  → 整行删掉
      .replace(/^[ \t]*export[ \t]+\*[^\n]*$/gm, '')
      // export default 具名函数/类声明 → 只去关键字，保留 foo / Foo 这个绑定
      .replace(
        /^([ \t]*)export[ \t]+default[ \t]+(?=(?:async[ \t]+)?function[ \t*]*[$\w]|class[ \t]+[$\w])/gm,
        '$1'
      )
      // 其余 export default（表达式、匿名函数/类）→ 赋值给变量，
      // 否则剥完关键字会剩下 `default xxx` 这种语法错
      .replace(/^([ \t]*)export[ \t]+default\b[ \t]*/gm, '$1const __default = ')
      // export const/let/var/function/class/enum/…  → 去掉 export 关键字
      .replace(/^([ \t]*)export[ \t]+/gm, '$1')
  )
}
