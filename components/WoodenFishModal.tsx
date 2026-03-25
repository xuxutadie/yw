'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'

// 木鱼点击效果类型
interface ClickEffect {
  id: number
}

export default function WoodenFishModal() {
  const { showWoodenFish, setShowWoodenFish, teacher } = useAuthStore()
  const [fishCount, setFishCount] = useState(0)
  const [lastResetDate, setLastResetDate] = useState<Date | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [clickEffects, setClickEffects] = useState<ClickEffect[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)

  // 初始化音频上下文
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
  }, [])

  // 播放木鱼声音
  const playWoodenFishSound = () => {
    if (!audioContextRef.current) return
    
    const ctx = audioContextRef.current
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    // 木鱼声音：高频短促的敲击声
    oscillator.frequency.setValueAtTime(800, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1)
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.1)
  }

  // 加载今日敲击次数
  useEffect(() => {
    if (teacher?.id && showWoodenFish) {
      const stored = localStorage.getItem(`wooden-fish-${teacher.id}`)
      if (stored) {
        const data = JSON.parse(stored)
        const savedDate = new Date(data.lastResetDate)
        const today = new Date()
        
        // 检查是否是新的一天
        if (savedDate.toDateString() === today.toDateString()) {
          setFishCount(data.count || 0)
          setLastResetDate(savedDate)
        } else {
          // 新的一天，重置计数
          setFishCount(0)
          setLastResetDate(today)
          localStorage.setItem(`wooden-fish-${teacher.id}`, JSON.stringify({
            count: 0,
            lastResetDate: today.toISOString()
          }))
        }
      } else {
        const today = new Date()
        setLastResetDate(today)
        localStorage.setItem(`wooden-fish-${teacher.id}`, JSON.stringify({
          count: 0,
          lastResetDate: today.toISOString()
        }))
      }
    }
  }, [teacher?.id, showWoodenFish])

  // 敲击木鱼
  const handleKnockFish = () => {
    // 播放音效
    playWoodenFishSound()

    // 增加计数
    const newCount = fishCount + 1
    setFishCount(newCount)

    // 保存到本地存储
    if (teacher?.id) {
      localStorage.setItem(`wooden-fish-${teacher.id}`, JSON.stringify({
        count: newCount,
        lastResetDate: (lastResetDate || new Date()).toISOString()
      }))
    }

    // 添加点击效果
    const newEffect = { id: Date.now() }
    setClickEffects(prev => [...prev, newEffect])
    
    // 1秒后移除效果
    setTimeout(() => {
      setClickEffects(prev => prev.filter(e => e.id !== newEffect.id))
    }, 1000)
  }

  // 选择状态
  const handleSelectTired = () => {
    setSelectedStatus(selectedStatus === '疲倦' ? null : '疲倦')
  }

  const handleSelectAngry = () => {
    setSelectedStatus(selectedStatus === '生气' ? null : '生气')
  }

  if (!showWoodenFish) return null

  return (
    <div 
      className="fixed inset-0 bg-white z-[2147483647] overflow-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setShowWoodenFish(false)
        }
      }}
    >
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-sm w-full p-6 text-center shadow-2xl">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">教师解压神器</h3>
            <p className="text-sm text-gray-500">敲一敲，积功德，放松心情</p>
          </div>

          {/* 状态选择按钮 */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={handleSelectTired}
              className={`flex-1 px-4 py-2 text-sm rounded-lg transition-colors ${
                selectedStatus === '疲倦'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              😴 疲倦
            </button>
            <button
              onClick={handleSelectAngry}
              className={`flex-1 px-4 py-2 text-sm rounded-lg transition-colors ${
                selectedStatus === '生气'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              😠 生气
            </button>
          </div>

          <button
            onClick={handleKnockFish}
            className="w-48 h-48 mx-auto active:scale-95 transition-all flex items-center justify-center mb-6 relative"
          >
            {/* 木鱼图片 */}
            <img 
              src="/images/wooden-fish.png" 
              alt="木鱼" 
              className="w-full h-full object-contain"
            />
            
            {/* 点击效果 - 固定在右上角 */}
            {clickEffects.map(effect => (
              <div
                key={effect.id}
                className="absolute top-0 right-0 text-2xl font-bold text-red-600 pointer-events-none"
                style={{
                  animation: 'float-up 1s ease-out forwards',
                }}
              >
                -1
              </div>
            ))}
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setFishCount(0)
                setLastResetDate(new Date())
                if (teacher?.id) {
                  localStorage.setItem(`wooden-fish-${teacher?.id}`, JSON.stringify({
                    count: 0,
                    lastResetDate: new Date().toISOString()
                  }))
                }
              }}
              className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              清零
            </button>
            <button
              onClick={() => setShowWoodenFish(false)}
              className="flex-1 px-4 py-2 text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
            >
              关闭
            </button>
          </div>


        </div>
      </div>
    </div>
  )
}
