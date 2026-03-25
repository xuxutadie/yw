import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

/**
 * 合规性检查Hook
 * 确保组件级别也进行合规检查
 */

export function useCompliance() {
  const { isAuthenticated, teacher, checkTeacherOnly } = useAuthStore()

  useEffect(() => {
    // 检查是否为教师用户
    if (!checkTeacherOnly()) {
      console.warn('Compliance Warning: Non-teacher access detected')
    }

    // 添加页面可见性检查
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // 页面重新可见时，重新验证身份
        if (!checkTeacherOnly()) {
          window.location.href = '/'
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [checkTeacherOnly])

  // 检查数据收集合规性
  const validateDataCollection = (data: unknown): boolean => {
    const dataStr = JSON.stringify(data).toLowerCase()
    
    // 禁止收集的字段
    const forbiddenPatterns = [
      'studentname',
      'studentid',
      'parentname',
      'parentphone',
      'child',
      'minor',
      'under18',
    ]
    
    for (const pattern of forbiddenPatterns) {
      if (dataStr.includes(pattern)) {
        console.error(`Compliance Error: Attempted to collect forbidden data: ${pattern}`)
        return false
      }
    }
    
    return true
  }

  // 记录审计日志
  const logAudit = (action: string, details: Record<string, unknown>) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Audit]', {
        timestamp: new Date().toISOString(),
        action,
        details,
        teacherId: teacher?.id,
      })
    }
  }

  return {
    isCompliant: checkTeacherOnly(),
    validateDataCollection,
    logAudit,
    teacherRole: teacher?.role,
  }
}

/**
 * 教师专用组件包装器
 */
export function useTeacherOnly() {
  const { checkTeacherOnly } = useAuthStore()

  if (!checkTeacherOnly()) {
    throw new Error('Access Denied: Teacher only feature')
  }

  return true
}
