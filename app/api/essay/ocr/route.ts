import { NextRequest, NextResponse } from 'next/server'

// 获取环境变量（在运行时读取）
function getDoubaoConfig() {
  return {
    apiKey: process.env.DOUBAO_API_KEY,
    apiUrl: process.env.DOUBAO_API_URL || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    endpointId: process.env.DOUBAO_ENDPOINT_ID,
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageUrl } = body as { imageUrl: string }

    if (!imageUrl) {
      return NextResponse.json(
        { error: '图片URL不能为空' },
        { status: 400 }
      )
    }

    const config = getDoubaoConfig()
    if (!config.apiKey || !config.endpointId) {
      throw new Error('Doubao API配置缺失')
    }

    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.endpointId,
        messages: [
          {
            role: 'system',
            content: '你是一个专业的OCR文字提取工具。请准确提取用户提供图片中的所有文字。如果是作文本，请忽略网格线，只提取手写的汉字和标点。只返回提取出的文字，不要返回任何多余的解释、寒暄或格式。',
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: '请提取这张图片里的文字内容：' },
              { type: 'image_url', image_url: { url: imageUrl } }
            ],
          },
        ],
        temperature: 0.1,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || `API请求失败: ${response.status}`)
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content || ''

    return NextResponse.json({ text: text.trim() })
  } catch (error) {
    console.error('OCR API Error:', error)
    const message = error instanceof Error ? error.message : 'OCR识别失败'
    const isTooLargeError = message.includes('exceeds the limit')
    return NextResponse.json(
      {
        error: isTooLargeError
          ? '图片文件过大，已超过OCR接口限制，请上传更小图片或压缩后重试'
          : message,
      },
      { status: isTooLargeError ? 413 : 500 }
    )
  }
}
