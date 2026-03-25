'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useResourceStore } from '@/store/resourceStore'
import { useState } from 'react'
import {
  BookOpen,
  FileText,
  PenTool,
  Brain,
  FolderOpen,
  Award,
  MessageSquare,
  Settings,
  Users,
  Shield,
  LayoutDashboard,
  Globe,
  LogOut,
  AlertTriangle,
  UserX,
  Circle,
} from 'lucide-react'





// 教师菜单
const teacherMenuItems = [
  {
    title: '仪表板',
    icon: LayoutDashboard,
    href: '/dashboard',
    description: '返回主页面',
  },
  {
    title: '备课中心',
    icon: BookOpen,
    href: '/dashboard/lesson',
    description: '教材与教案',
  },
  {
    title: '出题组卷',
    icon: FileText,
    href: '/dashboard/questions',
    description: '智能出卷系统',
  },
  {
    title: '作文批改',
    icon: PenTool,
    href: '/dashboard/essay',
    description: 'AI批改辅助',
  },
  {
    title: '学情分析',
    icon: Brain,
    href: '/dashboard/analysis',
    description: '班级学情统计',
  },
  {
    title: '资源库',
    icon: FolderOpen,
    href: '/dashboard/resources',
    description: '个人教学资源',
  },
  {
    title: '成长档案',
    icon: Award,
    href: '/dashboard/growth',
    description: '专业发展记录',
  },
  {
    title: '教师广场',
    icon: Globe,
    href: '/dashboard/square',
    description: '分享成长足迹',
  },
]

// 管理员菜单
const adminMenuItems = [
  {
    title: '仪表板',
    icon: LayoutDashboard,
    href: '/dashboard',
    description: '返回主页面',
  },
  {
    title: '账号管理',
    icon: Users,
    href: '/dashboard/admin',
    description: '管理系统账号',
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const authStore = useAuthStore()
  const { isAdmin, teacher, deleteTeacher, logout, clearDeletedTeachers, setShowWoodenFish } = authStore
  const { clearGrowthRecords } = useResourceStore()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showDeletedList, setShowDeletedList] = useState(false)
  
  // 安全获取注销记录
  const getDeletedTeachers = () => {
    return authStore.getDeletedTeachers?.() || []
  }
  
  const getDeletedTeacherCount = () => {
    return authStore.getDeletedTeacherCount?.() || 0
  }
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  // 根据角色选择菜单
  const menuItems = isAdmin ? adminMenuItems : teacherMenuItems

  // 处理注销账号
  const handleDeleteAccount = () => {
    if (teacher) {
      // 获取该教师的成长记录数量
      const { growthRecords } = useResourceStore.getState()
      const recordCount = (growthRecords[teacher.id] || []).length
      
      // 记录注销信息（在删除之前记录）
      const { recordDeletedTeacher } = useAuthStore.getState()
      recordDeletedTeacher(teacher, recordCount)
      
      // 删除该教师的成长记录
      clearGrowthRecords(teacher.id)
      // 删除教师账号
      deleteTeacher(teacher.id)
      // 登出
      logout()
      // 跳转到登录页
      router.push('/login')
    }
  }

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-48 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-y-auto">
      <nav className="p-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white border-l-4 border-white shadow-lg'
                  : 'text-white/90 hover:bg-gradient-to-r hover:from-blue-600/50 hover:to-teal-600/50'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-white/80'}`} />
              <div className="flex-1">
                <p className="font-medium">{item.title}</p>
              </div>
            </Link>
          )
        })}

        {/* 教师解压神器 - 所有用户可见 */}
        <button
          onClick={() => setShowWoodenFish(true)}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white hover:bg-gradient-to-r hover:from-blue-600/50 hover:to-teal-600/50 transition-colors mt-2 text-sm"
        >
          <div className="flex-1 text-left">
            <p className="font-medium">教师解压神器</p>
          </div>
        </button>

        {/* 注销账号按钮 - 只有教师角色显示 */}
        {!isAdmin && (
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white hover:bg-gradient-to-r hover:from-blue-600/50 hover:to-teal-600/50 transition-colors mt-2 text-sm"
          >
            <LogOut className="w-5 h-5" />
            <div className="flex-1 text-left">
              <p className="font-medium">注销账号</p>
            </div>
          </button>
        )}

        {/* 已注销教师统计 - 只有管理员显示 */}
        {isAdmin && (
          <button
            onClick={() => setShowDeletedList(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white hover:bg-gradient-to-r hover:from-blue-600/50 hover:to-teal-600/50 transition-colors mt-2 text-sm"
          >
            <UserX className="w-5 h-5" />
            <div className="flex-1 text-left">
              <p className="font-medium">已注销教师</p>
            </div>
          </button>
        )}
      </nav>

      {/* 注销账号确认弹窗 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">确认注销账号？</h3>
                <p className="text-sm text-gray-500">此操作不可恢复</p>
              </div>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-700">
                注销后，您的账号信息和所有成长档案记录将被永久删除，无法恢复。确定要继续吗？
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                否，保留账号
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                是，注销账号
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 已注销教师列表弹窗 */}
      {showDeletedList && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">已注销教师列表</h3>
                <p className="text-sm text-gray-500">共 {getDeletedTeacherCount()} 位教师已注销账号</p>
              </div>
              <div className="flex items-center gap-2">
                {getDeletedTeachers().length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('确定要清除所有已注销教师记录吗？此操作不可恢复。')) {
                        clearDeletedTeachers()
                        setShowDeletedList(false)
                      }
                    }}
                    className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    清除记录
                  </button>
                )}
                <button
                  onClick={() => setShowDeletedList(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              {getDeletedTeachers().length === 0 ? (
                <div className="text-center py-12">
                  <UserX className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">暂无注销记录</p>
                  <p className="text-sm text-gray-400 mt-1">教师自主注销的账号将显示在这里</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getDeletedTeachers().map((deleted, index) => (
                    <div key={deleted.id} className="bg-gray-50 rounded-lg p-4 flex items-center gap-4">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-600 font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{deleted.name}</span>
                          <span className="text-sm text-gray-500">({deleted.email})</span>
                        </div>
                        <div className="text-sm text-gray-500">{deleted.school}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          档案: <span className="font-medium">{deleted.recordCount}</span> 条
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatDate(deleted.deletedAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowDeletedList(false)}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

    </aside>
  )
}
