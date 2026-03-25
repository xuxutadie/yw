'use client'

import { useState } from 'react'
import { BarChart3, TrendingUp, Users, BookOpen, AlertCircle, Download, Save, Edit2 } from 'lucide-react'

// 分数段类型
interface ScoreRange {
  range: string
  count: number
  label: string
}

// 考试数据类型
interface ExamData {
  examName: string
  studentCount: number
  averageScore: number
  highestScore: number
  lowestScore: number
  passRate: number
  excellentRate: number
  scoreDistribution: ScoreRange[]
}

// 默认分数段
const defaultScoreRanges: ScoreRange[] = [
  { range: '90-100', count: 0, label: '优秀' },
  { range: '80-89', count: 0, label: '良好' },
  { range: '70-79', count: 0, label: '中等' },
  { range: '60-69', count: 0, label: '及格' },
  { range: '0-59', count: 0, label: '不及格' },
]

// 初始化所有考试数据
const initExamData = (): Record<string, ExamData> => {
  const exams = [
    '第一单元测试',
    '第二单元测试',
    '第三单元测试',
    '第四单元测试',
    '期中考试',
    '第五单元测试',
    '第六单元测试',
    '第七单元测试',
    '第八单元测试',
    '期末考试'
  ]
  
  const data: Record<string, ExamData> = {}
  exams.forEach(exam => {
    data[exam] = {
      examName: exam,
      studentCount: 0,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      passRate: 0,
      excellentRate: 0,
      scoreDistribution: JSON.parse(JSON.stringify(defaultScoreRanges)),
    }
  })
  return data
}

export default function AnalysisPage() {
  const [examData, setExamData] = useState<Record<string, ExamData>>(initExamData())
  const [selectedExam, setSelectedExam] = useState('第一单元测试')
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<ExamData | null>(null)

  const currentData = examData[selectedExam]

  // 开始编辑
  const handleEdit = () => {
    setEditData(JSON.parse(JSON.stringify(currentData)))
    setIsEditing(true)
  }

  // 保存数据
  const handleSave = () => {
    if (editData) {
      // 计算总人数
      const totalCount = editData.scoreDistribution.reduce((sum, item) => sum + item.count, 0)
      
      const updatedData = {
        ...editData,
        studentCount: totalCount,
      }
      
      setExamData(prev => ({
        ...prev,
        [selectedExam]: updatedData
      }))
      setIsEditing(false)
      setEditData(null)
    }
  }

  // 修改及格率
  const handlePassRateChange = (value: string) => {
    const rate = parseInt(value) || 0
    if (editData) {
      setEditData({ ...editData, passRate: Math.min(100, Math.max(0, rate)) })
    }
  }

  // 修改优秀率
  const handleExcellentRateChange = (value: string) => {
    const rate = parseInt(value) || 0
    if (editData) {
      setEditData({ ...editData, excellentRate: Math.min(100, Math.max(0, rate)) })
    }
  }

  // 取消编辑
  const handleCancel = () => {
    setIsEditing(false)
    setEditData(null)
  }

  // 修改分数段人数
  const handleCountChange = (index: number, value: string) => {
    const count = parseInt(value) || 0
    if (editData) {
      const newDistribution = [...editData.scoreDistribution]
      newDistribution[index].count = count
      setEditData({
        ...editData,
        scoreDistribution: newDistribution
      })
    }
  }

  // 修改平均分
  const handleAverageChange = (value: string) => {
    const score = parseFloat(value) || 0
    if (editData) {
      setEditData({ ...editData, averageScore: score })
    }
  }

  // 修改最高分
  const handleHighestChange = (value: string) => {
    const score = parseInt(value) || 0
    if (editData) {
      setEditData({ ...editData, highestScore: score })
    }
  }

  // 修改最低分
  const handleLowestChange = (value: string) => {
    const score = parseInt(value) || 0
    if (editData) {
      setEditData({ ...editData, lowestScore: score })
    }
  }

  // 获取掌握率颜色
  const getMasteryColor = (rate: number) => {
    if (rate >= 80) return 'bg-green-500'
    if (rate >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  // 导出报告为CSV
  const handleExport = () => {
    const data = currentData
    const total = data.studentCount || 1

    // CSV 内容
    let csv = '班级学情分析报告\n'
    csv += `考试名称,${selectedExam}\n`
    csv += `班级人数,${data.studentCount}人\n`
    csv += `班级平均分,${data.averageScore}分\n`
    csv += `及格率,${data.passRate}%\n`
    csv += `优秀率,${data.excellentRate}%\n`
    csv += `最高分,${data.highestScore}分\n`
    csv += `最低分,${data.lowestScore}分\n\n`

    csv += '成绩分布\n'
    csv += '分数段,等级,人数,占比\n'
    data.scoreDistribution.forEach(item => {
      const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : '0.0'
      csv += `${item.range},${item.label},${item.count}人,${percentage}%\n`
    })

    // 创建下载
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${selectedExam}_学情分析报告.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="max-w-6xl mx-auto min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">班级学情分析</h1>
          <p className="text-white/80 mt-1">多维度数据分析，精准把握教学效果</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedExam}
            onChange={(e) => {
              setSelectedExam(e.target.value)
              setIsEditing(false)
            }}
            className="px-2 py-1 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option>第一单元测试</option>
            <option>第二单元测试</option>
            <option>第三单元测试</option>
            <option>第四单元测试</option>
            <option>期中考试</option>
            <option>第五单元测试</option>
            <option>第六单元测试</option>
            <option>第七单元测试</option>
            <option>第八单元测试</option>
            <option>期末考试</option>
          </select>
          
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save className="w-3 h-3" />
                保存
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                取消
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleEdit}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                <Edit2 className="w-3 h-3" />
                修改数据
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Download className="w-3 h-3" />
                导出报告
              </button>
            </>
          )}
        </div>
      </div>

      {/* 概览卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* 班级平均分 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">班级平均分</span>
            <BarChart3 className="w-5 h-5 text-primary-500" />
          </div>
          {isEditing ? (
            <input
              type="number"
              step="0.1"
              value={editData?.averageScore || ''}
              onChange={(e) => handleAverageChange(e.target.value)}
              className="w-24 px-2 py-1 text-2xl font-bold border rounded"
              placeholder="平均分"
            />
          ) : (
            <div className="text-3xl font-bold text-gray-900">{currentData.averageScore || '-'}</div>
          )}
          <div className="text-xs text-gray-400 mt-1">分</div>
        </div>

        {/* 及格率 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">及格率</span>
            <Users className="w-5 h-5 text-green-500" />
          </div>
          {isEditing ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                max="100"
                value={editData?.passRate || 0}
                onChange={(e) => handlePassRateChange(e.target.value)}
                className="w-20 px-2 py-1 text-2xl font-bold border rounded text-right"
              />
              <span className="text-2xl font-bold">%</span>
            </div>
          ) : (
            <div className="text-3xl font-bold text-gray-900">{currentData.passRate}%</div>
          )}
          <div className="text-xs text-gray-400 mt-1">
            {isEditing 
              ? `${editData?.scoreDistribution.reduce((sum, s) => sum + s.count, 0) || 0}人`
              : `${currentData.studentCount}人参考`
            }
          </div>
        </div>

        {/* 优秀率 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">优秀率</span>
            <TrendingUp className="w-5 h-5 text-amber-500" />
          </div>
          {isEditing ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                max="100"
                value={editData?.excellentRate || 0}
                onChange={(e) => handleExcellentRateChange(e.target.value)}
                className="w-20 px-2 py-1 text-2xl font-bold border rounded text-right"
              />
              <span className="text-2xl font-bold">%</span>
            </div>
          ) : (
            <div className="text-3xl font-bold text-gray-900">{currentData.excellentRate}%</div>
          )}
          <div className="text-xs text-gray-400 mt-1">80分以上</div>
        </div>

        {/* 最高分/最低分 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">最高分/最低分</span>
            <BookOpen className="w-5 h-5 text-blue-500" />
          </div>
          {isEditing ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={editData?.highestScore || ''}
                onChange={(e) => handleHighestChange(e.target.value)}
                className="w-14 px-2 py-1 text-lg font-bold border rounded text-center"
                placeholder="最高"
              />
              <span className="text-lg font-bold">/</span>
              <input
                type="number"
                value={editData?.lowestScore || ''}
                onChange={(e) => handleLowestChange(e.target.value)}
                className="w-14 px-2 py-1 text-lg font-bold border rounded text-center"
                placeholder="最低"
              />
            </div>
          ) : (
            <div className="text-2xl font-bold text-gray-900">
              {currentData.highestScore || '-'}/{currentData.lowestScore || '-'}
            </div>
          )}
          <div className="text-xs text-gray-400 mt-1">分数区间</div>
        </div>
      </div>

      {/* 成绩分布 */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">成绩分布</h3>
          {isEditing && <span className="text-sm text-amber-600">编辑模式中，直接修改人数</span>}
        </div>
        <div className="space-y-3">
          {(isEditing ? editData?.scoreDistribution : currentData.scoreDistribution)?.map((item, index) => {
            const total = isEditing 
              ? (editData?.scoreDistribution.reduce((sum, s) => sum + s.count, 0) || 1)
              : (currentData.studentCount || 1)
            const percentage = total > 0 ? (item.count / total) * 100 : 0
            
            return (
              <div key={item.range}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">{item.range}分 ({item.label})</span>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        value={item.count}
                        onChange={(e) => handleCountChange(index, e.target.value)}
                        className="w-16 px-2 py-1 text-sm border rounded text-right"
                        placeholder="人数"
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-900">{item.count}人</span>
                    )}
                    <span className="text-xs text-gray-400 w-12 text-right">{percentage.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      item.label === '优秀' ? 'bg-green-500' :
                      item.label === '良好' ? 'bg-blue-500' :
                      item.label === '中等' ? 'bg-yellow-500' :
                      item.label === '及格' ? 'bg-orange-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
        
        {isEditing && (
          <div className="mt-4 p-3 bg-amber-50 rounded-lg">
            <p className="text-sm text-amber-800">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              当前总人数: {editData?.scoreDistribution.reduce((sum, item) => sum + item.count, 0) || 0}人
            </p>
          </div>
        )}
      </div>


    </div>
  )
}
