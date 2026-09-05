// 文件类型：后缀 → 语言、能不能在 runner 里跑。纯函数，不碰文件系统 API。

/** 后缀 → Monaco 语言 id。不在表里的按「非文本」处理，点击时给提示而不是硬塞进编辑器。 */
const LANGUAGE_BY_EXT: Record<string, string> = {
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  mts: 'typescript',
  cts: 'typescript',
  tsx: 'typescript',
  json: 'json',
  jsonc: 'json',
  html: 'html',
  htm: 'html',
  css: 'css',
  scss: 'scss',
  less: 'less',
  md: 'markdown',
  markdown: 'markdown',
  yml: 'yaml',
  yaml: 'yaml',
  xml: 'xml',
  svg: 'xml',
  sh: 'shell',
  bash: 'shell',
  sql: 'sql',
  txt: 'plaintext',
  log: 'plaintext',
  env: 'plaintext',
  gitignore: 'plaintext',
  editorconfig: 'plaintext',
  npmrc: 'plaintext',
}

/** 能交给 runner 执行的语言（runner 是没有 DOM 的 Web Worker，只跑 JS/TS）。 */
export function isRunnable(language: string): boolean {
  return language === 'javascript' || language === 'typescript'
}

export function extOf(name: string): string {
  const dot = name.lastIndexOf('.')
  // 「.gitignore」这类以点开头、没有真正后缀的文件，整个名字当后缀看
  if (dot <= 0) return name.replace(/^\./, '').toLowerCase()
  return name.slice(dot + 1).toLowerCase()
}

/** 推断 Monaco 语言 id；无法识别时返回 null（视为非文本文件）。 */
export function languageOf(name: string): string | null {
  return LANGUAGE_BY_EXT[extOf(name)] ?? null
}

