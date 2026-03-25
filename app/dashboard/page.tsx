'use client'

import { useMemo } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useResourceStore } from '@/store/resourceStore'
import { useQuestionStore } from '@/store/questionStore'
import { useLessonStore } from '@/store/lessonStore'
import Link from 'next/link'
import { 
  BookOpen, 
  FileText, 
  PenTool, 
  FolderOpen,
  Award,
  TrendingUp,
  Shield,
  ChevronRight,
  Clock,
  Sparkles
} from 'lucide-react'

export default function DashboardPage() {
  const { teacher, isAdmin } = useAuthStore()
  const { resources, growthRecords } = useResourceStore()
  const { examPapers } = useQuestionStore()
  const { teachingPlans } = useLessonStore()

  // 使用说明
  const usageInstructions = "欢迎使用语文老师小助手！左侧导航栏包含所有功能：仪表板、备课中心、作文批改、教师广场等。点击电子木鱼可放松心情，选择疲倦或生气状态会影响计数。"

  // 计算本周数据
  const weekStats = useMemo(() => {
    const now = new Date()
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
    const weekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 7)

    // 本周生成的试卷
    const thisWeekPapers = examPapers.filter(paper => {
      const date = new Date(paper.createdAt)
      return date >= weekStart && date < weekEnd
    }).length

    // 本周批改的作文（从本地存储获取）
    const getEssayCount = () => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('essay-graded-count')
        return saved ? parseInt(saved, 10) : 0
      }
      return 0
    }
    const thisWeekEssays = getEssayCount()

    // 本周备课课时（根据教案数量）
    const thisWeekLessons = teachingPlans.filter(plan => {
      const date = new Date(plan.createdAt)
      return date >= weekStart && date < weekEnd
    }).length

    // 资源总数
    const totalResources = resources.length

    // 成长档案数
    const totalGrowthRecords = growthRecords.length

    return {
      thisWeekPapers,
      thisWeekEssays,
      thisWeekLessons,
      totalResources,
      totalGrowthRecords,
      weekRange: `${weekStart.getMonth() + 1}月${weekStart.getDate()}日 - ${weekEnd.getMonth() + 1}月${weekEnd.getDate() - 1}日`
    }
  }, [examPapers, teachingPlans, resources, growthRecords])

  const { thisWeekPapers, thisWeekEssays, thisWeekLessons, totalResources, totalGrowthRecords, weekRange } = weekStats

  // 快捷入口数据
  const quickActions = useMemo(() => {
    return [
      { title: '本周备课', value: thisWeekLessons.toString(), unit: '课时', icon: BookOpen },
      { title: '生成试卷', value: thisWeekPapers.toString(), unit: '份', icon: FileText },
      { title: '批改作文', value: thisWeekEssays.toString(), unit: '篇', icon: PenTool },
      { title: '资源收藏', value: totalResources.toString(), unit: '个', icon: FolderOpen },
    ]
  }, [thisWeekPapers, thisWeekEssays, thisWeekLessons, totalResources])

  return (
    <div className="space-y-6 min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* 使用说明 */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white mb-1">使用说明</h3>
            <p className="text-sm text-white/80 leading-relaxed">{usageInstructions}</p>
          </div>
        </div>
      </div>

      {/* 欢迎区域 */}
      <div className="bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold mb-2">
          欢迎回来，{teacher?.name}！
        </h1>
        <p className="text-white/90">
          今天是{new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
        </p>
        <p className="text-white/80 mt-1">
          您正在使用教师专属教学工具，祝您教学顺利！
        </p>
      </div>

      {/* 管理员控制台 */}
      {isAdmin && (
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">管理员控制台</h2>
              <p className="text-white/70 text-sm">您拥有系统的最高管理权限</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/dashboard/admin"
              className="bg-gradient-to-br from-blue-500/20 to-teal-500/20 p-4 rounded-lg border border-white/20 hover:border-white/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-medium text-white">用户管理</div>
                  <div className="text-sm text-white/60">管理教师账号</div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* 功能模块入口 - 仅教师显示 */}
      {!isAdmin && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">功能模块</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* AI 出题 */}
          <Link
            href="/dashboard/questions"
            className="group p-5 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 transition-all shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="font-semibold text-white mt-4">AI 智能出题</h3>
            <p className="text-sm text-white/90 mt-1">根据知识点自动生成练习题</p>
          </Link>

          {/* 作文批改 */}
          <Link
            href="/dashboard/essay"
            className="group p-5 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 transition-all shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <PenTool className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="font-semibold text-white mt-4">AI 作文批改</h3>
            <p className="text-sm text-white/90 mt-1">智能评分与详细点评</p>
          </Link>

          {/* 备课中心 */}
          <Link
            href="/dashboard/lesson"
            className="group p-5 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 transition-all shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="font-semibold text-white mt-4">备课中心</h3>
            <p className="text-sm text-white/90 mt-1">教材资源与教案管理</p>
          </Link>

          {/* 成长档案 */}
          <Link
            href="/dashboard/growth"
            className="group p-5 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 transition-all shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="font-semibold text-white mt-4">成长档案</h3>
            <p className="text-sm text-white/90 mt-1">记录专业发展历程</p>
          </Link>

          {/* 教师广场 */}
          <Link
            href="/dashboard/square"
            className="group p-5 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 transition-all shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="font-semibold text-white mt-4">教师广场</h3>
            <p className="text-sm text-white/90 mt-1">分享成长足迹</p>
          </Link>
          </div>
        </div>
      )}

      {/* 最近动态 */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">最近动态</h2>
          <div className="flex items-center gap-1 text-sm text-white/70">
            <Clock className="w-4 h-4" />
            <span>{weekRange}</span>
          </div>
        </div>
        
        <div className="text-center py-8 text-white/70">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <p>本周暂无活动记录</p>
          <p className="text-sm text-white/50 mt-1">开始使用各项功能，记录您的教学工作</p>
        </div>
      </div>
    </div>
  )
}
