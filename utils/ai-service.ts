// AI服务 - 使用豆包API

// 获取环境变量（在运行时读取）
function getDoubaoConfig() {
  return {
    apiKey: process.env.DOUBAO_API_KEY,
    apiUrl: process.env.DOUBAO_API_URL || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    endpointId: process.env.DOUBAO_ENDPOINT_ID,
  }
}

export interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AIResponse {
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

// 调用AI API（使用豆包）
export async function chatWithAI(messages: Message[]): Promise<string> {
  return chatWithDoubao(messages)
}

// 流式调用AI API（使用豆包）
export async function* chatWithAIStream(messages: Message[]): AsyncGenerator<string, void, unknown> {
  yield* chatWithDoubaoStream(messages)
}

// 调用豆包API
export async function chatWithDoubao(messages: Message[]): Promise<string> {
  const config = getDoubaoConfig()
  
  if (!config.apiKey) {
    throw new Error('DOUBAO_API_KEY 环境变量未配置')
  }
  
  if (!config.endpointId) {
    throw new Error('DOUBAO_ENDPOINT_ID 环境变量未配置')
  }
  
  try {
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.endpointId,
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

    const data: AIResponse = await response.json()
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('API返回数据格式错误')
    }

    return data.choices[0].message.content
  } catch (error) {
    console.error('豆包API调用失败:', error)
    throw error
  }
}

// 流式调用豆包API
export async function* chatWithDoubaoStream(messages: Message[]): AsyncGenerator<string, void, unknown> {
  const config = getDoubaoConfig()
  
  if (!config.apiKey) {
    throw new Error('DOUBAO_API_KEY 环境变量未配置')
  }
  
  if (!config.endpointId) {
    throw new Error('DOUBAO_ENDPOINT_ID 环境变量未配置')
  }
  
  try {
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.endpointId,
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
      throw new Error('无法获取响应流')
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
        if (line.trim() === '') continue
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') return
          
          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices?.[0]?.delta?.content || ''
            if (content) {
              yield content
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }
  } catch (error) {
    console.error('豆包API流式调用失败:', error)
    throw error
  }
}
