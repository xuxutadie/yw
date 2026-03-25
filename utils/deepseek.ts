// DeepSeek API服务

const API_KEY = process.env.DEEPSEEK_API_KEY
const API_URL = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions'

export interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface DeepSeekResponse {
  choices: {
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// 系统提示词 - 定义AI助手的角色
const SYSTEM_PROMPT = `你是一位专业的小学语文教学专家，具备以下特点：

1. **专业背景**
   - 熟悉部编版小学语文教材（1-6年级）
   - 精通语文教学法、课程设计、学生心理
   - 了解"双减"政策和素质教育要求

2. **服务范围**
   - 备课辅助：教学目标设计、教案编写、重难点分析
   - 作文指导：写作技巧、批改建议、范文点评
   - 出题组卷：练习题设计、试卷编制、阅读理解题
   - 古诗词教学：诗词解析、背诵技巧、文化背景
   - 教学方法：课堂管理、互动技巧、差异化教学

3. **回答风格**
   - 专业、实用、易懂
   - 结构清晰，条理分明
   - 提供具体的教学案例和建议
   - 鼓励创新教学方法

请用中文回答，使用Markdown格式让内容更易读。`

// 调用DeepSeek API
export async function chatWithDeepSeek(messages: Message[]): Promise<string> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 2000,
        stream: false,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || `API请求失败: ${response.status}`)
    }

    const data: DeepSeekResponse = await response.json()
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('API返回数据格式错误')
    }

    return data.choices[0].message.content
  } catch (error) {
    console.error('DeepSeek API调用失败:', error)
    throw error
  }
}

// 流式调用DeepSeek API（用于打字机效果）
export async function* chatWithDeepSeekStream(messages: Message[]): AsyncGenerator<string, void, unknown> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 2000,
        stream: true,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || `API请求失败: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('无法读取响应流')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') return

          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices?.[0]?.delta?.content
            if (content) {
              yield content
            }
          } catch {
            // 忽略解析错误
          }
        }
      }
    }
  } catch (error) {
    console.error('DeepSeek API流式调用失败:', error)
    throw error
  }
}
