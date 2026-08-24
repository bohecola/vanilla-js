// 跨 iframe 转发的 console 消息类型
export type LogLevel = 'log' | 'info' | 'debug' | 'warn' | 'error' | 'table' | 'time' | 'timeEnd'

export interface ConsoleMessage {
  id: number
  type: LogLevel
  // 序列化后的参数（init.js 里的 safeSerialize 产物）
  args: unknown[]
  timestamp: number
}
