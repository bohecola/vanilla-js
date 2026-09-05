/*
  跨文件 import 的支持：把入口和它递归导入的文件组成一张模块图，每个模块编译成 ESM，
  specifier 改写成依赖模块的 Blob URL，最后交给 worker 用真正的 import() 执行。
  设计与取舍见 docs/module-imports-plan.md。

  路径约定同 workspace：`<rootId>/<相对根目录的路径>`，编辑器里对应的 model key 是 `local:<path>`。
  这里不碰 React / workspace，需要的能力由 App 打包成 ModuleHost 传进来。
*/

import { uniq } from 'lodash-es'

import { AppError } from './app-error'
import { compileModule } from './compile'
import { extOf } from './file-types'
import { findModuleSpecifiers, rewriteSpecifiers } from './imports'

export interface ModuleSource {
  code: string
  language: string
}

export interface ModuleHost {
  /** 入口文件的 workspace 路径，用于解析相对 import */
  entryPath: string
  /** 读一个 workspace 路径的源码；文件不存在返回 null。先查编辑器缓冲区，再读盘 */
  readSource(path: string): Promise<ModuleSource | null>
  /** 路径是否存在（文件）。给「省略后缀」的候选探测用，比 readSource 便宜 */
  exists(path: string): Promise<boolean>
  /** 显示名（去掉 rootId），进报错文案和调用栈 */
  displayName(path: string): string
}

export interface ModuleGraphResult {
  entryUrl: string
  /** 这次运行创建的全部 Blob URL，运行结束或停止时要 revoke */
  urls: string[]
  /** Blob URL → 显示名，worker 用它把调用栈里的 blob: 换回文件名 */
  names: Record<string, string>
}

/** 模块数上限：防止误导入 node_modules 之类的目录把浏览器撑爆 */
export const MAX_MODULES = 200

const RUNNABLE_EXT = new Set(['js', 'mjs', 'ts', 'mts'])

function languageOfPath(path: string): string {
  const ext = extOf(path.slice(path.lastIndexOf('/') + 1))
  return ext === 'ts' || ext === 'mts' ? 'typescript' : 'javascript'
}

function isRelative(spec: string): boolean {
  return spec.startsWith('./') || spec.startsWith('../')
}

/**
 * 以 fromPath 所在目录为基准拼接 spec，做 `.` / `..` 规范化。
 * 返回 null 表示越出了根目录（把 rootId 那一段都 pop 掉了）。
 */
function joinPath(fromPath: string, spec: string): string | null {
  const base = fromPath.split('/').slice(0, -1) // 去掉文件名
  const rootId = base[0]
  const out = [...base]
  for (const seg of spec.split('/')) {
    if (seg === '' || seg === '.') continue
    if (seg === '..') {
      out.pop()
      // rootId 是第一段，pop 到它没了就是越界
      if (out.length === 0) return null
      continue
    }
    out.push(seg)
  }
  if (out[0] !== rootId || out.length < 2) return null
  return out.join('/')
}

/** 省略后缀 / 写了 .js 实为 .ts 的候选，按探测顺序 */
function candidates(path: string): string[] {
  const name = path.slice(path.lastIndexOf('/') + 1)
  const ext = extOf(name)
  const list = [path]
  if (!name.includes('.') || !RUNNABLE_EXT.has(ext)) {
    // 没有后缀（或后缀不像可运行文件，比如 ./utils.v2）：补后缀、找目录 index
    list.push(`${path}.ts`, `${path}.js`, `${path}.mts`, `${path}.mjs`, `${path}/index.ts`, `${path}/index.js`)
  }
  if (ext === 'js') list.push(path.slice(0, -3) + '.ts')
  if (ext === 'mjs') list.push(path.slice(0, -4) + '.mts')
  return uniq(list)
}

async function resolveSpecifier(fromPath: string, spec: string, host: ModuleHost): Promise<string> {
  const from = host.displayName(fromPath)
  if (!isRelative(spec)) throw new AppError('err.imports.bare', { spec, from })
  const joined = joinPath(fromPath, spec)
  if (!joined) throw new AppError('err.imports.outsideRoot', { spec, from })

  const tried = candidates(joined)
  for (const path of tried) {
    if (!(await host.exists(path))) continue
    const ext = extOf(path.slice(path.lastIndexOf('/') + 1))
    if (!RUNNABLE_EXT.has(ext)) throw new AppError('err.imports.unsupportedType', { spec, from })
    return path
  }
  throw new AppError('err.imports.notFound', {
    spec,
    from,
    tried: tried.map((p) => host.displayName(p)),
  })
}

/**
 * 建图并生成 Blob URL。入口的源码由调用方给（编辑器缓冲区），依赖通过 host 读。
 * 任何一步失败都会先把已创建的 URL 全部 revoke 再抛出。
 */
export async function buildModuleGraph(
  entryCode: string,
  entryLanguage: string,
  host: ModuleHost
): Promise<ModuleGraphResult> {
  const urlOf = new Map<string, string>()
  const names: Record<string, string> = {}
  // DFS 状态：visiting = 还在它的子树里（再遇到就是环），done = 已经建好 URL
  const state = new Map<string, 'visiting' | 'done'>()
  const stack: string[] = []

  const revokeAll = () => {
    for (const url of urlOf.values()) URL.revokeObjectURL(url)
  }

  const visit = async (path: string, source: ModuleSource | null): Promise<string> => {
    const seen = state.get(path)
    if (seen === 'done') return urlOf.get(path)!
    if (seen === 'visiting') {
      const chain = [...stack.slice(stack.indexOf(path)), path].map((p) => host.displayName(p))
      throw new AppError('err.imports.cycle', { chain })
    }
    if (state.size >= MAX_MODULES) throw new AppError('err.imports.tooMany', { limit: MAX_MODULES })

    state.set(path, 'visiting')
    stack.push(path)

    const src = source ?? (await host.readSource(path))
    if (!src) {
      throw new AppError('err.imports.notFound', {
        spec: host.displayName(path),
        from: host.displayName(stack[stack.length - 2] ?? path),
        tried: [host.displayName(path)],
      })
    }
    // 先编译再找 specifier：TS 会把纯类型导入擦掉，擦掉的就不用去解析了
    const compiled = await compileModule(src.code, src.language, `local:${path}`)
    const specs = uniq(findModuleSpecifiers(compiled).map((s) => s.spec))
    const depUrl = new Map<string, string>()
    for (const spec of specs) {
      const depPath = await resolveSpecifier(path, spec, host)
      depUrl.set(spec, await visit(depPath, null))
    }

    const rewritten = rewriteSpecifiers(compiled, (spec) => depUrl.get(spec) ?? spec)
    const url = URL.createObjectURL(new Blob([rewritten], { type: 'text/javascript' }))
    urlOf.set(path, url)
    names[url] = host.displayName(path)
    state.set(path, 'done')
    stack.pop()
    return url
  }

  try {
    const entryUrl = await visit(host.entryPath, {
      code: entryCode,
      language: entryLanguage || languageOfPath(host.entryPath),
    })
    return { entryUrl, urls: [...urlOf.values()], names }
  } catch (err) {
    revokeAll()
    throw err
  }
}
