# jotter

JS / TS 代码草稿纸：写一段，跑一下，看 console 输出。

代码在无 DOM 的 Web Worker 里执行 —— 主线程不卡，`while (true)` 死循环也能一键终止；支持顶层 `await`。它不是 HTML/CSS 实时预览器。

基于：React + TS + Web Worker + Vite + Monaco

## 安装依赖

```sh
pnpm install
```

## 本地运行

```sh
pnpm dev
```

## 在线体验

地址：[playground.deore.me](https://playground.deore.me/)

![预览](/src/assets/imgs/preview.png)
