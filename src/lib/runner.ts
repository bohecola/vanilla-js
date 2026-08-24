// 生成 iframe 运行文档：内联用户代码，并通过 /js/init.js 劫持 console。
// 每次运行生成全新的 srcdoc，配合 key 递增强制重建 iframe，
// 从而清空上一次运行的全局变量与定时器（修复 setInterval 叠加等既有问题）。

export function buildRunnerDoc(code: string): string {
  // 转义避免用户代码里的 `</script>` 截断脚本标签
  const escaped = code.replace(/<\/script>/gi, '<\\/script>')
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<script src="/js/init.js"></script>
</head>
<body>
<script>
try {
${escaped}
} catch (e) {
  console.error(e && e.name, e && e.message);
}
</script>
</body>
</html>`
}
