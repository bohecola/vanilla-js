# vanilla-js 依赖升级实施文档

> **给实施者的说明**：本文档按批次组织，**每一批都必须独立跑通验证命令后再进下一批**，并逐批提交，方便出问题时二分定位。目标是升级到 `bohecola/vanilla-js`。
> 编写日期：2026-08-24。所有版本号均为编写时 npm registry 上的实际最新版，实施前可用 `pnpm outdated` 复核。
> 项目基于 React + TS + Vite + Monaco + iframe 的在线 JS 代码 playground。

---

## 0. 必读约束

### 0.1 TypeScript 最高只能升到 6.0.3，**不要升 7.0.2**

typescript-eslint 的 latest 版本（`8.67.0`）要求 `typescript: '>=4.8.4 <6.1.0'`。虽然 `typescript@7` 编译器已经 GA（2026-07-08），但本项目**不能**用：

- 若用 `typescript@6.0.3` 会超出 typescript-eslint 的 `<6.1.0` 上限，lint 会挂
- 不要用 `pnpm.overrides` / `--force` 之类的手段绕过这条限制去强装 TS 7
- `@vitejs/plugin-react` 官方那边 TS7 支持的 issue 尚未落地

另外注意运行 Node 版本要求（见 0.2）：ESLint 10 需要 `^20.19.0 || ^22.13.0 || >=24`，Vite 8 需要 `^20.19.0 || >=22.12.0`。

**目标：`typescript@6.0.3`**（最新的 6.x 稳定版）。不要用 `pnpm.overrides` / `--force` 之类的手段绕过这条限制去强装 TS 7——lint 会挂。

### 0.2 Node 版本

- Vite 8 要求：`^20.19.0 || >=22.12.0`
- ESLint 10 要求：`^20.19.0 || ^22.13.0 || >=24`
- gh-pages 部署相关工具要求：`^20.19.0 || >=22.12.0`

取交集，本地**建议用 Node 22.13 以上**（建议 22 LTS 最新版）。CI 里也应把 `node-version` 设成 `22`。Node 18 已于 2025-04 EOL，不要再使用。

### 0.3 验收标准

每批改完，依次跑通这三条：

```sh
pnpm install
pnpm lint
pnpm build
```

第 3、4、5 批还必须额外做功能验证，见文末第 8 节的清单。

### 0.4 不要碰的东西

- **`gh-pages` 分支上的 `CNAME` 文件**（内容 `playground.deore.me`）由 GitHub 维护，`JamesIves/github-pages-deploy-action` 在 clean 部署时会保留它。已验证：该分支历史上有 3 次 action 部署都没把它删掉。**不要换成官方的 `actions/deploy-pages`**——那个是上传 artifact，不保留旧文件，会导致自定义域名失效。如果确实需要，可以在 `public/CNAME` 里补上 `playground.deore.me`。
- 项目地址 `playground.deore.me` 是正确的，不要改回 `colan.top`。

---

## 1. 版本对照表

| 包 | 当前 | 目标 | 批次 | 备注 |
|---|---|---|:---:|---|
| **包管理器** | yarn 1.22 | **pnpm 10.20.0** | 0 | |
| lodash-es | ^4.17.21 | ^4.18.1 | 1 | 无痛 |
| @types/lodash-es | ^4.17.12 | ^4.17.12 | 1 | 已是最新 |
| @types/node | ^20.10.5 | ^26.2.0 | 1 | |
| postcss | ^8.4.32 | ^8.5.26 | 1 | 第 5 批会整包删掉 |
| autoprefixer | ^10.4.16 | ^10.5.4 | 1 | 第 5 批会整包删掉 |
| **eslint** | ^8.45.0 | **^10.9.0** | 2 | eslintrc 被完全移除 |
| @eslint/js | 无 | ^10.0.1 | 2 | 新增，flat config 需要 |
| globals | 无 | ^17.11.0 | 2 | 新增，flat config 需要 |
| @typescript-eslint/eslint-plugin | ^6.0.0 | 删除 | 2 | 换成统一包 typescript-eslint |
| @typescript-eslint/parser | ^6.0.0 | 删除 | 2 | 换成统一包 typescript-eslint |
| typescript-eslint | 无 | ^8.67.0 | 2 | 新增，统一包 |
| eslint-plugin-react-hooks | ^4.6.0 | ^7.1.1 | 2 | |
| eslint-plugin-react-refresh | ^0.4.3 | ^0.5.4 | 2 | peer 已是 `^9 \|\| ^10` |
| **typescript** | ^5.0.2 | **6.0.3** | 2 | 见 0.1，不要升 7 |
| **vite** | ^5.0.10 | **^8.2.2** | 3 | Rolldown 换 Rollup |
| @vitejs/plugin-react | ^4.0.3 | ^6.1.0 | 3 | peer 要求 vite ^8 |
| monaco-editor | ^0.45.0 | ^0.56.0 | 3 | 跨 11 个 0.x，需实测 |
| **antd** | ^5.12.5 | **^6.6.1** | 4 | peer 是 `react >=18` |
| **react / react-dom** | ^18.2.0 | **^19.2.8** | 4 | |
| @types/react | ^18.2.15 | ^19.2.18 | 4 | |
| @types/react-dom | ^18.2.7 | ^19.2.4 | 4 | |
| **tailwindcss** | ^3.4.0 | **^4.3.3** | 5 | CSS-first，删除 JS 配置 |
| @tailwindcss/vite | 无 | ^4.3.3 | 5 | 新增，替代 postcss 链路 |

**CI/README 相关替换**：

| 项 | 从 | 到 | 备注 |
|---|---|---|---|
| 安装命令 | `yarn install` | `pnpm install` | |
| 启动命令 | `yarn dev` | `pnpm dev` | |
| actions/checkout | `@v3` | `@v5` | |
| actions/setup-node | `@v3` | `@v5` | |
| 新增 pnpm 步骤 | 无 | `pnpm/action-setup@v4` | 必须在 setup-node 之前 |
| JamesIves/github-pages-deploy-action | `releases/v4` | `@v4` | 老的 ref 写法 |

---

## 2. 第 0 批：yarn → pnpm

本批**只换包管理器，不动任何依赖版本**，目的是先拿到一个可复现的绿色基线。

### 步骤

```sh
# 1. 删掉 yarn 的产物
rm yarn.lock
rm -rf node_modules

# 2. 用 pnpm 重新装（此时 package.json 里还是旧版本号）
pnpm install
```

### 修改 `package.json`

在顶层加 `packageManager` 字段（供 corepack / CI 识别）：

```json
{
  "name": "vanilla-js",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "packageManager": "pnpm@10.20.0",
  "scripts": { ... }
}
```

### 修改 `.gitignore`

现有 `.gitignore` 已经忽略了 `node_modules`，无需改动。可选：把 `yarn-debug.log*` / `yarn-error.log*` 两行删掉，加一行 `pnpm-debug.log*`（pnpm 已默认忽略该文件，属锦上添花）。

### 修改 `README.md`

把安装/运行命令从 yarn 改成 pnpm：第 15 行的 `yarn install` 改成 `pnpm install`；第 16 行的 `yarn dev` 改成 `pnpm dev`。README 里的在线预览地址 `playground.deore.me` 保持不变。

### 修改 `.github/workflows/deploy.yml`

整个文件替换为：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - master

permissions:
  contents: read

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v5

      # 必须在 setup-node 之前，否则 cache: pnpm 找不到 pnpm 可执行文件
      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node.js
        uses: actions/setup-node@v5
        with:
          node-version: 22
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build

      - name: Deploy to GitHub Pages
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          branch: gh-pages
          folder: dist
```

**注意步骤顺序**：`pnpm/action-setup@v4` 必须排在 `actions/setup-node` 之前，因为 `cache: pnpm` 需要 pnpm 可执行文件才能定位 store 目录。`pnpm/action-setup@v4` 会读 `package.json` 里的 `packageManager` 字段来决定装哪个版本，所以 0 批里那个字段是必须加的。

### 本批验证

```sh
pnpm install
pnpm lint
pnpm build
```

三条都过 = 基线成立。此时**先提交一次**，后面每批也各提交一次，方便出问题时二分定位。

---

## 3. 第 1 批：无痛小版本

只升小版本，不涉及任何代码改动。

```sh
pnpm add -D @types/node@^26.2.0 postcss@^8.5.26 autoprefixer@^10.5.4
pnpm add lodash-es@^4.18.1
```

`@types/lodash-es` 已经是最新的 `4.17.12`，不用动。

`postcss` 和 `autoprefixer` 在第 5 批会被整包删掉（Tailwind 4 用 `@tailwindcss/vite` 插件，不再走 PostCSS），这里升上去只是为了让第 1 批到第 4 批期间不带旧版本。如果想省一步，也可以跳过这两个。

### 本批验证

```sh
pnpm lint && pnpm build
```

---

## 4. 第 2 批：lint 工具链 + TypeScript

这批要把 ESLint 从 8 升到 10。**ESLint 10 已经完全移除了 eslintrc 配置系统**（v9 起 flat config 是默认，但仍能读旧格式；v10 彻底不读了），所以 `.eslintrc.cjs` 必须重写成 `eslint.config.js`。

### 4.1 依赖变更

```sh
# 删掉拆分的两个包，换成统一包
pnpm remove @typescript-eslint/eslint-plugin @typescript-eslint/parser

pnpm add -D typescript-eslint@^8.67.0 @eslint/js@^10.0.1 globals@^17.11.0 \
  eslint@^10.9.0 eslint-plugin-react-hooks@^7.1.1 eslint-plugin-react-refresh@^0.5.4 \
  typescript@6.0.3
```

**typescript 请精确锁 `6.0.3`**（不要写 `^6.0.3`，避免将来自动跳到 6.1+ 撞上 typescript-eslint 的 `<6.1.0` 上限）。

### 4.2 删除 `.eslintrc.cjs`

`tsconfig.json` 当前相关配置（用于判断影响面）：

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "baseUrl": "./",
    "paths": { "@/*": ["src/*"] },
    "allowJs": true
  },
  "include": ["src", "src/main.tsx", "public/js"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

`.eslintrc.cjs` 旧内容：

```js
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
}
```

**删除 `.eslintrc.cjs`**（flat config 不再读它）。

### 4.3 新建 `eslint.config.js`

```js
import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
)
```

**需要实施时确认的一点**：`eslint-plugin-react-hooks` v7 的 flat config 预设导出名。v5 起该插件同时提供 `recommended`（对 ESLint 默认 + compiler 规则）和 `recommended-latest`（对新版 React Compiler 规则）。如果上面 `reactHooks.configs.recommended.rules` 报 undefined，改用 `reactHooks.configs['recommended-latest'].rules`，或直接把整个预设放进 `extends` 数组。以插件 README 为准：<https://github.com/facebook/react/blob/main/packages/eslint-plugin-react-hooks/README.md>

### 4.4 影响面：`public/js/init.js`

`tsconfig.json` 里 `include` 含 `"public/js"` 且 `allowJs: true`，所以 `public/js/init.js` 也会被 tsc 检查——如果 TS 6 对这个文件报出新错误（它用了 `parent.postMessage` 这类没有类型声明的全局量），考虑给它加 `// @ts-nocheck`，或把 `public/js` 从 `include` 里去掉（`public/` 目录本来就是原样拷贝进 `dist/` 的，不参与编译）。

### 4.5 本批验证

```sh
pnpm lint
pnpm build
```

`pnpm lint` 的 script 是 `eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0`。**`--ext` 在 flat config 下已经不支持了**，必须把 script 改成：

```json
"lint": "eslint . --report-unused-disable-directives --max-warnings 0"
```

要 lint 哪些文件由 `eslint.config.js` 里的 `files: ['**/*.{ts,tsx}']` 决定。

注意 `--max-warnings 0`：ESLint 10 + typescript-eslint 8 的 recommended 规则集比 ESLint 8 + v6 时代严格，很可能冒出新 warning 导致 `pnpm build`（`tsc && vite build`）或 lint 失败。能改代码就改代码；`dist/assets/`、worker 相关规则可在 config 里显式关掉，**不要直接删掉 `--max-warnings 0`**。

---

## 5. 第 3 批：Vite 8（风险最集中的一批）

Vite 8 用 Rolldown 换掉 Rollup（`output.advancedChunks.groups` / `output.codeSplitting` 替代 manualChunks），并把 esbuild 换成 Oxc。这批有两处**必须**改的代码。

### 5.1 依赖变更

```sh
pnpm add -D vite@^8.2.2 @vitejs/plugin-react@^6.1.0
```

### 5.2 改 `src/hooks/index.ts`（必须）

`import.meta.glob` 的 `as` 选项在 Vite 5→6 移除。

当前：

```ts
const modules = import.meta.glob(['../template/**/*.js', '!**/data/index.js'], { as: "raw" })
```

改成：

```ts
const modules = import.meta.glob(
  ['../template/**/*.js', '!**/data/index.js'],
  { query: '?raw', import: 'default' }
)
```

行为不变：返回 `Record<string, () => Promise<string>>`，`App.tsx` 里 `modules[val]().then(res => ...)` 的用法不用动。

### 5.3 改 `vite.config.ts`

当前配置（`src/monaco/setup.ts` 里那 5 条 `?worker` 深路径导入对应这里的 `manualChunks`）：

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from "path"

const prefix = `monaco-editor/esm/vs`

export default defineConfig({
  base: "./",
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          jsonWorker: [`${prefix}/language/json/json.worker`],
          cssWorker: [`${prefix}/language/css/css.worker`],
          htmlWorker: [`${prefix}/language/html/html.worker`],
          tsWorker: [`${prefix}/language/typescript/ts.worker`],
          editorWorker: [`${prefix}/editor/editor.worker`],
        }
      }
    }
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src")
    }
  }
})
```

问题：**Vite 8 移除了 `manualChunks` 的对象形式**（函数形式也已废弃，替代是 `output.codeSplitting`）。上面正好是对象形式。另外有资料指出 `build.rollupOptions` 已改名为 `build.rolldownOptions`。

**推荐做法（先试这个）**：直接把整个 `build` 块删掉。

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from "path"

export default defineConfig({
  base: "./",
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src")
    }
  }
})
```

说明：`src/monaco/setup.ts` 里那 5 个 worker 是通过 `?worker` 后缀导入的，Vite 8 会默认把它们各自 emit 成独立的 bundle，和 Rolldown 的默认分包应该表现相同，先看默认结果够不够好。

删掉之后**必须验证**：
1. `pnpm build` 后检查 `dist/assets/` 下是否有 5 个独立的 worker 产物（文件名里带 `worker`）
2. `pnpm preview` 打开页面，开 devtools Network 确认 worker 请求 200 而不是 404
3. 编辑器要有语法高亮、括号匹配；`ts.worker` 挂了的典型症状是高亮正常但没有任何智能提示/错误波浪线

如果默认分包确实有问题（比如主 chunk 里混进了 worker 代码导致体积异常），再用 Rolldown 的 `output.advancedChunks.groups` 或 `output.codeSplitting` 显式控制。**具体字段名以 Vite 8 官方迁移指南为准**（<https://vite.dev/guide/migration>），Vite 运行时打的 deprecation warning 是最可靠的依据——本文档没有实测过这两个选项的确切 schema。

### 5.4 改 CI 的 Node 版本

`.github/workflows/deploy.yml` 里 `node-version: 22`（第 0 批已经改过了，这里只是提醒确认）。

### 5.5 升级 monaco-editor 的兼容性检查

monaco-editor 从 0.45 → 0.56 跨了 11 个 0.x 版本，`src/monaco/setup.ts` 里那 5 条深路径导入的检查对象：

```ts
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
```

如果 0.56 里某个路径不存在了，`pnpm build` 会直接报模块解析失败。届时去 `node_modules/monaco-editor/esm/vs/` 下找对应的新路径。`self.MonacoEnvironment = { getWorker(_, label) {...} }` 这个 API 本身长期稳定，应该不用改。

### 5.6 本批验证

```sh
pnpm lint && pnpm build && pnpm preview
```

外加第 8 节的完整功能清单，这批**必须**跑完整清单。

---

## 6. 第 4 批：antd 6 + React 19（一起升）

### 6.1 为什么一起升

antd 6 的 peer 是 `react >=18.0.0`，但 React 19 改变了 ref 作为 prop 的传递方式。antd 5.x 配 React 19 需要额外的兼容包，而 antd 6 原生支持 19——一起升反而少一个中间态。

### 6.2 依赖变更

```sh
pnpm add react@^19.2.8 react-dom@^19.2.8 antd@^6.6.1
pnpm add -D @types/react@^19.2.18 @types/react-dom@^19.2.4
```

`antd@6.6.1` 内部依赖 `@ant-design/icons ^6.3.2`，项目没有直接依赖 antd icons，所以不需要单独处理。

### 6.3 代码影响面

本项目对 antd 的使用面极小，只有 `src/App.tsx` 里的 `Select` + `Button`：

```tsx
<Select className="mb-2" defaultValue={utilsPath} onChange={handleChange} options={options} />
<Button type="primary" className="ml-2" onClick={runCode}>Run</Button>
```

这些 API 在 v6 里都还在，但 design token（圆角、尺寸、间距）有调整，会有轻微视觉差异——属于预期变化，不是 bug。

`src/main.tsx` 里有一段被注释掉的 `ConfigProvider` + `theme.darkAlgorithm` 暗色主题配置。**本批不要去启用它**；如果之后想启用，需要按 v6 的 token 命名（`colorBgContainer`、`colorBorder`、`colorBgElevated`）重新核对。

其他影响点：

- `Editor.tsx`、`Console.tsx` 都用 `forwardRef`。React 19 里 `ref` 可以直接作为 prop 传，`forwardRef` 仍然可用但已被标记为将来会废弃。**本批保持 `forwardRef` 不动**，减少变量；重构留到以后单独做。
- `@types/react` 19 的 `useRef` 要求显式初始值。现有代码 `useRef<EditorHandle>(null)`、`useRef<HTMLIFrameElement>(null)`、`useRef<MonacoEditorType.IStandaloneCodeEditor | null>(null)` 都带显式泛型，应该能直接通过。

### 6.4 本批验证

```sh
pnpm dev
```

外加第 8 节完整清单，重点看下拉框和 Run 按钮的功能与外观（切到 `vs-dark` 主题后确认明暗对比没崩）。

---

## 7. 第 5 批：Tailwind 3 → 4（CSS-first，回归风险集中）

Tailwind 4 改成 CSS-first，**JS 配置文件不再需要**，PostCSS 链路整个换成 `@tailwindcss/vite` 插件。注意把本批的改动和其他批次混在一起做会很难回归，**务必单独一批**。

### 7.1 依赖变更

```sh
pnpm remove postcss autoprefixer
pnpm add -D tailwindcss@^4.3.3 @tailwindcss/vite@^4.3.3
```

autoprefixer 不用装了，Tailwind 4 内置了 Lightning CSS 处理前缀。

### 7.2 删除 `postcss.config.js`

删除整个文件（`postcss.config.js` 内容）：

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### 7.3 删除 `tailwind.config.js`

当前内容：

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: { extend: {} },
  plugins: [],
  corePlugins: {
    preflight: false
  }
}
```

- `content` → v4 自动检测，不需要
- `theme: { extend: {} }` / `plugins: []` → 空的，不需要
- `corePlugins: { preflight: false }` → v4 改在 CSS 里通过"不 import preflight.css"实现，见 7.5

### 7.4 改 `vite.config.ts`

加上 Tailwind 的 Vite 插件：

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from "path"

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src")
    }
  }
})
```

### 7.5 改 `src/assets/style/index.css`

当前内容：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  *,
  ::before,
  ::after {
    box-sizing: border-box; /* 1 */
    border-width: 0; /* 2 */
    border-style: solid; /* 2 */
    border-color: theme('borderColor.DEFAULT', currentColor); /* 2 */
  }
  
  ::before,
  ::after {
    --tw-content: '';
  }
}
```

背景：原作者关掉了 preflight（因为 preflight 的全局 reset 会和 antd 自带的样式打架），但 Tailwind 的 `border-*` 工具类只设 `border-width`、不设 `border-style`，而 CSS 的 `border-style` 默认是 `none`。所以 `App.tsx` 里的 `border-4`、`border-b` 在没有 preflight 的情况下**根本不会显示边框**。上面那个手写的 `@layer base` 就是把 preflight 里跟边框相关的那三行单独补回来。

v4 的改法（三步）：

1. `@tailwind` 指令换成 `@import`，并且**跳过 preflight**。v4 允许分部导入：

```css
@layer theme, base, components, utilities;

@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities);
```

即不 import `preflight.css`。**这个写法请对照 v4 官方文档的 "Disabling Preflight" 一节确认**——本文档没有实测过 v4.3.3 里这几个子文件的确切路径。

2. `theme('borderColor.DEFAULT', currentColor)` 这个 `theme()` 函数用法 v4 已改为 CSS 变量。v4 里默认边框颜色本身就是 `currentColor`，所以这一行大概率可以直接简化成 `border-color: currentColor;`。

3. 手写的 `@layer base` 块保留（因为 preflight 仍然是关掉的），改成：

```css
@layer base {
  *, ::before, ::after {
    box-sizing: border-box;
    border-width: 0;
    border-style: solid;
    border-color: currentColor;
  }
  ::before, ::after {
    --tw-content: '';
  }
}
```

### 7.6 视觉回归检查清单

项目里用到的全部 Tailwind 类（就这些，逐个对比升级前后的截图）：

| 位置 | 类名 |
|---|---|
| `App.tsx:63` | `p-5 flex gap-5` |
| `App.tsx:64` / `:87` | `p-2 border-4 rounded-lg w-[45vw]` |
| `App.tsx:67` | `mb-2` |
| `App.tsx:76` | `ml-2` |
| `App.tsx:91` | `hidden` |
| `App.tsx:95` | `p-2 border-b` |
| `Editor.tsx:57` | `h-[80vh]` |

重点看两处 `border-4` 的边框有没有消失（那就是 7.5 第 3 步没做对），以及 antd 的 `Select` / `Button` 有没有被新的 reset 影响。

建议做法：**升级前先 `pnpm dev` 截一张全页截图存下来**，改完对照。

### 7.7 本批验证

```sh
pnpm lint && pnpm build && pnpm preview
```

外加第 8 节完整清单。

---

## 8. 功能验收清单

第 3、4、5 批每批做完都要把这份清单跑一遍。**只跑 `pnpm build` 通过不算验证完成**——这个项目大量逻辑在运行时（iframe、worker、postMessage），编译期发现不了。

先 `pnpm dev`（或 `pnpm build && pnpm preview`），然后：

1. **编辑器初始化**：页面打开后，编辑器里自动出现 `src/template/overrides/call.js` 的内容（`Function.prototype.myCall` 那段），有 JS 语法高亮，主题是 `vs-dark`
2. **智能提示**：在编辑器里敲 `console.` ，应该弹出成员补全。**没有补全 = `ts.worker` 加载失败**
3. **切换模板**：下拉框选另一个（比如 `../template/utils/sort.js`），编辑器内容替换，console 面板同时被清空
4. **Run 基本功能**：切回 `call.js`，点 Run，console 面板出现输出（`method` 里的 `console.log(this, a, b)`，因为对象会被 `join(' ')` 成 `[object Object]`，预期看到类似 `[object Object] 2 3`）
5. **异步顺序**：选 `../template/overrides/promise-order.js`，Run，检查输出顺序符合事件循环预期
6. **定时器**：选 `../template/overrides/setInterval.js`，Run，console 面板每秒追加一行 `task is running.`
7. **错误捕获**：在编辑器里故意写一行 `throw new Error('x')`，Run，console 面板应显示 `Error x`（走的是 `App.tsx:52` 的 catch）
8. **窗口 resize**：拖动浏览器窗口大小，编辑器布局跟着变（`Editor.tsx:19` 的 debounce 100ms）
9. **devtools 无报错**：Console 面板不能有 worker 404、`MonacoEnvironment` 相关报错，或 CSP / sandbox 报错
10. **产物检查**：`pnpm build` 后确认 `dist/` 里有 `index.html`、`preview.html`、`js/init.js`，以及 `assets/` 下的 5 个 monaco worker 产物

第 10 条特别注意：`public/preview.html` 和 `public/js/init.js` 是通过 `public/` 目录原样拷贝的，`App.tsx:90` 用 `src="/preview.html"` 绝对路径引用。**这两个文件丢了或路径变了，整个 console 转发链路就断了，但页面不会报任何编译错误。**

---

## 9. 附录：升级范围之外的既有问题

以下是代码审查时发现的问题，**不属于本次升级范围**，不要顺手一起改（会让升级的回归定位变困难）。列在这里是因为升级过程中可能会碰到，另外第 1 条在 React 19 之后更容易暴露。

1. **`src/components/Editor.tsx:19,40`** —— `handleResize` 的 `debounce` 每次渲染都新建，又出现在 `useEffect` 的依赖数组里，导致父组件任何一次重渲染都会 `dispose()` 掉 Monaco 实例再重建，编辑中的内容丢失。目前 `App` 组件没有 state 所以没暴露。修法：用 `useMemo` 包住 debounce，或者依赖数组只留 `[language]`。
2. **`src/components/Editor.tsx:30-32`** —— 空的 `onDidChangeModelContent` 回调，死代码。
3. **`src/App.tsx:46-58`** —— `runCode` 用 `document.open()` + `document.write()` 注入代码，只清 DOM 不清全局变量和定时器。选 `setInterval.js` 连点两次 Run 会叠加两条循环日志。想彻底干净需要每次重建 iframe。
4. **`src/components/Console.tsx:17`** —— `args.join(' ')` 把对象变成 `[object Object]`（UI 里"对象输出请在控制台查看"那句就是在绕这个）。`type` 字段传过来了但没用，warn/error 没有颜色区分，也没有自动滚动。`console.time/timeEnd/table` 的劫持在自定义面板里只会打出空行。
5. **`src/App.tsx:92`** —— `sandbox="allow-same-origin allow-scripts"` 这个组合下 iframe 脚本能拿到 `parent`、甚至去掉自己的 sandbox 属性，等于沙箱失效。跑自己写的代码无所谓，但如果以后加"URL 分享代码"功能就是 cross-site scripting 入口。
6. **`src/components/Console.tsx:13`** —— `postMessage` 接收侧只判断 `e.data.from === 'iframe'`，没校验 `origin` / `source`。
7. **`src/components/Editor.tsx:46`** —— `value.replace(/export\s/g, '')` 用来去掉模板文件的 `export`，会误伤字符串字面量里的 `"export "`。
8. **`src/App.tsx:51`** —— 用户代码里出现 `</script>` 字符串会截断注入的 script 标签。

---

## 10. 参考链接

- Vite 8 发布公告：<https://www.vite.dev/blog/announcing-vite8>
- Vite 官方迁移指南：<https://vite.dev/guide/migration>
- Vite 7→8 实测踩坑（含 `manualChunks` 对象形式移除）：<https://dev.classmethod.jp/articles/vite7-to-vite8-migration-pitfalls/>
- Vite glob `as` 选项废弃 PR：<https://github.com/vitejs/vite/pull/14420/files>
- ESLint v10 发布公告（eslintrc 完全移除）：<https://eslint.org/blog/2026/02/eslint-v10.0.0-released/>
- ESLint v10 迁移指南：<https://eslint.org/docs/latest/use/migrate-to-10.0.0>
- typescript-eslint 依赖版本要求：<https://typescript-eslint.io/users/dependency-versions/>
- typescript-eslint 对 TS 7 的支持 issue：<https://github.com/typescript-eslint/typescript-eslint/issues/12518>
- TypeScript 7.0 公告：<https://devblogs.microsoft.com/typescript/?p=5246>
- Ant Design v5 → v6 迁移：<https://ant.design/docs/react/migration-v6/>
- eslint-plugin-react-hooks README：<https://github.com/facebook/react/blob/main/packages/eslint-plugin-react-hooks/README.md>
