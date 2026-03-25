import { NextRequest, NextResponse } from 'next/server'
import { chatWithAI } from '@/utils/ai-service'

// 作文批改系统提示词
const ESSAY_GRADING_PROMPT = `你是一位小学四年级语文老师，正在批改班上学生的作文。请按照四年级学生的实际水平进行评分，并严格按照以下JSON格式返回评分结果：

{
  "totalScore": 总分(0-30),
  "contentScore": 内容分(0-10),
  "languageScore": 语言分(0-8),
  "structureScore": 结构分(0-7),
  "writingScore": 书写分(0-5),
  "overallComment": "总体评价(100字左右)",
  "contentComments": ["内容评语（包含扣分原因）", "内容优点"],
  "languageComments": ["语言评语（包含扣分原因）", "语言优点"],
  "structureComments": ["结构评语（包含扣分原因）"],
  "suggestions": ["改进建议1", "改进建议2", "改进建议3"],
  "highlights": [
    {"text": "优秀句子片段", "type": "excellent"},
    {"text": "好句子片段", "type": "good"},
    {"text": "需改进的句子", "type": "improve"},
    {"text": "错误的地方", "type": "error"}
  ]
}

四年级作文评分标准（满分30分）：
1. 内容分(10分)：
   - 能围绕一个主题写清楚一件事或一个人（4分基础分）
   - 有具体的事例或细节描写（+2分）
   - 能写出自己的真实感受（+2分）
   - 字数300-400字左右为宜（+2分，少于250字扣2分）
   
2. 语言分(8分)：
   - 语句通顺，没有病句（3分基础分）
   - 用词比较准确，会用一些成语或好词（+2分）
   - 能使用简单的修辞手法（比喻、拟人等）（+2分）
   - 错别字少，标点使用基本正确（+1分，错别字多酌情扣分）
   
3. 结构分(7分)：
   - 有开头、中间、结尾三段（3分基础分）
   - 开头能点题，结尾能总结（+2分）
   - 段落分明，条理清楚（+2分）
   
4. 书写分(5分)：
   - 字迹工整，卷面整洁（2分）
   - 标点符号使用正确（2分）
   - 格式规范，分段正确（1分）

四年级评分尺度（满分30分）：
- 优秀（27-30分）：内容具体，语句通顺，有细节描写，结构完整
- 良好（24-26分）：内容较具体，语句通顺，结构较完整
- 合格（21-23分）：能围绕主题写，语句基本通顺，有基本结构
- 待提高（18-20分）：内容简单，语句不够通顺，结构不够清晰
- 不合格（18分以下）：跑题、字数太少或明显乱写

注意：
- 你是四年级语文老师，评分要符合四年级教学大纲要求
- 四年级要求能写清楚一件事，有简单的细节描写
- 评语要像老师对学生说话的语气，亲切但有要求
- 【重要】每条评语都要说明扣分原因，例如："内容较简单，缺少细节描写，扣5分"
- 既要指出问题（说明扣几分），也要肯定优点
- 建议要具体，是四年级学生能做到的
- 必须返回合法的JSON格式
- highlights最多返回6条`

// 处理POST请求
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content } = body as { title: string; content: string }

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: '作文内容不能为空' },
        { status: 400 }
      )
    }

    // 构建批改请求
    const messages = [
      {
        role: 'system' as const,
        content: ESSAY_GRADING_PROMPT,
      },
      {
        role: 'user' as const,
        content: `请批改以下作文：\n\n标题：${title || '无标题'}\n\n正文：\n${content}`,
      },
    ]

    // 调用AI进行批改
    const response = await chatWithAI(messages)
    
    // 解析JSON响应
    try {
      // 尝试从响应中提取JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const assessment = JSON.parse(jsonMatch[0])
        return NextResponse.json({ assessment })
      } else {
        throw new Error('无法解析AI响应')
      }
    } catch (parseError) {
      console.error('解析AI响应失败:', parseError)
      // 返回备用评分
      return NextResponse.json({
        assessment: generateFallbackAssessment(content),
        warning: 'AI响应解析失败，使用备用评分',
      })
    }
  } catch (error) {
    console.error('作文批改API错误:', error)
    return NextResponse.json(
      { error: '批改服务暂时不可用，请稍后重试' },
      { status: 500 }
    )
  }
}

// 备用评分（当AI调用失败时使用）
function generateFallbackAssessment(content: string) {
  const wordCount = content.replace(/\s/g, '').length
  
  return {
    totalScore: 70,
    contentScore: 18,
    languageScore: 17,
    structureScore: 15,
    writingScore: 15,
    overallComment: '由于AI服务暂时不可用，使用基础评分。建议稍后重新提交获取详细批改。',
    contentComments: [`字数约${wordCount}字`, '内容基本完整'],
    languageComments: ['语言通顺', '表达清楚'],
    structureComments: ['结构基本完整'],
    suggestions: ['稍后重新提交获取AI详细批改', '增加更多细节描写', '注意书写规范'],
    highlights: [],
  }
}
