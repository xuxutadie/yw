'use client'

import { useState, useEffect, useCallback } from 'react'

interface UseTypewriterOptions {
  text: string
  speed?: number // 每个字符的间隔时间（毫秒）
  enabled?: boolean
  onComplete?: () => void
}

export function useTypewriter({
  text,
  speed = 30,
  enabled = true,
  onComplete,
}: UseTypewriterOptions) {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const startTyping = useCallback(() => {
    if (!enabled || !text) {
      setDisplayedText(text)
      return
    }

    setIsTyping(true)
    setDisplayedText('')
    let currentIndex = 0

    const typeNextChar = () => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1))
        currentIndex++
        
        // 根据字符类型调整速度
        const char = text[currentIndex - 1]
        let delay = speed
        
        // 标点符号稍微停顿久一点
        if (/[。！？.!?]/.test(char)) {
          delay = speed * 4
        } else if (/[，、,;；]/.test(char)) {
          delay = speed * 2
        }
        // 换行符
        else if (char === '\n') {
          delay = speed * 3
        }

        setTimeout(typeNextChar, delay)
      } else {
        setIsTyping(false)
        onComplete?.()
      }
    }

    typeNextChar()
  }, [text, speed, enabled, onComplete])

  useEffect(() => {
    startTyping()
  }, [startTyping])

  // 跳过打字效果，直接显示全部
  const skip = useCallback(() => {
    setDisplayedText(text)
    setIsTyping(false)
    onComplete?.()
  }, [text, onComplete])

  return {
    displayedText,
    isTyping,
    skip,
  }
}
