'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, BookOpen, PenTool, FileText, Lightbulb } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// 快捷场景
const QUICK_SCENES = [
  { icon: BookOpen, title: '备课辅助', prompt: '请帮我设计《春》这篇课文的教学目标' },
  { icon: PenTool, title: '作文指导', prompt: '如何指导学生写好记叙文的开头？' },
  { icon: FileText, title: '出题建议', prompt: '请为三年级语文设计5道阅读理解题' },
  { icon: Lightbulb, title: '教学方法', prompt: '有什么好的方法教学生理解比喻句？' },
]

// 模拟AI回复
const mockAIResponse = (userMessage: string): string => {
  const responses: Record<string, string> = {
    '备课': '针对这篇课文，建议从以下几个维度设计教学目标：\n\n1. **知识与技能**：掌握生字词，理解课文主要内容\n2. **过程与方法**：通过朗读品味语言，学习写景方法\n3. **情感态度**：感受春天的美好，培养热爱自然的情感\n\n教学重点：品味语言，体会情感\n教学难点：学习作者观察景物的方法',
    '作文': '指导学生写好记叙文开头，可以尝试以下方法：\n\n1. **开门见山法**：直接点明时间、地点、人物\n2. **环境描写法**：用景物描写渲染气氛\n3. **悬念设置法**：提出疑问，引发读者兴趣\n4. **引用法**：引用名言、诗句开头\n\n建议让学生多阅读优秀范文，积累开头素材。',
    '出题': '以下是5道三年级阅读理解题：\n\n**题目一：词语理解**\n"小明兴高采烈地跑回家"中"兴高采烈"的意思是（ ）\nA. 很生气  B. 很高兴  C. 很着急\n\n**题目二：内容理解**\n根据文章内容，小明为什么跑回家？\n\n**题目三：推理判断**\n从文中可以推断出小明的性格特点是？\n\n**题目四：情感体会**\n读完全文，你感受到了什么？\n\n**题目五：拓展延伸**\n如果你是小明，你会怎么做？',
    '比喻': '教学生理解比喻句，可以采用以下步骤：\n\n1. **识别比喻词**：像、好像、仿佛、如同等\n2. **找出本体和喻体**：被比喻的事物和用来比喻的事物\n3. **分析相似点**：两者有什么共同特征\n4. **体会表达效果**：这样写有什么好处\n\n**示例**："弯弯的月亮像小船"\n- 本体：月亮\n- 喻体：小船\n- 相似点：形状都是弯弯的\n- 效果：生动形象地写出了月亮的形状',
  }

  // 根据关键词匹配回复
  for (const [key, response] of Object.entries(responses)) {
    if (userMessage.includes(key)) {
      return response
    }
  }

  return '感谢您的提问！作为您的语文教学助手，我可以帮助您：\n\n• 设计教学方案和教案\n• 提供作文指导建议\n• 生成练习题和试卷\n• 解答语文教学中的疑问\n• 推荐教学资源和方法\n\n请告诉我您具体需要什么帮助？'
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '您好！我是您的语文教学AI助手。我可以帮助您备课、设计教案、指导作文教学、生成试题等。请问有什么可以帮您？',
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 发送消息
  const handleSend = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    // 模拟AI回复
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: mockAIResponse(userMessage.content),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 1000)
  }

  // 使用快捷场景
  const useQuickScene = (prompt: string) => {
    setInputMessage(prompt)
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI教研助手</h1>
          <p className="text-gray-500 mt-1">智能教学辅助，随时随地为您解答教学问题</p>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* 左侧：快捷场景 */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-full">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary-600" />
              快捷场景
            </h3>
            <div className="space-y-2">
              {QUICK_SCENES.map((scene, index) => {
                const Icon = scene.icon
                return (
                  <button
                    key={index}
                    onClick={() => useQuickScene(scene.prompt)}
                    className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-4 h-4 text-primary-600" />
                    </div>
                    <span className="text-sm text-gray-700">{scene.title}</span>
                  </button>
                )
              })}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">使用提示</h4>
              <ul className="text-xs text-gray-500 space-y-2">
                <li>• 可以询问备课相关问题</li>
                <li>• 获取作文教学建议</li>
                <li>• 生成练习题和试卷</li>
                <li>• 解答教学疑难问题</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 右侧：对话区域 */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* 头像 */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' ? 'bg-primary-100' : 'bg-green-100'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-primary-600" />
                  ) : (
                    <Bot className="w-4 h-4 text-green-600" />
                  )}
                </div>

                {/* 消息内容 */}
                <div className={`max-w-[80%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-4 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 mt-1">
                    {message.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {/* 加载中 */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-green-600" />
                </div>
                <div className="bg-gray-100 p-4 rounded-2xl">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 输入区域 */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="输入您的问题..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                onClick={handleSend}
                disabled={!inputMessage.trim() || isLoading}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              AI助手仅供参考，请以您的专业判断为准
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
