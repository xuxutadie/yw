import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Teacher, UserRole } from '@/types'

interface RegisterData {
  name: string
  email: string
  password: string
  school: string
  grade: number
}

interface DeletedTeacher {
  id: string
  name: string
  email: string
  school: string
  deletedAt: Date
  recordCount: number // 注销时的成长档案数量
}

interface AuthState {
  // 当前用户
  teacher: Teacher | null
  isAuthenticated: boolean
  isAdmin: boolean
  registeredTeachers: Teacher[]
  deletedTeachers: DeletedTeacher[] // 已注销的教师记录
  
  // 认证方法
  login: (email: string, password: string) => Promise<boolean>
  adminLogin: (email: string, password: string) => Promise<boolean>
  register: (data: RegisterData) => Promise<boolean>
  logout: () => void
  updateProfile: (updates: Partial<Teacher>) => void
  updateTeacher: (updates: Partial<Teacher>) => void
  
  // 安全检查
  checkTeacherOnly: () => boolean
  checkAdmin: () => boolean
  
  // 管理员功能
  getAllTeachers: () => Teacher[]
  deleteTeacher: (teacherId: string) => boolean
  
  // 注销记录功能
  recordDeletedTeacher: (teacher: Teacher, recordCount: number) => void
  getDeletedTeachers: () => DeletedTeacher[]
  getDeletedTeacherCount: () => number
  clearDeletedTeachers: () => void
  
  // 教师解压神器
  showWoodenFish: boolean
  setShowWoodenFish: (show: boolean) => void
}

// 模拟教师数据 - 实际项目中应从后端API获取
const MOCK_TEACHERS: Teacher[] = [
  {
    id: '1',
    name: '张老师',
    email: 'teacher@school.edu.cn',
    role: 'teacher',
    school: '实验小学',
    grade: 3,
    subject: 'chinese',
    createdAt: new Date('2023-09-01'),
    lastLoginAt: new Date(),
  }
]

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      teacher: null,
      isAuthenticated: false,
      isAdmin: false,
      registeredTeachers: [...MOCK_TEACHERS],
      deletedTeachers: [],
      showWoodenFish: false,

      login: async (email: string, password: string) => {
        // 强制从 localStorage 重新加载最新数据，解决 persist 中间件恢复问题
        try {
          const stored = localStorage.getItem('teacher-auth-storage')
          if (stored) {
            const parsed = JSON.parse(stored)
            if (parsed.state?.registeredTeachers) {
              // 使用 localStorage 中的最新数据更新状态
              set({ registeredTeachers: parsed.state.registeredTeachers })
              console.log('从 localStorage 重新加载了教师数据:', parsed.state.registeredTeachers.length)
            }
          }
        } catch (e) {
          console.error('读取 localStorage 失败:', e)
        }
        
        // 从最新的持久化状态中读取
        const state = get()
        const registeredTeachers = state.registeredTeachers
        
        console.log('登录时 registeredTeachers 数量:', registeredTeachers.length)
        console.log('登录时 registeredTeachers 数据:', registeredTeachers.map(t => ({
          id: t.id,
          email: t.email,
          name: t.name,
          hasAvatar: !!t.avatar
        })))
        
        // 查找已注册的教师
        const teacher = registeredTeachers.find(t => t.email === email)
        if (teacher) {
          console.log('登录成功，教师数据:', {
            id: teacher.id,
            name: teacher.name,
            hasAvatar: !!teacher.avatar,
            avatar: teacher.avatar?.substring(0, 50) + '...'
          })
          set({
            teacher: { ...teacher, lastLoginAt: new Date() },
            isAuthenticated: true,
            isAdmin: false,
          })
          return true
        }
        console.log('登录失败：未找到教师，邮箱:', email)
        return false
      },

      adminLogin: async (phone: string, password: string) => {
        // 管理员账号验证
        if (phone === '18690755101' && password === 'xxsy666') {
          set({
            teacher: {
              id: 'admin',
              name: '系统管理员',
              email: 'admin@system.com',
              role: 'admin',
              school: '系统管理',
              grade: 0,
              subject: 'chinese',
              createdAt: new Date(),
              lastLoginAt: new Date(),
            },
            isAuthenticated: true,
            isAdmin: true,
          })
          return true
        }
        return false
      },

      register: async (data: RegisterData) => {
        const { registeredTeachers } = get()
        
        // 检查邮箱是否已被注册
        const existingTeacher = registeredTeachers.find(t => t.email === data.email)
        if (existingTeacher) {
          return false
        }
        
        // 创建新教师账号
        const newTeacher: Teacher = {
          id: Date.now().toString(),
          name: data.name,
          email: data.email,
          role: 'teacher',
          school: data.school,
          grade: data.grade,
          subject: 'chinese',
          createdAt: new Date(),
          lastLoginAt: new Date(),
        }
        
        set({
          registeredTeachers: [...registeredTeachers, newTeacher],
        })
        
        return true
      },

      logout: () => {
        console.log('退出登录，清空所有数据')
        set({ 
          teacher: null, 
          isAuthenticated: false, 
          isAdmin: false 
        })
      },

      updateProfile: (updates: Partial<Teacher>) => {
        const { teacher, registeredTeachers } = get()
        if (teacher) {
          const updatedTeacher = { ...teacher, ...updates }
          set({ 
            teacher: updatedTeacher,
            registeredTeachers: registeredTeachers.map(t => 
              t.id === teacher.id ? updatedTeacher : t
            )
          })
        }
      },

      updateTeacher: (updates: Partial<Teacher>) => {
        const { teacher, registeredTeachers } = get()
        if (teacher) {
          const updatedTeacher = { ...teacher, ...updates }
          console.log('更新教师数据:', {
            id: teacher.id,
            name: teacher.name,
            updateKeys: Object.keys(updates),
            hasAvatarInUpdates: !!updates.avatar,
            newAvatar: updates.avatar?.substring(0, 50) + '...'
          })
          console.log('更新前 registeredTeachers 中该教师的 avatar:', 
            registeredTeachers.find(t => t.id === teacher.id)?.avatar ? '有' : '无')
          
          set({ 
            teacher: updatedTeacher,
            registeredTeachers: registeredTeachers.map(t => 
              t.id === teacher.id ? updatedTeacher : t
            )
          })
          
          console.log('更新后 registeredTeachers 中该教师的 avatar:', 
            registeredTeachers.map(t => t.id === teacher.id ? updatedTeacher : t).find(t => t.id === teacher.id)?.avatar ? '有' : '无')
        }
      },

      // 核心安全验证：确保只有教师可以访问
      checkTeacherOnly: () => {
        const { teacher, isAuthenticated } = get()
        // 严格验证：必须已认证且角色为教师
        return isAuthenticated && teacher !== null && teacher.role === 'teacher'
      },

      // 检查是否为管理员
      checkAdmin: () => {
        const { isAuthenticated, isAdmin } = get()
        return isAuthenticated && isAdmin
      },
      
      // 获取所有教师账号（管理员功能）
      getAllTeachers: () => {
        const { registeredTeachers } = get()
        return registeredTeachers
      },
      
      // 删除教师账号（管理员功能）
      deleteTeacher: (teacherId: string) => {
        const { registeredTeachers, teacher } = get()
        // 不能删除自己
        if (teacher?.id === teacherId) {
          return false
        }
        set({
          registeredTeachers: registeredTeachers.filter(t => t.id !== teacherId)
        })
        return true
      },

      // 记录注销的教师
      recordDeletedTeacher: (teacher: Teacher, recordCount: number) => {
        const { deletedTeachers } = get()
        const deletedTeacher: DeletedTeacher = {
          id: teacher.id,
          name: teacher.name,
          email: teacher.email,
          school: teacher.school || '未知学校',
          deletedAt: new Date(),
          recordCount,
        }
        set({
          deletedTeachers: [...deletedTeachers, deletedTeacher]
        })
      },

      // 获取所有已注销的教师
      getDeletedTeachers: () => {
        return get().deletedTeachers
      },

      // 获取已注销教师数量
      getDeletedTeacherCount: () => {
        return get().deletedTeachers.length
      },

      // 清除所有已注销教师记录
      clearDeletedTeachers: () => {
        set({ deletedTeachers: [] })
      },

      // 设置教师解压神器显示状态
      setShowWoodenFish: (show: boolean) => {
        set({ showWoodenFish: show })
      },
    }),
    {
      name: 'teacher-auth-storage',
      // 只持久化必要信息
      partialize: (state) => ({
        teacher: state.teacher,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
        registeredTeachers: state.registeredTeachers,
        deletedTeachers: state.deletedTeachers,
      }),
    }
  )
)

// 教师认证守卫Hook
export const useTeacherGuard = () => {
  const { teacher, isAuthenticated, checkTeacherOnly } = useAuthStore()
  
  return {
    isTeacher: checkTeacherOnly(),
    teacher,
    isAuthenticated,
    // 严格检查是否为教师
    requireTeacher: () => {
      if (!checkTeacherOnly()) {
        throw new Error('访问被拒绝：仅教师用户可访问此功能')
      }
      return true
    }
  }
}
