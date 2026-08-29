import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN.js'
import App from './App.tsx'
import { ThemeProvider, useTheme } from './theme/index.tsx'
import './assets/style/index.css'

// 把主题模式桥接到 antd：darkAlgorithm / defaultAlgorithm 跟随当前主题
function ThemedApp() {
  const { effective } = useTheme()
  const isDark = effective === 'dark'

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#38bdf8',
          borderRadius: 8,
          ...(isDark
            ? {
                colorBgContainer: '#0f172a',
                colorBgElevated: '#0f172a',
                colorBorder: '#334155',
              }
            : {
                colorBgContainer: '#ffffff',
                colorBgElevated: '#ffffff',
                colorBorder: '#cbd5e1',
              }),
        },
        components: {
          Select: {
            optionSelectedBg: isDark ? '#020617' : '#e0f2fe',
          },
        },
      }}
    >
      <App />
    </ConfigProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  </React.StrictMode>,
)
