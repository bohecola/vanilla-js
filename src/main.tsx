import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { I18nProvider } from './i18n/index.tsx'
import { ThemeProvider } from './theme/index.tsx'
import './assets/style/index.css'

// 两个 Provider 互不依赖，顺序无关紧要；语言放外层是因为它还管着 <html lang> 与标题。
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </I18nProvider>
  </React.StrictMode>,
)
