/**
 * 安全工具函数
 * 数据加密、敏感信息过滤等
 */

/**
 * 敏感信息脱敏
 */
export function maskSensitiveInfo(text: string): string {
  // 手机号脱敏
  let result = text.replace(/(\d{3})\d{4}(\d{4})/g, '$1****$2')
  
  // 邮箱脱敏
  result = result.replace(/(\w{2})\w+(@\w+\.\w+)/g, '$1***$2')
  
  // 身份证号脱敏
  result = result.replace(/(\d{4})\d{10}(\d{4})/g, '$1**********$2')
  
  return result
}

/**
 * 检查是否包含敏感词
 */
export function containsSensitiveWords(text: string): boolean {
  const sensitiveWords = [
    '学生姓名',
    '家长电话',
    '学生成绩',
    '学生排名',
    '未成年人',
    '儿童信息',
  ]
  
  const lowerText = text.toLowerCase()
  return sensitiveWords.some((word) => lowerText.includes(word.toLowerCase()))
}

/**
 * 数据清理
 * 移除可能包含学生信息的数据
 */
export function sanitizeData<T extends Record<string, unknown>>(data: T): Partial<T> {
  const forbiddenKeys = [
    'studentId',
    'studentName',
    'parentName',
    'parentPhone',
    'childInfo',
    'minorInfo',
    'classRoster',
    'studentList',
  ]
  
  const sanitized = { ...data }
  
  for (const key of forbiddenKeys) {
    delete sanitized[key]
  }
  
  return sanitized
}

/**
 * 生成安全的数据ID
 */
export function generateSecureId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
}

/**
 * 验证教师身份
 * 在实际应用中，这里应该调用后端API
 */
export async function verifyTeacherIdentity(teacherId: string): Promise<boolean> {
  // 模拟验证
  return teacherId.startsWith('teacher-') || teacherId.length > 0
}

/**
 * 本地存储安全包装
 * 防止XSS攻击
 */
export const secureStorage = {
  setItem(key: string, value: unknown): void {
    try {
      const serialized = JSON.stringify(value)
      // 基础XSS防护
      const sanitized = serialized
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e')
      localStorage.setItem(key, sanitized)
    } catch (error) {
      console.error('Storage error:', error)
    }
  },
  
  getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key)
      if (!item) return null
      return JSON.parse(item) as T
    } catch {
      return null
    }
  },
  
  removeItem(key: string): void {
    localStorage.removeItem(key)
  },
}

/**
 * 输入验证
 */
export function validateInput(input: string, type: 'text' | 'email' | 'password'): boolean {
  const patterns = {
    text: /^[\u4e00-\u9fa5a-zA-Z0-9\s\.,;:!?"'(){}，。；：！？""''（）]{1,5000}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  }
  
  return patterns[type].test(input)
}

/**
 * 防爬虫检测
 */
export function detectBot(userAgent: string): boolean {
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
  ]
  
  return botPatterns.some((pattern) => pattern.test(userAgent))
}
