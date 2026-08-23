import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from "path"

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  worker: {
    format: 'es',
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "monaco-editor/esm/vs": resolve(__dirname, "node_modules/monaco-editor/esm/vs")
    }
  }
})
