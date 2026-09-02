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
      // react-hooks v7 的 recommended 把一批 React Compiler 启发式规则设成了 error。
      // 这些规则基于「React Compiler 记忆化」的假设，对这份先有代码（刻意用 live ref
      // 避免闭包过期、相互引用的 useCallback 按需排列、手写记忆化）会产生误报。
      // 它们是编译器层面的建议而非经典的 hooks 正确性检查，故关掉；rules-of-hooks 与
      // exhaustive-deps 这些真正的检查仍保留。
      'react-hooks/immutability': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  {
    // shadcn/ui 生成的组件按惯例会同时导出组件与 cva variants，
    // 这不影响实际使用（这些文件不参与 HMR 边界），关掉该规则即可。
    files: ['src/components/ui/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    // theme/index.tsx 同时导出 ThemeProvider（组件）与 useTheme（函数），
    // 属既有结构（迁移文档要求该文件不改动），关闭该规则以免误报。
    files: ['src/theme/index.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
)
