'use client'

import { useState } from 'react'
import { useLessonStore } from '@/store/lessonStore'
import type { Lesson } from '@/types'
import { Plus, Trash2, Edit2, Palette } from 'lucide-react'

interface AnnotationToolProps {
  lesson: Lesson
}

const COLORS = [
  { name: '黄色', value: '#fef3c7', border: '#f59e0b' },
  { name: '绿色', value: '#d1fae5', border: '#10b981' },
  { name: '蓝色', value: '#dbeafe', border: '#3b82f6' },
  { name: '粉色', value: '#fce7f3', border: '#ec4899' },
  { name: '紫色', value: '#e9d5ff', border: '#a855f7' },
]

export default function AnnotationTool({ lesson }: AnnotationToolProps) {
  const { annotations, addAnnotation, updateAnnotation, deleteAnnotation, getAnnotationsByLesson } = useLessonStore()
  const lessonAnnotations = getAnnotationsByLesson(lesson.id)

  const [selectedText, setSelectedText] = useState('')
  const [newAnnotation, setNewAnnotation] = useState('')
  const [selectedColor, setSelectedColor] = useState(COLORS[0])
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleAddAnnotation = () => {
    if (!newAnnotation.trim()) return

    addAnnotation({
      lessonId: lesson.id,
      teacherId: '1',
      content: newAnnotation,
      position: { start: 0, end: 0 }, // 简化版本，不记录具体位置
      color: selectedColor.value,
    })

    setNewAnnotation('')
    setSelectedText('')
  }

  const handleDelete = (id: string) => {
    if (confirm('确定删除此标注吗？')) {
      deleteAnnotation(id)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">备课标注 - {lesson.title}</h2>
        <span className="text-sm text-white/70">共 {lessonAnnotations.length} 条标注</span>
      </div>

      {/* 添加新标注 */}
      <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 mb-6">
        <h3 className="font-semibold text-white mb-4">添加标注</h3>
        
        {/* 颜色选择 */}
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-4 h-4 text-white/70" />
          <span className="text-sm text-white/80 mr-2">标注颜色：</span>
          {COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => setSelectedColor(color)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                selectedColor.value === color.value ? 'border-white scale-110' : 'border-white/30'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>

        <textarea
          value={newAnnotation}
          onChange={(e) => setNewAnnotation(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 bg-white/90 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 mb-4"
          placeholder="输入备课标注内容..."
        />

        <button
          onClick={handleAddAnnotation}
          disabled={!newAnnotation.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg hover:from-blue-600 hover:to-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          <Plus className="w-4 h-4" />
          添加标注
        </button>
      </div>

      {/* 标注列表 */}
      <div className="space-y-3">
        {lessonAnnotations.length === 0 ? (
          <div className="text-center py-12 text-white/60">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Palette className="w-8 h-8 text-white/40" />
            </div>
            <p className="text-white/80">暂无备课标注</p>
            <p className="text-sm mt-1 text-white/60">添加您的第一条备课标注吧</p>
          </div>
        ) : (
          lessonAnnotations.map((annotation) => (
            <div
              key={annotation.id}
              className="p-4 rounded-xl border-l-4 transition-all hover:shadow-md"
              style={{
                backgroundColor: annotation.color,
                borderLeftColor: COLORS.find((c) => c.value === annotation.color)?.border || '#f59e0b',
              }}
            >
              {editingId === annotation.id ? (
                <div className="space-y-3">
                  <textarea
                    defaultValue={annotation.content}
                    className="w-full px-3 py-2 bg-white/90 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded text-sm hover:from-blue-600 hover:to-teal-600"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 bg-white/20 text-white rounded text-sm hover:bg-white/30"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-gray-900 whitespace-pre-wrap">{annotation.content}</p>
                    <p className="text-xs text-white/70 mt-2">
                      {new Date(annotation.createdAt).toLocaleString('zh-CN')}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <button
                      onClick={() => setEditingId(annotation.id)}
                      className="p-1.5 text-white/70 hover:text-blue-400 hover:bg-white/20 rounded transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(annotation.id)}
                      className="p-1.5 text-white/70 hover:text-red-400 hover:bg-white/20 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
