// TS → JS 编译（主线程）。
//
// 为什么不放在运行用的 worker 里：为了能 terminate 掉 while(true) 这类死循环，
// 每次「运行」都会新建一个 runner worker；esbuild 的 wasm 有 ~10MB，
// 放在 runner worker 里就意味着每点一次 Run 都要重新实例化一次 wasm。
// 放在主线程模块里，wasm 只在首次需要时初始化一次，之后所有运行复用。
// esbuild 自己会另起 worker 跑 wasm（initialize 默认 worker: true），不阻塞 UI。
import * as esbuild from 'esbuild-wasm/esm/browser.js'
import esbuildWasmUrl from 'esbuild-wasm/esbuild.wasm?url'
import { get } from 'lodash-es'
import { AppError } from './app-error'
import { stripExports } from './strip-exports'
import type { CompileIssue } from '@/i18n/dict.zh'

// 初始化状态缓存（Promise 复用，避免并发/重复初始化）
let esbuildReady: Promise<void> | null = null

function ensureEsbuild(): Promise<void> {
  if (!esbuildReady) {
    esbuildReady = esbuild.initialize({ wasmURL: esbuildWasmUrl }).catch((err) => {
      esbuildReady = null // 失败后允许下次重试
      throw new AppError('err.compile.initFailed', {
        message: err instanceof Error ? err.message : String(err),
      })
    })
  }
  return esbuildReady
}

/** 预热编译器：切到 TS 时提前实例化 wasm，减少首次「运行」的等待。 */
export function warmupCompiler(): void {
  void ensureEsbuild().catch(() => {
    /* 预热失败不打扰用户，真正运行时会再试一次并报错 */
  })
}

// 把 esbuild 的编译错误整理成一条待翻译的错误。
//
// 这里只做「取出结构、把列号从 0 基改成 1 基」，句子怎么拼（分隔符、位置的写法、
// 拿不到文案时的兜底词）全在字典里 —— 那些都是随语言变的东西。
function formatCompileError(err: unknown): AppError {
  // 用 get 探一层：err 是 unknown，手写的话得先铺一整段结构体类型再断言
  const errors = get(err, 'errors') as
    | Array<{ text?: string; location?: { line?: number; column?: number } | null }>
    | undefined
  if (Array.isArray(errors) && errors.length > 0) {
    const issues: CompileIssue[] = errors.map((e) => ({
      text: e.text ?? '',
      // esbuild 的 column 是 0 基的，+1 在这里做完，字典只负责印数字
      loc: e.location ? { line: e.location.line ?? 0, column: (e.location.column ?? 0) + 1 } : null,
    }))
    return new AppError('err.compile.failed', { issues })
  }
  return new AppError('err.compile.raw', {
    message: err instanceof Error ? err.message : String(err),
  })
}

/**
 * 把用户代码编译成可以直接在 eval（脚本上下文）里执行的 JS。
 * - typescript：先用 esbuild 去掉类型语法，再剥离 export
 * - javascript：原样返回，只剥离 export（导入的 ES module 文件也能直接跑）
 */
export async function compileToJs(code: string, language: string): Promise<string> {
  if (language !== 'typescript') return stripExports(code)

  await ensureEsbuild()
  try {
    const result = await esbuild.transform(code, {
      loader: 'ts',
      // es2022 而不是 es2020：低于 es2022 时 esbuild 会直接拒绝顶层 await
      //（"Top-level await is not available in the configured target environment"），
      // 而 worker 里是用 async 函数包起来执行的，顶层 await 是支持的
      target: 'es2022',
    })
    return stripExports(result.code)
  } catch (err) {
    throw formatCompileError(err)
  }
}
