'use client'

import { useState, useMemo } from 'react'
import { useResourceStore } from '@/store/resourceStore'
import { useAuthStore } from '@/store/authStore'
import { Trophy, Eye, Calendar, Award, BookOpen, GraduationCap, FileText, ArrowRight, User } from 'lucide-react'
import Link from 'next/link'

const RECORD_TYPES = [
  { value: 'training', label: '培训学习', icon: GraduationCap, color: 'bg-blue-100 text-blue-600' },
  { value: 'research', label: '教研活动', icon: BookOpen, color: 'bg-green-100 text-green-600' },
  { value: 'teaching', label: '教学成果', icon: FileText, color: 'bg-purple-100 text-purple-600' },
  { value: 'honor', label: '荣誉获奖', icon: Award, color: 'bg-amber-100 text-amber-600' },
]

export default function SquarePage() {
  const { teacher, registeredTeachers } = useAuthStore()
  const { growthRecords } = useResourceStore()
  const [selectedRecord, setSelectedRecord] = useState<string | null>(null)

  const usageInstructions = "教师广场展示所有老师的成长档案，按记录数量排行榜。每位老师只显示最新的一条记录，点击'查看全部'可查看更多成长档案。支持培训学习、教研活动、教学成果、荣誉获奖四种类型。"

  // 获取类型配置
  const getTypeConfig = (type: string) => {
    return RECORD_TYPES.find((t) => t.value === type) || RECORD_TYPES[0]
  }

  // 获取所有老师的最新一条成长记录（每个老师只显示一条）
  const squareRecords = useMemo(() => {
    const records: any[] = []
    
    // 遍历所有注册的老师
    registeredTeachers.forEach(t => {
      if (t.role !== 'teacher') return
      
      // 获取该老师的成长记录，按日期排序
      const teacherRecords = (growthRecords[t.id] || [])
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      
      // 只取最新的一条记录
      if (teacherRecords.length > 0) {
        const latestRecord = teacherRecords[0]
        records.push({
          id: latestRecord.id,
          teacherId: t.id,
          teacherName: t.name,
          teacherSchool: t.school || '未知学校',
          type: latestRecord.type,
          title: latestRecord.title,
          description: latestRecord.description,
          date: new Date(latestRecord.date),
          isCurrentUser: t.id === teacher?.id,
          totalRecords: teacherRecords.length, // 该教师的总记录数
        })
      }
    })
    
    // 按日期排序，最新的在前面
    return records.sort((a, b) => b.date.getTime() - a.date.getTime())
  }, [growthRecords, registeredTeachers, teacher?.id])

  // 计算排行榜（显示所有有成长档案的老师）
  const rankingList = useMemo(() => {
    const rankings: any[] = []
    
    registeredTeachers.forEach(t => {
      if (t.role !== 'teacher') return
      
      const recordCount = (growthRecords[t.id] || []).length
      
      rankings.push({
        id: t.id,
        name: t.name,
        school: t.school || '未知学校',
        avatar: t.avatar || '',
        recordCount,
        isCurrentUser: t.id === teacher?.id,
      })
    })
    
    // 按档案数量排序
    return rankings.sort((a, b) => b.recordCount - a.recordCount)
  }, [growthRecords, registeredTeachers, teacher?.id])

  const currentUserRank = rankingList.findIndex(t => t.isCurrentUser) + 1
  const currentUserRecordCount = teacher ? (growthRecords[teacher.id] || []).length : 0

  return (
    <div className="max-w-6xl mx-auto space-y-6 min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* 使用说明 */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg mb-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white mb-1">使用说明</h3>
            <p className="text-sm text-white/70 leading-relaxed">{usageInstructions}</p>
          </div>
        </div>
      </div>

      {/* 头部区域 */}
      <div>
        <h1 className="text-2xl font-bold text-white">教师成长广场</h1>
        <p className="text-white/80 mt-1">分享成长足迹，见证进步历程</p>
      </div>

      {/* 老师信息卡片 */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white relative border border-white/20">
        {/* 待更新标签 */}
        <div className="absolute top-4 right-4">
          <span className="px-2 py-1 bg-gradient-to-br from-blue-500 to-teal-500 text-white text-xs rounded-full">待更新</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
            {teacher?.avatar ? (
              <img src={teacher.avatar} alt={teacher.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-white" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-white">{teacher?.name || '老师'}</h2>
            <p className="text-white/70">{teacher?.school || '学校未设置'}</p>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span>成长档案: <strong>{currentUserRecordCount}</strong> 条</span>
              <span>当前排名: <strong>第 {currentUserRank || '-'}</strong> 名</span>
            </div>
          </div>
          <div className="text-right">
            <Trophy className="w-12 h-12 text-yellow-300" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：广场动态 */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-semibold text-white">广场动态</h3>

          {squareRecords.length === 0 ? (
            <div className="text-center py-12 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <p className="text-white/70">暂无广场动态</p>
              <p className="text-sm text-white/60 mt-1">成为第一个分享成长记录的老师吧！</p>
            </div>
          ) : (
            /* 广场动态记录 */
            squareRecords.slice(0, 10).map((record) => {
              // 查找老师信息获取头像
              const teacherInfo = registeredTeachers.find(t => t.id === record.teacherId)
              return (
                <div
                  key={record.id}
                  className={`p-4 rounded-xl shadow-sm border hover:shadow-md transition-shadow ${
                    record.isCurrentUser 
                      ? 'bg-blue-500/20 border-blue-500/30' 
                      : 'bg-white/10 border-white/20'
                  }`}
                >
                  {/* 头部：老师信息 + 查看全部按钮 */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {/* 老师头像 */}
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {teacherInfo?.avatar ? (
                          <img src={teacherInfo.avatar} alt={record.teacherName} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-4 h-4 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-sm text-white">{record.teacherName}</span>
                          {record.isCurrentUser && (
                            <span className="px-1.5 py-0.5 bg-blue-400 text-white text-xs rounded-full">我</span>
                          )}
                        </div>
                        <div className="text-xs text-white/60">{record.teacherSchool}</div>
                      </div>
                    </div>
                    {!record.isCurrentUser && record.totalRecords > 1 && (
                      <Link
                        href={`/dashboard/square/teacher/${record.teacherId}`}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded hover:from-blue-600 hover:to-teal-600 transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        查看全部 ({record.totalRecords}条)
                      </Link>
                    )}
                  </div>
                  {/* 内容 */}
                  <div className="pl-10">
                    <h4 className="font-medium text-white text-sm">{record.title}</h4>
                    <p className="text-sm text-white/70 mt-1 line-clamp-2">{record.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-white/60">
                      <Calendar className="w-3 h-3" />
                      {new Date(record.date).toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* 右侧：排行榜 */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-gray-900">成长档案排行榜</h3>
            </div>
            <div className="space-y-3">
              {rankingList.length === 0 ? (
                <p className="text-center text-gray-500 py-4">暂无排行数据</p>
              ) : (
                rankingList.map((t, index) => (
                  <div
                    key={t.id}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      t.isCurrentUser ? 'bg-blue-100 border border-blue-300' : 'bg-white/90'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-amber-500 text-black' :
                      index === 1 ? 'bg-gray-400 text-black' :
                      index === 2 ? 'bg-orange-500 text-black' :
                      'bg-white/20 text-black'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                      {t.avatar ? (
                        <img 
                          src={t.avatar} 
                          alt={t.name} 
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <User className="w-4 h-4 text-black" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-black">
                        {t.name}
                        {t.isCurrentUser && <span className="text-blue-600 ml-1">(我)</span>}
                      </div>
                      <div className="text-xs text-black/60">{t.school}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-black">{t.recordCount}</div>
                      <div className="text-xs text-black/60">条档案</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-white/20 text-center">
              <Link
                href="/dashboard/growth"
                className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
              >
                管理我的档案
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* 提示卡片 */}
          <div className="bg-amber-500/20 border border-amber-500/30 rounded-xl p-4">
            <h4 className="font-medium text-amber-400 mb-2">💡 小贴士</h4>
            <p className="text-sm text-white">
              添加更多成长档案记录，提升你的排名！记录培训学习、教研活动、教学成果和荣誉获奖等内容。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
