'use client'

import { useState } from 'react'
import { useLessonStore } from '@/store/lessonStore'
import type { Lesson, TeachingPlan, TeachingProcedure } from '@/types'
import { Save, Plus, Trash2 } from 'lucide-react'

interface TeachingPlanEditorProps {
  lesson: Lesson
}

export default function TeachingPlanEditor({ lesson }: TeachingPlanEditorProps) {
  const { getTeachingPlanByLesson, saveTeachingPlan } = useLessonStore()
  const existingPlan = getTeachingPlanByLesson(lesson.id)

  const [objectives, setObjectives] = useState<string[]>(existingPlan?.objectives || [''])
  const [keyPoints, setKeyPoints] = useState<string[]>(existingPlan?.keyPoints || [''])
  const [difficulties, setDifficulties] = useState<string[]>(existingPlan?.difficulties || [''])
  const [procedures, setProcedures] = useState<TeachingProcedure[]>(
    existingPlan?.procedures || [{ step: 1, title: '', content: '', duration: 5, method: '' }]
  )
  const [homework, setHomework] = useState(existingPlan?.homework || '')
  const [reflection, setReflection] = useState(existingPlan?.reflection || '')

  const handleSave = () => {
    saveTeachingPlan({
      lessonId: lesson.id,
      teacherId: '1', // 当前教师ID
      objectives: objectives.filter(Boolean),
      keyPoints: keyPoints.filter(Boolean),
      difficulties: difficulties.filter(Boolean),
      procedures: procedures.filter((p) => p.title || p.content),
      homework,
      reflection,
    })
    alert('教案保存成功！')
  }

  const addProcedure = () => {
    setProcedures([
      ...procedures,
      { step: procedures.length + 1, title: '', content: '', duration: 5, method: '' },
    ])
  }

  const updateProcedure = (index: number, field: keyof TeachingProcedure, value: string | number) => {
    const updated = [...procedures]
    updated[index] = { ...updated[index], [field]: value }
    setProcedures(updated)
  }

  const removeProcedure = (index: number) => {
    setProcedures(procedures.filter((_, i) => i !== index).map((p, i) => ({ ...p, step: i + 1 })))
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">教案设计 - {lesson.title}</h2>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg hover:from-blue-600 hover:to-teal-600 transition-colors shadow-md"
        >
          <Save className="w-4 h-4" />
          保存教案
        </button>
      </div>

      <div className="space-y-6">
        {/* 教学目标 */}
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
          <h3 className="font-semibold text-white mb-4">教学目标</h3>
          <div className="space-y-2">
            {objectives.map((obj, index) => (
              <div key={index} className="flex gap-2">
                <span className="text-white/60 w-8">{index + 1}.</span>
                <input
                  type="text"
                  value={obj}
                  onChange={(e) => {
                    const updated = [...objectives]
                    updated[index] = e.target.value
                    setObjectives(updated)
                  }}
                  className="flex-1 px-3 py-2 bg-white/90 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder={`教学目标 ${index + 1}`}
                />
              </div>
            ))}
            <button
              onClick={() => setObjectives([...objectives, ''])}
              className="text-blue-400 text-sm hover:underline"
            >
              + 添加目标
            </button>
          </div>
        </div>

        {/* 教学重难点 */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
            <h3 className="font-semibold text-white mb-4">教学重点</h3>
            <div className="space-y-2">
              {keyPoints.map((point, index) => (
                <input
                  key={index}
                  type="text"
                  value={point}
                  onChange={(e) => {
                    const updated = [...keyPoints]
                    updated[index] = e.target.value
                    setKeyPoints(updated)
                  }}
                  className="w-full px-3 py-2 bg-white/90 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder={`重点 ${index + 1}`}
                />
              ))}
              <button
                onClick={() => setKeyPoints([...keyPoints, ''])}
                className="text-blue-400 text-sm hover:underline"
              >
                + 添加重点
              </button>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
            <h3 className="font-semibold text-white mb-4">教学难点</h3>
            <div className="space-y-2">
              {difficulties.map((diff, index) => (
                <input
                  key={index}
                  type="text"
                  value={diff}
                  onChange={(e) => {
                    const updated = [...difficulties]
                    updated[index] = e.target.value
                    setDifficulties(updated)
                  }}
                  className="w-full px-3 py-2 bg-white/90 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder={`难点 ${index + 1}`}
                />
              ))}
              <button
                onClick={() => setDifficulties([...difficulties, ''])}
                className="text-blue-400 text-sm hover:underline"
              >
                + 添加难点
              </button>
            </div>
          </div>
        </div>

        {/* 教学过程 */}
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">教学过程</h3>
            <button
              onClick={addProcedure}
              className="flex items-center gap-1 px-3 py-1 text-blue-400 bg-blue-500/20 rounded-lg hover:bg-blue-500/30"
            >
              <Plus className="w-4 h-4" />
              添加环节
            </button>
          </div>
          <div className="space-y-4">
            {procedures.map((proc, index) => (
              <div key={index} className="p-4 bg-white/10 rounded-lg border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-white">环节 {proc.step}</span>
                  <button
                    onClick={() => removeProcedure(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <input
                    type="text"
                    value={proc.title}
                    onChange={(e) => updateProcedure(index, 'title', e.target.value)}
                    className="px-3 py-2 bg-white/90 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="环节名称"
                  />
                  <input
                    type="number"
                    value={proc.duration}
                    onChange={(e) => updateProcedure(index, 'duration', Number(e.target.value))}
                    className="px-3 py-2 bg-white/90 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="时长（分钟）"
                  />
                  <input
                    type="text"
                    value={proc.method}
                    onChange={(e) => updateProcedure(index, 'method', e.target.value)}
                    className="px-3 py-2 bg-white/90 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="教学方法"
                  />
                </div>
                <textarea
                  value={proc.content}
                  onChange={(e) => updateProcedure(index, 'content', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-white/90 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="教学内容与师生活动..."
                />
              </div>
            ))}
          </div>
        </div>

        {/* 作业设计 */}
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
          <h3 className="font-semibold text-white mb-4">作业设计</h3>
          <textarea
            value={homework}
            onChange={(e) => setHomework(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 bg-white/90 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="请设计课后作业..."
          />
        </div>

        {/* 教学反思 */}
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
          <h3 className="font-semibold text-white mb-4">教学反思</h3>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 bg-white/90 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="课后反思（可选）..."
          />
        </div>
      </div>
    </div>
  )
}
