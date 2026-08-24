import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN.js'
import App from './App.tsx'
import './assets/style/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorBgContainer: '#1e293b',
          colorBgElevated: '#1e293b',
          colorBorder: '#334155',
          colorPrimary: '#38bdf8',
          borderRadius: 8,
        },
        components: {
          Select: {
            optionSelectedBg: '#0f172a',
          },
        },
      }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>,
)
