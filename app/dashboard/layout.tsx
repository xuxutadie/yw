'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useCompliance } from '@/hooks/useCompliance'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import AIFloatingButton from '@/components/AIFloatingButton'
import WoodenFishModal from '@/components/WoodenFishModal'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, checkTeacherOnly, checkAdmin } = useAuthStore()
  
  // 使用合规性检查
  const { isCompliant, logAudit } = useCompliance()

  useEffect(() => {
    // 严格验证：未认证或非教师/管理员角色都重定向到登录页
    if (!isAuthenticated || (!checkTeacherOnly() && !checkAdmin())) {
      router.push('/')
      return
    }

    // 记录访问日志
    logAudit('DASHBOARD_ACCESS', {
      path: window.location.pathname,
      timestamp: new Date().toISOString(),
    })

    // 添加键盘快捷键监听（教师专用）
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + T: 快速返回顶部
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAuthenticated, checkTeacherOnly, router, logAudit])

  // 未认证时不渲染内容
  if (!isAuthenticated || (!checkTeacherOnly() && !checkAdmin())) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-48 pt-16">
          {children}
        </main>
      </div>
      {/* AI 教研助手悬浮按钮 */}
      <AIFloatingButton />
      
      {/* 教师解压神器弹窗 - 最顶层 */}
      <WoodenFishModal />
    </div>
  )
}
