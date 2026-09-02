import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'

const here = import.meta.dirname
const monacoVs = resolve(here, 'node_modules/monaco-editor/esm/vs')

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  worker: {
    format: 'es',
  },
  optimizeDeps: {
    // 排除 monaco-editor 的预打包：dev 下预打包会丢失 ?worker 的 default 导出
    // （worker 模块被优化成普通模块，没有 default）。改成按需直接以 ESM 提供。
    exclude: ['monaco-editor'],
  },
  resolve: {
    alias: {
      "@": resolve(here, "./src"),
      "monaco-editor/esm/vs": monacoVs
    }
  }
})
