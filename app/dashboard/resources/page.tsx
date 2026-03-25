'use client'

import { useState } from 'react'
import { useResourceStore } from '@/store/resourceStore'
import type { Resource } from '@/types'
import { Plus, Search, Folder, FileText, Video, BookOpen, Download, Trash2, File, X } from 'lucide-react'

const RESOURCE_TYPES = [
  { value: 'all', label: '全部', icon: Folder },
  { value: 'lesson_plan', label: '教案', icon: FileText },
  { value: 'courseware', label: '课件', icon: BookOpen },
  { value: 'question', label: '试题', icon: FileText },
  { value: 'material', label: '素材', icon: Folder },
  { value: 'video', label: '视频', icon: Video },
  { value: 'pdf', label: 'PDF教材', icon: FileText },
]

// 示例资源
const SAMPLE_RESOURCES: Resource[] = [
  {
    id: 'sample-pdf-1',
    teacherId: '1',
    title: '四年级下册语文教材',
    type: 'pdf',
    content: '部编人教版四年级下册完整教材PDF，包含全部课文、生字表、词语表等教学资源',
    tags: ['教材', 'PDF', '四年级', '下册'],
    grade: 4,
    isPublic: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
]

export default function ResourcesPage() {
  const { resources, addResource, deleteResource } = useResourceStore()
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)

  // 表单状态
  const [newResourceTitle, setNewResourceTitle] = useState('')
  const [newResourceType, setNewResourceType] = useState<Resource['type']>('lesson_plan')
  const [newResourceDesc, setNewResourceDesc] = useState('')
  const [newResourceGrade, setNewResourceGrade] = useState<number>(1)
  const [newResourceTags, setNewResourceTags] = useState('')

  // 合并示例资源和存储的资源
  const allResources = [...SAMPLE_RESOURCES, ...resources]

  // 筛选资源
  const filteredResources = allResources.filter((r) => {
    const matchKeyword = r.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                        r.tags.some((tag) => tag.toLowerCase().includes(searchKeyword.toLowerCase()))
    const matchType = filterType === 'all' || r.type === filterType
    return matchKeyword && matchType
  })

  // 获取资源类型图标
  const getResourceIcon = (type: Resource['type']) => {
    const typeConfig = RESOURCE_TYPES.find((t) => t.value === type)
    const Icon = typeConfig?.icon || Folder
    return <Icon className="w-5 h-5" />
  }

  // 获取资源类型颜色
  const getResourceColor = (type: Resource['type']) => {
    const colors: Record<string, string> = {
      lesson_plan: 'bg-blue-100 text-blue-600',
      courseware: 'bg-purple-100 text-purple-600',
      question: 'bg-green-100 text-green-600',
      material: 'bg-amber-100 text-amber-600',
      video: 'bg-red-100 text-red-600',
      pdf: 'bg-orange-100 text-orange-600',
    }
    return colors[type] || 'bg-gray-100 text-gray-600'
  }

  // 获取资源类型标签
  const getResourceTypeLabel = (type: Resource['type']) => {
    const typeConfig = RESOURCE_TYPES.find((t) => t.value === type)
    return typeConfig?.label || '其他'
  }

  // 打开 PDF
  const openPDF = () => {
    window.location.href = '/resources/sample-teaching-material.pdf'
  }

  // 处理添加资源
  const handleAddResource = () => {
    if (!newResourceTitle.trim()) {
      alert('请输入资源名称')
      return
    }

    const tags = newResourceTags.split(/[,，]/).map(t => t.trim()).filter(t => t)

    addResource({
      teacherId: '1',
      title: newResourceTitle.trim(),
      type: newResourceType,
      content: newResourceDesc.trim(),
      tags: tags.length > 0 ? tags : [getResourceTypeLabel(newResourceType)],
      grade: newResourceGrade,
      isPublic: false,
    })

    // 重置表单
    setNewResourceTitle('')
    setNewResourceType('lesson_plan')
    setNewResourceDesc('')
    setNewResourceGrade(1)
    setNewResourceTags('')
    setShowAddModal(false)
  }

  // 取消添加
  const handleCancel = () => {
    setNewResourceTitle('')
    setNewResourceType('lesson_plan')
    setNewResourceDesc('')
    setNewResourceGrade(1)
    setNewResourceTags('')
    setShowAddModal(false)
  }

  return (
    <div className="max-w-6xl mx-auto min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">个人资源库</h1>
          <p className="text-white/80 mt-1">管理您的教学资源，随时随地快速调用</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          添加资源
        </button>
      </div>

      {/* 筛选栏 */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="搜索资源名称或标签..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {RESOURCE_TYPES.map((type) => {
              const Icon = type.icon
              return (
                <button
                  key={type.value}
                  onClick={() => setFilterType(type.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    filterType === type.value
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {type.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* 资源列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((resource) => (
          <div
            key={resource.id}
            onClick={() => {
              if (resource.type === 'pdf') {
                openPDF()
              } else {
                alert('该资源暂不支持预览')
              }
            }}
            className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getResourceColor(resource.type)}`}>
                {getResourceIcon(resource.type)}
              </div>
              <div className="flex items-center gap-1">
                {/* 所有资源都显示下载按钮 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (resource.type === 'pdf') {
                      openPDF()
                    } else {
                      alert('该资源暂不支持下载')
                    }
                  }}
                  className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors"
                  title="下载"
                >
                  <Download className="w-4 h-4" />
                </button>
                {/* 只有非PDF资源显示删除按钮 */}
                {resource.type !== 'pdf' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteResource(resource.id)
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{resource.title}</h3>
            <p className="text-sm text-gray-500 mb-3 line-clamp-2">{resource.content || '暂无描述'}</p>
            <div className="flex flex-wrap gap-1 mb-3">
              {resource.tags.map((tag, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">{tag}</span>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{resource.grade}年级</span>
              <span>{new Date(resource.createdAt).toLocaleDateString('zh-CN')}</span>
            </div>
          </div>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <Folder className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">暂无资源</p>
          <p className="text-sm text-gray-400 mt-1">点击&quot;添加资源&quot;开始创建</p>
        </div>
      )}

      {/* 添加资源弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">添加新资源</h2>
              <button
                onClick={handleCancel}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">资源名称 *</label>
                <input
                  type="text"
                  value={newResourceTitle}
                  onChange={(e) => setNewResourceTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="请输入资源名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">资源类型</label>
                <select
                  value={newResourceType}
                  onChange={(e) => setNewResourceType(e.target.value as Resource['type'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  {RESOURCE_TYPES.filter(t => t.value !== 'all').map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">适用年级</label>
                <select
                  value={newResourceGrade}
                  onChange={(e) => setNewResourceGrade(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  {[1, 2, 3, 4, 5, 6].map((grade) => (
                    <option key={grade} value={grade}>{grade}年级</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">标签</label>
                <input
                  type="text"
                  value={newResourceTags}
                  onChange={(e) => setNewResourceTags(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="用逗号分隔，如：古诗,背诵,技巧"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">资源描述</label>
                <textarea
                  rows={3}
                  value={newResourceDesc}
                  onChange={(e) => setNewResourceDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="请输入资源描述"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={handleAddResource}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
