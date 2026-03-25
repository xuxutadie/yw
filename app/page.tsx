'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { BookOpen, Shield, User, Eye, EyeOff, School, GraduationCap, Lock } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { login, register, adminLogin } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'admin'>('login')
  
  // 登录表单状态
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  // 注册表单状态
  const [registerName, setRegisterName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [registerSchool, setRegisterSchool] = useState('')
  const [registerGrade, setRegisterGrade] = useState(1)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  
  // 管理员登录表单状态
  const [adminPhone, setAdminPhone] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [showAdminPassword, setShowAdminPassword] = useState(false)
  
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const success = await login(email, password)
      if (success) {
        router.push('/dashboard')
      } else {
        setError('邮箱或密码错误')
      }
    } catch {
      setError('登录失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const success = await adminLogin(adminPhone, adminPassword)
      if (success) {
        router.push('/dashboard')
      } else {
        setError('管理员电话或密码错误')
      }
    } catch {
      setError('登录失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // 验证密码
    if (registerPassword !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }
    
    if (registerPassword.length < 6) {
      setError('密码长度至少为6位')
      return
    }
    
    setIsLoading(true)

    try {
      const success = await register({
        name: registerName,
        email: registerEmail,
        password: registerPassword,
        school: registerSchool,
        grade: registerGrade,
      })
      
      if (success) {
        // 注册成功后自动登录
        await login(registerEmail, registerPassword)
        router.push('/dashboard')
      } else {
        setError('该邮箱已被注册')
      }
    } catch {
      setError('注册失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const switchTab = (tab: 'login' | 'register' | 'admin') => {
    setActiveTab(tab)
    setError('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-8">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
        {/* Logo和标题 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">语文老师智能助手</h1>
          <p className="text-gray-600 mt-2">教师专属教学工具平台</p>
        </div>

        {/* 核心声明 */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-2">
            <Shield className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">教师专用声明</p>
              <p>本工具仅限小学1-6年级语文教师使用，无学生、家长入口，全程服务教师教学教研工作。</p>
            </div>
          </div>
        </div>

        {/* 登录/注册/管理员切换标签 */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => switchTab('login')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'login'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            教师登录
          </button>
          <button
            onClick={() => switchTab('register')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'register'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            教师注册
          </button>
          <button
            onClick={() => switchTab('admin')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'admin'
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            管理员
          </button>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-4 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        {activeTab === 'login' && (
          /* 教师登录表单 */
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                教师邮箱
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="请输入教师邮箱"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                密码
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="请输入密码"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '登录中...' : '教师登录'}
            </button>
          </form>
        )}

        {activeTab === 'admin' && (
          /* 管理员登录表单 */
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                管理员电话
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="请输入管理员电话"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                管理员密码
              </label>
              <div className="relative">
                <input
                  type={showAdminPassword ? 'text' : 'password'}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="请输入管理员密码"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showAdminPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '登录中...' : '管理员登录'}
            </button>
          </form>
        )}

        {activeTab === 'register' && (
          /* 注册表单 */
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                姓名
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="请输入您的姓名"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                教师邮箱
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="请输入教师邮箱"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                学校名称
              </label>
              <div className="relative">
                <School className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={registerSchool}
                  onChange={(e) => setRegisterSchool(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="请输入学校名称"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                任教年级
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={registerGrade}
                  onChange={(e) => setRegisterGrade(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
                  required
                >
                  {[1, 2, 3, 4, 5, 6].map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}年级
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                密码
              </label>
              <div className="relative">
                <input
                  type={showRegisterPassword ? 'text' : 'password'}
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="w-full px-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="请设置密码（至少6位）"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showRegisterPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                确认密码
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="请再次输入密码"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '注册中...' : '教师注册'}
            </button>
          </form>
        )}

        {/* 演示账号提示 */}
        {activeTab === 'login' && (
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>演示账号：teacher@school.edu.cn</p>
            <p>密码：teacher123</p>
          </div>
        )}

        {/* 合规声明 */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-xs text-gray-400 text-center">
          <p>© 2026 语文老师小助手 | 严格遵守教育法规与数据安全规范</p>
          <p className="mt-1">不收集未成年人信息 | 无广告弹窗 | 正版授权资源</p>
        </div>
      </div>
    </div>
  )
}
