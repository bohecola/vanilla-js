import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

self.MonacoEnvironment = {
  getWorker(_, label) {
    switch (label) {
      case 'json':
        return new jsonWorker();
      case 'css':
      case 'scss':
      case 'less':
        return new cssWorker();
      case 'html':
      case 'handlebars':
      case 'razor':
        return new htmlWorker();
      case 'typescript':
      case 'javascript':
        return new tsWorker();
      default:
        return new editorWorker();
    }
  }
}

// 自定义「高对比浅色」主题：默认 vs 浅色主题对部分人偏淡，
// 这里加深深色文字、注释、token 色彩并明确光标，提升可读性。
monaco.editor.defineTheme('playground-light', {
  base: 'vs',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '1a7f37', fontStyle: 'italic' },
    { token: 'keyword', foreground: 'b31d28' },
    { token: 'string', foreground: 'a01d1d' },
    { token: 'number', foreground: '0550ae' },
    { token: 'regexp', foreground: '0a7d7d' },
    { token: 'type', foreground: '215f8e' },
    { token: 'type.identifier', foreground: '215f8e' },
    { token: 'function', foreground: '8250df' },
    { token: 'identifier', foreground: '24292f' },
    { token: 'delimiter', foreground: '24292f' },
    { token: 'tag', foreground: '116329' },
    { token: 'attribute.name', foreground: 'a03b0b' },
    { token: 'attribute.value', foreground: '1a7f37' },
    { token: 'variable', foreground: '24292f' },
    { token: 'operator', foreground: '0550ae' },
    { token: 'annotation', foreground: '6639ba' },
  ],
  colors: {
    'editor.background': '#ffffff',
    'editor.foreground': '#24292f',
    'editorCursor.foreground': '#0969da',
    'editor.selectionBackground': '#b6d7ff',
    'editor.lineHighlightBackground': '#f6f8fa',
    'editor.lineHighlightBorder': '#00000000',
    'editorIndentGuide.background1': '#d0d7de',
    'editorIndentGuide.activeBackground1': '#0969da',
    'editorWhitespace.foreground': '#d0d7de',
  },
})

export { monaco }
