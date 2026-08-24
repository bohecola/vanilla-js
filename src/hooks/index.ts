// 加载模板源码。部分模板（如 utils/index.js）用了 ES module 的 export，
// 注入 iframe 运行前需要剥离 export 关键字。
const modules = import.meta.glob(
  ['../template/**/*.js', '!**/data/index.js'],
  { query: '?raw', import: 'default' }
) as Record<string, () => Promise<string>>

// 剥离顶层 `export ` 关键字（不误伤字符串字面量里的 "export "）。
// 简单起见按行处理：匹配行首缩进 + export 关键字。
function stripExports(code: string): string {
  return code
    .split('\n')
    .map((line) => line.replace(/^(\s*)export\s+/, '$1'))
    .join('\n')
}

export async function loadTemplate(path: string): Promise<string> {
  const loader = modules[path]
  if (!loader) throw new Error(`Template not found: ${path}`)
  return stripExports(await loader())
}

// 返回所有模板的路径（用于下拉框选项）
export function listTemplates(): string[] {
  return Object.keys(modules)
}
