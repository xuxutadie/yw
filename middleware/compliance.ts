import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

/**
 * 合规性检查中间件
 * 确保只有教师可以访问，阻止学生/家长入口
 */

// 禁止的路径模式 - 确保没有学生/家长入口
const FORBIDDEN_PATHS = [
  '/student',
  '/parent',
  '/pupil',
  '/kid',
  '/children',
]

// 教师专属路径
const TEACHER_ONLY_PATHS = [
  '/dashboard',
  '/lesson',
  '/questions',
  '/essay',
  '/analysis',
  '/resources',
  '/growth',
  '/ai-assistant',
]

export function complianceMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. 检查是否为禁止路径
  for (const forbiddenPath of FORBIDDEN_PATHS) {
    if (pathname.startsWith(forbiddenPath)) {
      return new NextResponse(
        JSON.stringify({
          error: 'Access Denied',
          message: '本工具仅限教师使用，无学生/家长入口',
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }
  }

  // 2. 为所有响应添加合规性头部
  const response = NextResponse.next()
  
  // 添加安全头部
  response.headers.set('X-Teacher-Only', 'true')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // 3. 添加内容安全策略
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  )

  return response
}

/**
 * 检查用户是否为教师
 * 在实际应用中，这里应该验证用户的认证状态和角色
 */
export function isTeacher(request: NextRequest): boolean {
  // 获取认证令牌
  const authToken = request.cookies.get('teacher-auth-storage')?.value
  
  if (!authToken) {
    return false
  }

  try {
    // 解析存储的认证信息
    const authData = JSON.parse(authToken)
    
    // 严格检查：必须已认证且角色为teacher
    return authData.state?.isAuthenticated === true && 
           authData.state?.teacher?.role === 'teacher'
  } catch {
    return false
  }
}

/**
 * 数据安全检查
 * 确保不收集未成年人信息
 */
export function validateDataSafety(data: unknown): { valid: boolean; error?: string } {
  // 检查数据是否包含敏感的学生信息字段
  const sensitiveFields = [
    'studentName',
    'studentId',
    'parentName',
    'parentPhone',
    'childName',
    'childAge',
    'minor',
    'under18',
  ]

  const dataStr = JSON.stringify(data).toLowerCase()
  
  for (const field of sensitiveFields) {
    if (dataStr.includes(field.toLowerCase())) {
      return {
        valid: false,
        error: `数据包含敏感字段: ${field}，本工具不收集未成年人信息`,
      }
    }
  }

  return { valid: true }
}

/**
 * 审计日志
 * 记录关键操作以便合规审查
 */
export function auditLog(action: string, details: Record<string, unknown>) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    details,
    userType: 'teacher',
  }
  
  // 在实际应用中，这里应该将日志发送到审计系统
  if (process.env.NODE_ENV === 'development') {
    console.log('[Audit Log]', logEntry)
  }
}
