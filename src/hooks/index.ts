// 加载模板源码。部分模板（如 utils/index.js）用了 ES module 的 export，
// 在 eval 的脚本上下文里运行前需要剥离 export 关键字。
import { stripExports } from '../lib/strip-exports'

const modules = import.meta.glob(
  ['../template/**/*.js', '!**/data/index.js'],
  { query: '?raw', import: 'default' }
) as Record<string, () => Promise<string>>

export async function loadTemplate(path: string): Promise<string> {
  const loader = modules[path]
  if (!loader) throw new Error(`Template not found: ${path}`)
  return stripExports(await loader())
}

// 返回所有模板的路径（用于下拉框选项）
export function listTemplates(): string[] {
  return Object.keys(modules)
}
