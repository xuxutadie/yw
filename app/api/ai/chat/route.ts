import { NextRequest, NextResponse } from 'next/server'
import { chatWithAI, chatWithAIStream, Message } from '@/utils/ai-service'

// 处理POST请求
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, stream = false } = body as { messages: Message[]; stream?: boolean }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: '消息列表不能为空' },
        { status: 400 }
      )
    }

    // 流式响应
    if (stream) {
      const encoder = new TextEncoder()
      const streamGenerator = chatWithAIStream(messages)

      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of streamGenerator) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`))
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'))
            controller.close()
          } catch (error) {
            controller.error(error)
          }
        },
      })

      return new Response(readableStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }

    // 非流式响应
    const response = await chatWithAI(messages)
    return NextResponse.json({ content: response })
  } catch (error) {
    console.error('AI聊天API错误:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器内部错误' },
      { status: 500 }
    )
  }
}
