'use client'

import { useState } from 'react'
import { useResourceStore } from '@/store/resourceStore'
import { useAuthStore } from '@/store/authStore'
import type { GrowthRecord } from '@/types'
import { Plus, Calendar, Award, BookOpen, GraduationCap, Star, Trash2, Edit, FileText, X } from 'lucide-react'

const RECORD_TYPES = [
  { value: 'training', label: '培训学习', icon: GraduationCap, color: 'bg-blue-100 text-blue-600' },
  { value: 'research', label: '教研活动', icon: BookOpen, color: 'bg-green-100 text-green-600' },
  { value: 'teaching', label: '教学成果', icon: FileText, color: 'bg-purple-100 text-purple-600' },
  { value: 'honor', label: '荣誉获奖', icon: Award, color: 'bg-amber-100 text-amber-600' },
]

export default function GrowthPage() {
  const { 
    getGrowthRecordsByTeacher, 
    addGrowthRecord, 
    deleteGrowthRecord, 
    clearGrowthRecords
  } = useResourceStore()
  const { teacher } = useAuthStore()
  const [showAddModal, setShowAddModal] = useState(false)
  
  // 表单状态
  const [selectedType, setSelectedType] = useState<GrowthRecord['type']>('training')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')

  const usageInstructions = "成长档案用于记录教师的培训学习、教研活动、教学成果和荣誉获奖。点击"+"添加新记录，支持删除和分类统计。记录将同步到教师广场展示。"

  // 获取当前用户的记录
  const teacherId = teacher?.id || ''
  const allRecords = getGrowthRecordsByTeacher(teacherId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // 不再自动添加示例数据，让教师自己手动添加

  // 统计各类型数量
  const stats = RECORD_TYPES.map((type) => ({
    ...type,
    count: allRecords.filter((r) => r.type === type.value).length,
  }))

  // 获取类型配置
  const getTypeConfig = (type: GrowthRecord['type']) => {
    return RECORD_TYPES.find((t) => t.value === type) || RECORD_TYPES[0]
  }

  // 处理添加记录
  const handleAddRecord = () => {
    if (!title.trim() || !date || !teacherId) return
    
    addGrowthRecord(teacherId, {
      type: selectedType,
      title: title.trim(),
      description: description.trim(),
      date: new Date(date),
    })
    
    // 重置表单
    setTitle('')
    setDescription('')
    setDate('')
    setSelectedType('training')
    setShowAddModal(false)
  }

  // 处理删除记录
  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条成长记录吗？')) {
      console.log('Deleting record:', id, 'for teacher:', teacherId)
      deleteGrowthRecord(teacherId, id)
    }
  }

  // 清空所有记录 - 只清空当前用户的
  const handleClearAll = () => {
    if (confirm('确定要清空所有成长记录吗？此操作不可恢复！')) {
      clearGrowthRecords(teacherId)
    }
  }

  return (
    <div className="max-w-6xl mx-auto min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* 使用说明 */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg mb-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Star className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white mb-1">使用说明</h3>
            <p className="text-sm text-white/70 leading-relaxed">{usageInstructions}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">专业成长档案</h1>
          <p className="text-white/80 mt-1">记录您的教学成长轨迹，见证专业发展历程</p>
        </div>
        <div className="flex gap-2">
          {allRecords.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-500/80 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              清空
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg hover:from-blue-600 hover:to-teal-600 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            添加
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.value} className="bg-white/10 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-blue-500 to-teal-500">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stat.count}</div>
                  <div className="text-xs text-white/70">{stat.label}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 成长时间线 */}
      <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-white/20">
        <h3 className="font-semibold text-white mb-6">成长历程</h3>
        
        {allRecords.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-white" />
            </div>
            <p className="text-white/70">暂无成长记录</p>
            <p className="text-sm text-white/60 mt-1">点击"添加记录"开始记录您的专业成长</p>
          </div>
        ) : (
          <div className="space-y-6">
            {allRecords.map((record, index) => {
              const typeConfig = getTypeConfig(record.type)
              const Icon = typeConfig.icon
              
              return (
                <div key={record.id} className="flex gap-4">
                  {/* 时间线 */}
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-teal-500">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    {index < allRecords.length - 1 && (
                      <div className="w-0.5 flex-1 bg-white/20 my-2" />
                    )}
                  </div>
                  
                  {/* 内容 */}
                  <div className="flex-1 pb-6">
                    <div className="bg-white/10 p-4 rounded-xl group hover:bg-white/20 transition-colors border border-white/10">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 text-xs rounded-full bg-gradient-to-br from-blue-500 to-teal-500 text-white">
                              {typeConfig.label}
                            </span>
                            <span className="text-sm text-white/60">
                              {new Date(record.date).toLocaleDateString('zh-CN')}
                            </span>
                          </div>
                          <h4 className="font-medium text-white">{record.title}</h4>
                          {record.description && (
                            <p className="text-sm text-white/70 mt-1">{record.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(record.id)
                            }}
                            className="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="删除"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18"></path>
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                              <line x1="10" x2="10" y1="11" y2="17"></line>
                              <line x1="14" x2="14" y1="11" y2="17"></line>
                            </svg>
                          </button>
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

      {/* 添加记录弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">添加成长记录</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {/* 类型选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">记录类型</label>
                <div className="grid grid-cols-2 gap-2">
                  {RECORD_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setSelectedType(type.value as GrowthRecord['type'])}
                      className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                        selectedType === type.value
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <type.icon className="w-4 h-4" />
                      <span className="text-sm">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 标题 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="请输入记录标题"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* 日期 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* 描述 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">详细描述</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="请详细描述这次成长经历..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddRecord}
                disabled={!title.trim() || !date}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                添加记录
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
