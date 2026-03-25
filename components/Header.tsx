'use client'

import { useState, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import { BookOpen, User, LogOut, Upload, Camera } from 'lucide-react'
import Link from 'next/link'

export default function Header() {
  const { teacher, updateTeacher, logout } = useAuthStore()
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(teacher?.avatar || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 压缩图片
  const compressImage = (file: File, maxSizeMB: number = 1): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('无法创建 canvas 上下文'))
            return
          }

          // 计算压缩后的尺寸（保持比例）- 头像不需要太大
          let { width, height } = img
          const maxDimension = 512 // 最大边长 512px（头像足够用）
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension
              width = maxDimension
            } else {
              width = (width / height) * maxDimension
              height = maxDimension
            }
          }

          canvas.width = width
          canvas.height = height
          ctx.drawImage(img, 0, 0, width, height)

          // 压缩质量，直到文件大小小于限制
          let quality = 0.8
          const maxSizeBytes = maxSizeMB * 1024 * 1024

          const tryCompress = () => {
            const dataUrl = canvas.toDataURL('image/jpeg', quality)
            const base64Length = dataUrl.split(',')[1].length
            const fileSizeBytes = (base64Length * 3) / 4 // base64 解码后的字节数

            if (fileSizeBytes > maxSizeBytes && quality > 0.1) {
              quality -= 0.1
              tryCompress()
            } else {
              resolve(dataUrl)
            }
          }

          tryCompress()
        }
        img.onerror = () => reject(new Error('图片加载失败'))
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsDataURL(file)
    })
  }

  // 处理头像文件选择
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }

    try {
      // 如果文件大于 500KB，进行压缩
      if (file.size > 500 * 1024) {
        const compressedDataUrl = await compressImage(file, 0.5)
        setPreviewUrl(compressedDataUrl)
        alert('图片已自动压缩至 500KB 以内')
      } else {
        // 直接读取文件
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          setPreviewUrl(result)
        }
        reader.readAsDataURL(file)
      }
    } catch (error) {
      alert('图片处理失败，请重试')
      console.error('图片压缩失败:', error)
    }
  }

  // 保存头像
  const handleSaveAvatar = () => {
    if (previewUrl) {
      updateTeacher({ avatar: previewUrl })
      setShowAvatarModal(false)
      alert('头像已更新')
    }
  }

  // 打开文件选择器
  const handleSelectFile = () => {
    fileInputRef.current?.click()
  }

  // 重置为默认头像
  const handleResetAvatar = () => {
    setPreviewUrl(null)
    updateTeacher({ avatar: undefined })
    setShowAvatarModal(false)
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 z-50">
        <div className="flex items-center justify-between h-full px-4 max-w-7xl mx-auto">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white">语文老师智能助手</span>
            <span className="px-2 py-0.5 bg-gradient-to-r from-blue-500 to-teal-500 text-white text-xs rounded-full">
              教师版
            </span>
          </Link>

          {/* 右侧操作区 */}
          <div className="flex items-center gap-6">
            {/* 教师信息 */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{teacher?.name}</p>
                <p className="text-xs text-white/80">{teacher?.school} | {teacher?.grade}年级语文</p>
              </div>
              <button
                onClick={() => setShowAvatarModal(true)}
                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center hover:from-blue-600 hover:to-teal-600 transition-colors shadow-sm overflow-hidden"
                title="更换头像"
              >
                {teacher?.avatar ? (
                  <img 
                    src={teacher.avatar} 
                    alt="头像" 
                    className="w-full h-full object-cover rounded-full"
                    loading="eager"
                    decoding="sync"
                  />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </button>
              <button
                onClick={() => {
                  logout()
                  setShowAvatarModal(false)
                }}
                className="p-2.5 text-white/80 hover:bg-gradient-to-r hover:from-blue-600/50 hover:to-teal-600/50 rounded-lg transition-colors shadow-sm"
                title="退出登录"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 更换头像弹窗 */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">更换头像</h3>
              <button
                onClick={() => setShowAvatarModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5 text-gray-500 rotate-45" />
              </button>
            </div>

            {/* 头像预览 */}
            <div className="flex justify-center mb-6">
              <div className="w-32 h-32 rounded-full bg-gray-100 overflow-hidden border-4 border-primary-100">
                {previewUrl ? (
                  <img src={previewUrl} alt="预览" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            {/* 文件选择 */}
            <div className="mb-6">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={handleSelectFile}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                <Upload className="w-5 h-5" />
                <span className="font-medium">选择图片</span>
              </button>
              <p className="text-xs text-gray-500 text-center mt-2">
                支持 JPG、PNG 格式，大小不超过 2MB
              </p>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <button
                onClick={handleResetAvatar}
                className="flex-1 px-4 py-3 border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors"
              >
                恢复默认
              </button>
              <button
                onClick={handleSaveAvatar}
                className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
