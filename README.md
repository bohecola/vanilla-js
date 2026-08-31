# Jotter

> [English](./README.en.md) | 中文

**Jotter** 是一个在线运行 JavaScript / TypeScript 代码的草稿纸。写一段代码，点一下运行，立刻在右侧 Console 看到输出。

## 特性

- **即时运行**：代码在一个独立的 Web Worker 中执行，不会阻塞界面；支持顶层 `await`，`while (true)` 这类死循环也能一键终止。
- **Monaco 编辑器**：基于 VS Code 同款编辑器，提供语法高亮、自动补全与 TypeScript 类型检查。
- **本地文件系统**：通过浏览器文件系统访问 API（File System Access）打开本地文件夹，直接在侧边栏中浏览目录树，编辑、保存、重命名、删除文件；支持从本地导入或下载导出单个文件。
- **内置 Demo**：内置一组可直接运行的示例片段，也可将全部 Demo 一键存到本地文件夹后自由修改。
- **双语文案**：界面支持中文与英文，默认跟随系统语言，可在顶栏随时切换。
- **三态主题**：深色 / 浅色 / 跟随系统，首次加载无白闪。

> 说明：Jotter 是「代码草稿纸」，只负责运行 JavaScript / TypeScript 并展示 Console 输出，**不是** HTML / CSS 实时预览器。

## 技术栈

React · TypeScript · Web Worker · Vite · Monaco Editor · shadcn/ui（Radix + Tailwind）

## 环境要求

- [Node.js](https://nodejs.org/)（推荐使用较新的 LTS 版本）
- [pnpm](https://pnpm.io/)（本仓库通过 `packageManager` 固定为 `pnpm@10.20.0`）

## 安装依赖

```sh
pnpm install
```

## 本地运行

```sh
pnpm dev
```

然后在浏览器中打开终端输出的地址（默认 <http://localhost:5173/>）。

## 构建与检查

```sh
pnpm build   # 类型检查 + 生产构建（产物在 dist/）
pnpm lint    # 代码检查（--max-warnings 0，任何告警都会失败）
```

## 在线体验

在线地址：[playground.deore.me](https://playground.deore.me/)

![Jotter 界面预览](/src/assets/imgs/preview.png)
