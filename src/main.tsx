import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
// import { ConfigProvider, theme } from "antd";
import './assets/style/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* <ConfigProvider
      theme={{
        token: {
          colorBgContainer: "#1e293b",
          colorBorder: "#475569",
          colorBgElevated: "#475569"
        },
        algorithm: theme.darkAlgorithm
      }}
    > */}
      <App />
    {/* </ConfigProvider> */}
  </React.StrictMode>,
)
