'use client'

import type { Lesson } from '@/types'

interface LessonViewerProps {
  lesson: Lesson
}

// 判断是否为诗词标题行（包含书名号或词牌名格式）
function isPoemTitle(line: string): boolean {
  return line.includes('杂兴') || line.includes('徐公店') || line.includes('清平乐') || 
         line.includes('芙蓉楼') || line.includes('塞下曲') || line.includes('墨梅') ||
         line.includes('词牌名') || line.includes('〔') || line.startsWith('[')
}

// 判断是否为诗句（包含标点且较短）
function isPoemLine(line: string): boolean {
  const cleanLine = line.trim()
  return cleanLine.length > 0 && cleanLine.length < 30 && 
         (cleanLine.includes('，') || cleanLine.includes('。') || cleanLine.includes('？') || cleanLine.includes('！'))
}

// 判断是否为作者信息
function isAuthorLine(line: string): boolean {
  return line.trim().startsWith('[') && line.includes(']')
}

// 渲染诗词内容
function renderPoemContent(content: string) {
  const lines = content.split('\n')
  const elements: JSX.Element[] = []
  let currentPoem: JSX.Element[] = []
  let inPoem = false
  let lineIndex = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmedLine = line.trim()

    if (trimmedLine === '') {
      if (inPoem && currentPoem.length > 0) {
        elements.push(
          <div key={`poem-${lineIndex++}`} className="mb-8">
            {currentPoem}
          </div>
        )
        currentPoem = []
        inPoem = false
      }
      continue
    }

    // 诗词标题
    if (isPoemTitle(trimmedLine) && !trimmedLine.startsWith('①') && !trimmedLine.startsWith('注释')) {
      inPoem = true
      currentPoem.push(
        <h3 key={`title-${i}`} className="text-xl font-bold text-center mb-2 mt-6">
          {trimmedLine}
        </h3>
      )
    }
    // 作者信息
    else if (isAuthorLine(trimmedLine)) {
      currentPoem.push(
        <p key={`author-${i}`} className="text-center text-white/70 mb-4">
          {trimmedLine}
        </p>
      )
    }
    // 诗句
    else if (isPoemLine(trimmedLine) && inPoem) {
      currentPoem.push(
        <p key={`line-${i}`} className="text-center text-lg mb-1 leading-relaxed text-white/90">
          {trimmedLine}
        </p>
      )
    }
    // 注释标题
    else if (trimmedLine === '注释') {
      currentPoem.push(
        <p key={`note-title-${i}`} className="text-base font-medium mt-4 mb-2 text-white/80">
          {trimmedLine}
        </p>
      )
    }
    // 注释内容
    else if (trimmedLine.startsWith('①') || trimmedLine.startsWith('②') || 
             trimmedLine.startsWith('③') || trimmedLine.startsWith('④') || trimmedLine.startsWith('⑤')) {
      currentPoem.push(
        <p key={`note-${i}`} className="text-white/60 mb-1 pl-4" style={{ fontSize: '12px' }}>
          {trimmedLine}
        </p>
      )
    }
    // 普通段落
    else {
      if (inPoem && currentPoem.length > 0) {
        elements.push(
          <div key={`poem-${lineIndex++}`} className="mb-8">
            {currentPoem}
          </div>
        )
        currentPoem = []
        inPoem = false
      }
      elements.push(
        <p key={`para-${i}`} className="indent-8 mb-6 leading-loose">
          {trimmedLine}
        </p>
      )
    }
  }

  // 处理剩余的诗词内容
  if (currentPoem.length > 0) {
    elements.push(
      <div key={`poem-${lineIndex++}`} className="mb-8">
        {currentPoem}
      </div>
    )
  }

  return elements
}

export default function LessonViewer({ lesson }: LessonViewerProps) {
  const isPoemLesson = lesson.title.includes('古诗词') || lesson.title.includes('古诗')

  return (
    <div className="max-w-3xl mx-auto">
      {/* 课文标题 */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">{lesson.title}</h2>
        <div className="flex items-center justify-center gap-4 text-sm text-white/70">
          <span>部编人教版</span>
          <span>·</span>
          <span>四年级下册</span>
          <span>·</span>
          <span>第{lesson.unitId}单元</span>
        </div>
      </div>



      {/* 课文内容 */}
      <div className="chinese-text text-lg text-white/90">
        {isPoemLesson ? renderPoemContent(lesson.content) : 
          lesson.content.split('\n\n').filter(p => p.trim()).map((paragraph, index) => (
            <p key={index} className="indent-8 mb-6 leading-loose">
              {paragraph}
            </p>
          ))
        }
      </div>



      {/* 课文信息 */}
      <div className="mt-12 pt-8 border-t border-white/20">
        <h3 className="font-semibold text-white mb-4">课文信息</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-white/60">课文编号：</span>
            <span className="text-white/90">第{lesson.lessonNumber}课</span>
          </div>
          <div>
            <span className="text-white/60">单元：</span>
            <span className="text-white/90">第{lesson.unitId}单元</span>
          </div>
          <div>
            <span className="text-white/60">字数：</span>
            <span className="text-white/90">约{lesson.content.length}字</span>
          </div>
          <div>
            <span className="text-white/60">建议课时：</span>
            <span className="text-white/90">2 课时</span>
          </div>
        </div>
      </div>
    </div>
  )
}
