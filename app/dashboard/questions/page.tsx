'use client'

import { useState, useEffect } from 'react'
import { useQuestionStore } from '@/store/questionStore'
import type { Question, QuestionType, DifficultyLevel } from '@/types'
import { Plus, Search, Filter, Copy, Trash2, FileText, Wand2 } from 'lucide-react'

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'choice', label: '选择题' },
  { value: 'fill_blank', label: '填空题' },
  { value: 'short_answer', label: '简答题' },
  { value: 'essay', label: '作文题' },
]

const DIFFICULTY_LEVELS: { value: DifficultyLevel; label: string }[] = [
  { value: 'easy', label: '简单' },
  { value: 'medium', label: '中等' },
  { value: 'hard', label: '困难' },
]

const GRADES = [1, 2, 3, 4, 5, 6]

export default function QuestionsPage() {
  const { questions, addQuestion, deleteQuestion, generateSimilarQuestion, initSampleQuestions } = useQuestionStore()
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filterType, setFilterType] = useState<QuestionType | 'all'>('all')
  const [filterGrade, setFilterGrade] = useState<number | 'all'>('all')
  const [showAddModal, setShowAddModal] = useState(false)

  const usageInstructions = "AI 智能出题功能可根据知识点、年级和难度自动生成练习题。支持选择题、填空题、简答题和作文题。生成后可搜索、筛选题目，还能一键生成同类变式题。"

  // 初始化示例题目
  useEffect(() => {
    initSampleQuestions()
  }, [initSampleQuestions])

  // 筛选题目
  const filteredQuestions = questions.filter((q) => {
    const matchKeyword = q.content.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                        q.knowledgePoint.toLowerCase().includes(searchKeyword.toLowerCase())
    const matchType = filterType === 'all' || q.type === filterType
    const matchGrade = filterGrade === 'all' || q.grade === filterGrade
    return matchKeyword && matchType && matchGrade
  })

  // 生成同类题
  const handleGenerateSimilar = (question: Question) => {
    const newQuestion = generateSimilarQuestion(question)
    if (newQuestion) {
      alert('已生成同类题！')
    } else {
      alert('暂无法生成该类题目的变式')
    }
  }

  return (
    <div className="max-w-6xl mx-auto min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* 使用说明 */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg mb-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white mb-1">使用说明</h3>
            <p className="text-sm text-white/70 leading-relaxed">{usageInstructions}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">出题组卷</h1>
          <p className="text-white/80 mt-1">智能题库管理，一键生成试卷</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg hover:from-blue-600 hover:to-teal-600 transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" />
            添加题目
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <FileText className="w-4 h-4" />
            智能组卷
          </button>
        </div>
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
                placeholder="搜索题目内容或知识点..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as QuestionType | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">全部题型</option>
            {QUESTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">全部年级</option>
            {GRADES.map((g) => (
              <option key={g} value={g}>{g}年级</option>
            ))}
          </select>
        </div>
      </div>

      {/* 题目列表 */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500">暂无符合条件的题目</p>
          </div>
        ) : (
          filteredQuestions.map((question, index) => (
            <div key={question.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* 题目头部信息 */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      {QUESTION_TYPES.find((t) => t.value === question.type)?.label}
                    </span>
                    <span className="px-2 py-1 bg-primary-50 text-primary-600 text-xs rounded">
                      {question.grade}年级
                    </span>
                    <span className={`px-2 py-1 text-xs rounded ${
                      question.difficulty === 'easy' ? 'bg-green-50 text-green-600' :
                      question.difficulty === 'medium' ? 'bg-yellow-50 text-yellow-600' :
                      'bg-red-50 text-red-600'
                    }`}>
                      {DIFFICULTY_LEVELS.find((d) => d.value === question.difficulty)?.label}
                    </span>
                    <span className="text-xs text-gray-400">{question.knowledgePoint}</span>
                  </div>

                  {/* 题目内容 */}
                  <div className="mb-4">
                    <span className="font-medium text-gray-900 mr-2">{index + 1}.</span>
                    <span className="text-gray-800">{question.content}</span>
                  </div>

                  {/* 选项（选择题） */}
                  {question.options && (
                    <div className="grid grid-cols-2 gap-2 mb-4 ml-6">
                      {question.options.map((option, i) => (
                        <div key={i} className="text-gray-700">{option}</div>
                      ))}
                    </div>
                  )}

                  {/* 答案和解析 */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="mb-2">
                      <span className="font-medium text-gray-700">答案：</span>
                      <span className="text-green-600 font-medium">{question.answer}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">解析：</span>
                      <span className="text-gray-600">{question.analysis}</span>
                    </div>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => handleGenerateSimilar(question)}
                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="生成同类题"
                  >
                    <Wand2 className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="复制"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteQuestion(question.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 添加题目弹窗（简化版） */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">添加新题目</h2>
            <p className="text-gray-500 mb-4">功能开发中，敬请期待...</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
