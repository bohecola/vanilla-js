import { useEffect, useState } from 'react'
import type { Notice } from '@/types'

/** 顶部提示条的状态。info 类提示是「已保存」这种一次性反馈，自己消失；warn / error 要留着等用户看见 */
export function useNotice() {
  const [notice, setNotice] = useState<Notice | null>(null)
  useEffect(() => {
    if (notice?.tone !== 'info') return
    const timer = setTimeout(() => setNotice(null), 2500)
    return () => clearTimeout(timer)
  }, [notice])
  return { notice, setNotice }
}
