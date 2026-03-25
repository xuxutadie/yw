'use client'

import { useParams } from 'next/navigation'
import { useResourceStore } from '@/store/resourceStore'
import { useAuthStore } from '@/store/authStore'
import Link from 'next/link'
import { ArrowLeft, Calendar, Award, BookOpen, GraduationCap, FileText, User, School } from 'lucide-react'

const RECORD_TYPES = [
  { value: 'training', label: '培训学习', icon: GraduationCap, color: 'bg-blue-100 text-blue-600' },
  { value: 'research', label: '教研活动', icon: BookOpen, color: 'bg-green-100 text-green-600' },
  { value: 'teaching', label: '教学成果', icon: FileText, color: 'bg-purple-100 text-purple-600' },
  { value: 'honor', label: '荣誉获奖', icon: Award, color: 'bg-amber-100 text-amber-600' },
]

export default function TeacherGrowthPage() {
  const params = useParams()
  const teacherId = params.id as string
  const { growthRecords } = useResourceStore()
  const { registeredTeachers } = useAuthStore()

  // 获取教师信息
  const teacher = registeredTeachers.find(t => t.id === teacherId)

  // 获取该教师的成长记录
  const teacherRecords = (growthRecords[teacherId] || [])
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // 获取类型配置
  const getTypeConfig = (type: string) => {
    return RECORD_TYPES.find((t) => t.value === type) || RECORD_TYPES[0]
  }

  // 统计各类型数量
  const stats = RECORD_TYPES.map((type) => ({
    ...type,
    count: teacherRecords.filter((r) => r.type === type.value).length,
  }))

  if (!teacher) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500">未找到该教师信息</p>
          <Link
            href="/dashboard/square"
            className="inline-flex items-center gap-1 mt-4 text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="w-4 h-4" />
            返回广场
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* 返回按钮 */}
      <Link
        href="/dashboard/square"
        className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        返回广场
      </Link>

      {/* 教师信息卡片 */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            {teacher?.avatar ? (
              <img src={teacher.avatar} alt={teacher.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-8 h-8" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{teacher.name}</h1>
            <p className="text-white/80 flex items-center gap-1">
              <School className="w-4 h-4" />
              {teacher.school || '学校未设置'}
            </p>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span>成长档案: <strong>{teacherRecords.length}</strong> 条</span>
            </div>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.value} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stat.count}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 成长时间线 */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-6">成长历程</h3>
        
        {teacherRecords.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500">该教师暂无成长记录</p>
          </div>
        ) : (
          <div className="space-y-6">
            {teacherRecords.map((record, index) => {
              const typeConfig = getTypeConfig(record.type)
              const Icon = typeConfig.icon
              
              return (
                <div key={record.id} className="flex gap-4">
                  {/* 时间线 */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${typeConfig.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {index < teacherRecords.length - 1 && (
                      <div className="w-0.5 flex-1 bg-gray-200 my-2" />
                    )}
                  </div>
                  
                  {/* 内容 */}
                  <div className="flex-1 pb-6">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 text-xs rounded-full ${typeConfig.color}`}>
                              {typeConfig.label}
                            </span>
                            <span className="text-sm text-gray-400">
                              {new Date(record.date).toLocaleDateString('zh-CN')}
                            </span>
                          </div>
                          <h4 className="font-medium text-gray-900">{record.title}</h4>
                          {record.description && (
                            <p className="text-sm text-gray-600 mt-1">{record.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
