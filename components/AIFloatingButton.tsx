'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Bot, User, Sparkles, BookOpen, PenTool, FileText, Lightbulb, X, Minimize2, Copy, Check, RotateCcw, ThumbsUp, ThumbsDown, FastForward } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
}

// 打字机效果组件
function TypewriterMessage({ 
  content, 
  isNew,
  onComplete,
  messageId,
  onSkip
}: { 
  content: string
  isNew: boolean
  onComplete?: () => void
  messageId: string
  onSkip?: (id: string) => void
}) {
  const [displayedText, setDisplayedText] = useState(isNew ? '' : content)
  const [isTyping, setIsTyping] = useState(isNew)
  const contentRef = useRef(content)
  const isNewRef = useRef(isNew)

  useEffect(() => {
    contentRef.current = content
  }, [content])

  useEffect(() => {
    if (!isNewRef.current) {
      setDisplayedText(content)
      return
    }

    let currentIndex = 0
    const text = contentRef.current
    
    const typeNextChar = () => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1))
        currentIndex++
        
        // 根据字符类型调整速度
        const char = text[currentIndex - 1]
        let delay = 25 // 基础速度（毫秒）
        
        // 标点符号稍微停顿久一点
        if (/[。！？.!?]/.test(char)) {
          delay = 120
        } else if (/[，、,;；]/.test(char)) {
          delay = 60
        } else if (char === '\n') {
          delay = 80
        }

        setTimeout(typeNextChar, delay)
      } else {
        setIsTyping(false)
        onComplete?.()
      }
    }

    typeNextChar()
  }, [content, onComplete])

  const handleSkip = () => {
    setDisplayedText(content)
    setIsTyping(false)
    onSkip?.(messageId)
    onComplete?.()
  }

  return (
    <div className="relative">
      <div className="prose prose-sm max-w-none prose-headings:mt-2 prose-headings:mb-1 prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {displayedText}
        </ReactMarkdown>
      </div>
      {isTyping && (
        <div className="flex items-center gap-2 mt-2">
          <span className="inline-block w-2 h-4 bg-primary-500 animate-pulse"></span>
          <button
            onClick={handleSkip}
            className="flex items-center gap-1 px-2 py-0.5 text-xs text-gray-400 hover:text-primary-500 hover:bg-gray-100 rounded transition-colors"
            title="跳过动画"
          >
            <FastForward className="w-3 h-3" />
            跳过
          </button>
        </div>
      )}
    </div>
  )
}

// 快捷场景
const QUICK_SCENES = [
  { icon: BookOpen, title: '备课辅助', prompt: '请帮我设计《春》这篇课文的教学目标' },
  { icon: PenTool, title: '作文指导', prompt: '如何指导学生写好记叙文的开头？' },
  { icon: FileText, title: '出题建议', prompt: '请为三年级语文设计5道阅读理解题' },
  { icon: Lightbulb, title: '教学方法', prompt: '有什么好的方法教学生理解比喻句？' },
]

export default function AIFloatingButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '👋 您好！我是您的**AI语文教研助手**，由 豆包AI 驱动！\n\n我可以帮您：\n• 📚 设计教案和备课\n• ✍️ 指导作文教学\n• 📝 智能出题组卷\n• 📜 解析古诗词\n• 🎓 提供教学方法\n\n有什么可以帮您的吗？',
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null)
  const [completedMessages, setCompletedMessages] = useState<Set<string>>(new Set())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // 处理打字完成
  const handleTypeComplete = useCallback((messageId: string) => {
    setCompletedMessages(prev => new Set(prev).add(messageId))
    setTypingMessageId(null)
  }, [])

  // 处理跳过打字
  const handleSkipTyping = useCallback((messageId: string) => {
    setCompletedMessages(prev => new Set(prev).add(messageId))
    setTypingMessageId(null)
  }, [])

  // 自动滚动到底部
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  // 组件卸载时取消请求
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  // 发送消息到DeepSeek API
  const handleSend = async () => {
    if (!inputMessage.trim() || isLoading) return

    setError(null)
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    // 创建AI消息占位
    const aiMessageId = (Date.now() + 1).toString()
    const aiMessage: Message = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    }
    setMessages((prev) => [...prev, aiMessage])

    try {
      // 准备历史消息
      const historyMessages = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({
          role: m.role,
          content: m.content,
        }))

      // 创建新的AbortController
      abortControllerRef.current = new AbortController()

      // 调用API
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...historyMessages, { role: 'user', content: userMessage.content }],
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `请求失败: ${response.status}`)
      }

      const data = await response.json()

      // 更新AI消息并启用打字机效果
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMessageId
            ? { ...m, content: data.content, isStreaming: false }
            : m
        )
      )
      // 设置当前打字的消息ID
      setTypingMessageId(aiMessageId)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误'
      setError(errorMessage)
      
      // 更新AI消息为错误提示（错误消息不打字机效果）
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMessageId
            ? { 
                ...m, 
                content: `❌ 抱歉，请求失败了：${errorMessage}\n\n请检查网络连接或稍后重试。`, 
                isStreaming: false 
              }
            : m
        )
      )
      setCompletedMessages(prev => new Set(prev).add(aiMessageId))
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }

  // 使用快捷场景
  const useQuickScene = (prompt: string) => {
    setInputMessage(prompt)
  }

  // 清空对话
  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: '👋 您好！我是您的**AI语文教研助手**，由 豆包AI 驱动！\n\n我可以帮您：\n• 📚 设计教案和备课\n• ✍️ 指导作文教学\n• 📝 智能出题组卷\n• 📜 解析古诗词\n• 🎓 提供教学方法\n\n有什么可以帮您的吗？',
        timestamp: new Date(),
      },
    ])
    setError(null)
  }

  // 复制消息
  const copyMessage = (content: string, id: string) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // 重新生成
  const regenerateResponse = async () => {
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()
    if (!lastUserMessage) return

    // 移除最后的AI回复
    setMessages((prev) => {
      const lastAiIndex = prev.map(m => m.id).lastIndexOf(prev[prev.length - 1].id)
      return prev.slice(0, lastAiIndex)
    })

    setIsLoading(true)
    setError(null)

    const aiMessageId = Date.now().toString()
    const aiMessage: Message = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    }
    setMessages((prev) => [...prev, aiMessage])

    try {
      const historyMessages = messages
        .filter(m => m.id !== 'welcome' && m.role === 'user')
        .map(m => ({
          role: m.role,
          content: m.content,
        }))

      abortControllerRef.current = new AbortController()

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...historyMessages, { role: 'user', content: lastUserMessage.content }],
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `请求失败: ${response.status}`)
      }

      const data = await response.json()

      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMessageId
            ? { ...m, content: data.content, isStreaming: false }
            : m
        )
      )
      // 设置当前打字的消息ID
      setTypingMessageId(aiMessageId)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误'
      setError(errorMessage)
      
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMessageId
            ? { 
                ...m, 
                content: `❌ 抱歉，请求失败了：${errorMessage}\n\n请检查网络连接或稍后重试。`, 
                isStreaming: false 
              }
            : m
        )
      )
      setCompletedMessages(prev => new Set(prev).add(aiMessageId))
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }

  // 处理回车发送
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* 悬浮按钮 */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center group"
          title="AI教研助手"
        >
          <Bot className="w-7 h-7 group-hover:animate-bounce" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></span>
        </button>
      )}

      {/* 聊天窗口 */}
      {isOpen && (
        <div className="fixed bottom-6 left-6 z-50 w-[420px] h-[580px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          {/* 头部 */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center relative">
                <Bot className="w-6 h-6" />
                <Sparkles className="w-3 h-3 text-yellow-300 absolute -top-1 -right-1" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">AI语文教研助手</h3>
                <p className="text-xs text-primary-100 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  豆包AI 驱动
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="清空对话"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 快捷场景 */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <p className="text-xs text-gray-500 mb-2">快捷场景</p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {QUICK_SCENES.map((scene, index) => {
                const Icon = scene.icon
                return (
                  <button
                    key={index}
                    onClick={() => useQuickScene(scene.prompt)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:border-primary-300 hover:text-primary-600 transition-colors whitespace-nowrap"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {scene.title}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="px-4 py-2 bg-red-50 border-b border-red-100">
              <p className="text-xs text-red-600">⚠️ {error}</p>
            </div>
          )}

          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* 头像 */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user'
                      ? 'bg-primary-100 text-primary-600'
                      : 'bg-gradient-to-br from-primary-500 to-primary-600 text-white'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>

                {/* 消息内容 */}
                <div
                  className={`max-w-[calc(100%-3rem)] rounded-2xl px-4 py-2.5 ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <>
                      {/* 使用打字机效果显示AI回复 */}
                      {message.id === typingMessageId && !completedMessages.has(message.id) ? (
                        <TypewriterMessage
                          content={message.content}
                          isNew={true}
                          messageId={message.id}
                          onComplete={() => handleTypeComplete(message.id)}
                          onSkip={handleSkipTyping}
                        />
                      ) : (
                        <div className="prose prose-sm max-w-none prose-headings:mt-2 prose-headings:mb-1 prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeHighlight]}
                          >
                            {message.content}
                          </ReactMarkdown>
                          {message.isStreaming && (
                            <span className="inline-block w-2 h-4 bg-primary-500 animate-pulse ml-1"></span>
                          )}
                        </div>
                      )}

                      {/* 操作按钮 - 打字完成后显示 */}
                      {message.id !== typingMessageId && !message.isStreaming && message.id !== 'welcome' && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200/50">
                          <button
                            onClick={() => copyMessage(message.content, message.id)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            title="复制"
                          >
                            {copiedId === message.id ? (
                              <Check className="w-3.5 h-3.5 text-green-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-gray-400" />
                            )}
                          </button>
                          <button
                            onClick={regenerateResponse}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            title="重新生成"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
                          </button>
                          <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                            <ThumbsUp className="w-3.5 h-3.5 text-gray-400" />
                          </button>
                          <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                            <ThumbsDown className="w-3.5 h-3.5 text-gray-400" />
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* 输入区域 */}
          <div className="p-4 border-t border-gray-100 bg-white">
            <div className="flex items-end gap-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入您的问题..."
                rows={1}
                className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 max-h-32"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!inputMessage.trim() || isLoading}
                className="p-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              AI助手由 豆包AI 提供技术支持
            </p>
          </div>
        </div>
      )}
    </>
  )
}
