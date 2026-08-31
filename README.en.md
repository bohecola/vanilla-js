# Jotter

> English | [中文](./README.md)

**Jotter** is an online scratchpad for running JavaScript and TypeScript code. Write a snippet, hit run, and see the console output immediately.

## Features

| Feature | Description |
| --- | --- |
| Instant execution | Code runs in a dedicated Web Worker, so the UI stays responsive; top-level `await` works and `while (true)` loops can be stopped with one click. |
| Monaco editor | The same editor that powers VS Code, with syntax highlighting, autocompletion, and TypeScript type checking. |
| Local file system | Open a local folder via the browser's File System Access API, browse the directory tree in the sidebar, edit/save/rename/delete files, or import and download individual files. |
| Built-in demos | A set of ready-to-run examples; save them all to a local folder with one click to modify. |
| Bilingual UI | English and Chinese, following the system language by default and switchable from the top bar. |

> Note: Jotter is a code scratchpad — it runs JavaScript / TypeScript and shows console output. It is **not** an HTML / CSS live preview tool.

## Tech Stack

React · TypeScript · Web Worker · Vite · Monaco Editor · shadcn/ui (Radix + Tailwind)

## Prerequisites

- [Node.js](https://nodejs.org/) (a recent LTS version is recommended)
- [pnpm](https://pnpm.io/) (pinned to `pnpm@10.20.0` via the repo's `packageManager` field)

## Install Dependencies

```sh
pnpm install
```

## Run Locally

```sh
pnpm dev
```

Then open the address printed in the terminal (default <http://localhost:5173/>) in your browser.

## Build & Check

```sh
pnpm build   # type-check + production build (output in dist/)
pnpm lint    # code linting (--max-warnings 0; any warning fails)
```

## Try It Online

Online playground: [playground.deore.me](https://playground.deore.me/)

![Jotter UI preview](/src/assets/imgs/preview.png?v=2)
