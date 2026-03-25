'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Users, Trash2, Shield, School, Mail, Calendar, ArrowLeft } from 'lucide-react'
import type { Teacher } from '@/types'

export default function AdminPage() {
  const router = useRouter()
  const { checkAdmin, getAllTeachers, deleteTeacher, teacher: currentAdmin } = useAuthStore()
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    // 检查是否为管理员
    const isAdmin = checkAdmin()
    if (!isAdmin) {
      router.push('/dashboard')
      return
    }

    // 获取所有教师账号
    try {
      const allTeachers = getAllTeachers()
      setTeachers(allTeachers)
    } catch (error) {
      console.error('获取教师列表失败:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleDelete = (teacherId: string) => {
    if (deleteConfirm === teacherId) {
      const success = deleteTeacher(teacherId)
      if (success) {
        setTeachers(teachers.filter(t => t.id !== teacherId))
        setDeleteConfirm(null)
      }
    } else {
      setDeleteConfirm(teacherId)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* 页面标题 */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-white/80 hover:text-white mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          返回仪表板
        </button>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">账号管理</h1>
            <p className="text-white/70">管理系统所有教师账号</p>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">总账号数</p>
              <p className="text-2xl font-bold text-gray-900">{teachers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <School className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">教师账号</p>
              <p className="text-2xl font-bold text-gray-900">
                {teachers.filter(t => t.role === 'teacher').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">管理员账号</p>
              <p className="text-2xl font-bold text-gray-900">
                {teachers.filter(t => t.role === 'admin').length}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* 账号列表 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">教师账号列表</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">教师信息</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">学校/年级</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">角色</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">注册时间</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">最后登录</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {teachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {teacher.avatar ? (
                        <img 
                          src={teacher.avatar} 
                          alt={teacher.name} 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-medium">
                            {teacher.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{teacher.name}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {teacher.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{teacher.school || '-'}</div>
                    <div className="text-sm text-gray-500">
                      {teacher.grade ? `${teacher.grade}年级` : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        teacher.role === 'admin'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {teacher.role === 'admin' ? '管理员' : '教师'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {formatDate(teacher.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {formatDate(teacher.lastLoginAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {teacher.id !== currentAdmin?.id && (
                      <button
                        onClick={() => handleDelete(teacher.id)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          deleteConfirm === teacher.id
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                        {deleteConfirm === teacher.id ? '确认删除' : '删除'}
                      </button>
                    )}
                    {teacher.id === currentAdmin?.id && (
                      <span className="text-sm text-gray-400">当前账号</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {teachers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无教师账号</p>
          </div>
        )}
      </div>
    </div>
  )
}
