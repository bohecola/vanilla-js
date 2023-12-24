/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useImperativeHandle, forwardRef } from 'react';

export interface ConsoleHandle {
  clear: () => void;
}

export default forwardRef<ConsoleHandle>(function Console(_props, ref) {

  const [logs, setLogs] = useState<string[]>([])

  // 消息
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data.from === 'iframe') {
        const { args } = e.data
        
        setLogs((logs) => [...logs, args.join(' ')])
      }
    }
    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
    };
  }, [])

  // Expose method
  useImperativeHandle(ref, () => ({
    clear: () => {
      console.clear()
      setLogs([])
    }
  }))

  return (
    <div>
      <pre>
        {
          logs.map((log, index) => <div key={index}>{log}</div>)
        }
      </pre>
    </div>
  )
})