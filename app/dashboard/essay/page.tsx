'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, Sparkles, PenTool, Image as ImageIcon } from 'lucide-react'

// 作文批改结果
type EssayStatus = 'draft' | 'submitted' | 'analyzing' | 'completed'

interface EssayAssessment {
  totalScore: number
  contentScore: number
  languageScore: number
  structureScore: number
  writingScore: number
  overallComment: string
  contentComments: string[]
  languageComments: string[]
  structureComments: string[]
  suggestions: string[]
  highlights: { text: string; type: 'excellent' | 'good' | 'improve' | 'error' }[]
}

export default function EssayPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<EssayStatus>('draft')
  const [wordCount, setWordCount] = useState(0)
  const [assessment, setAssessment] = useState<EssayAssessment | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const usageInstructions = "AI 作文批改支持文字输入或上传图片识别。系统按照四年级评分标准（满分 30 分）自动评分，提供内容、语言、结构等多维度点评和改进建议。"

  // 计算字数
  const handleContentChange = (text: string) => {
    setContent(text)
    setWordCount(text.replace(/\s/g, '').length)
  }

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string
      setUploadedImage(imageUrl)
      // 模拟OCR识别（实际项目中应调用OCR API）
      simulateOCR(imageUrl)
    }
    reader.readAsDataURL(file)
  }

  // 模拟OCR识别
  const simulateOCR = (imageUrl: string) => {
    setStatus('analyzing')
    
    // 模拟OCR处理时间
    setTimeout(() => {
      // 这里模拟识别出的文本
      // 实际项目中应该调用OCR API，如百度OCR、腾讯OCR等
      const mockRecognizedText = `今天是个晴朗的日子，我和爸爸妈妈一起去公园玩。

公园里有很多花草树木，五颜六色的花儿竞相开放，美丽极了。小鸟在树上欢快地歌唱，蝴蝶在花丛中翩翩起舞。

我们在草地上野餐，吃着美味的食物，聊着开心的话题。下午，我还和小伙伴们一起放风筝，看着风筝越飞越高，我的心情也格外愉快。

这真是一个难忘的周末啊！`
      
      setContent(mockRecognizedText)
      setWordCount(mockRecognizedText.replace(/\s/g, '').length)
      setTitle('快乐的周末')
      
      // 自动进行评分
      const result = analyzeEssay('快乐的周末', mockRecognizedText)
      setAssessment(result)
      setStatus('completed')
      
      alert('图片识别完成！已自动评分')
    }, 2500)
  }

  // 触发文件选择
  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // 基于真实内容的评分算法 - 更严格版本
  const analyzeEssay = (title: string, content: string): EssayAssessment => {
    const cleanContent = content.replace(/\s/g, '')
    const wordCount = cleanContent.length
    const paragraphs = content.split(/\n+/).filter(p => p.trim().length > 0)
    
    // 检查是否是乱写的内容（重复字、无意义内容）
    const uniqueChars = new Set(cleanContent).size
    const repetitionRate = uniqueChars / cleanContent.length
    const isGibberish = repetitionRate < 0.3 || cleanContent.length < 20
    
    // 检查是否有大量重复句子
    const sentences = content.split(/[。！？]/).filter(s => s.trim().length > 5)
    const uniqueSentences = new Set(sentences).size
    const sentenceRepetition = sentences.length > 0 ? uniqueSentences / sentences.length : 0
    
    // 基础分从40开始（更严格）
    let baseScore = 40
    
    // 字数评分 (0-20分) - 更严格
    let wordScore = 0
    if (wordCount >= 500) wordScore = 20
    else if (wordCount >= 400) wordScore = 16
    else if (wordCount >= 300) wordScore = 12
    else if (wordCount >= 200) wordScore = 8
    else if (wordCount >= 100) wordScore = 5
    else if (wordCount >= 50) wordScore = 3
    else wordScore = Math.max(0, wordCount / 25)
    
    // 如果是乱写，字数分大幅降低
    if (isGibberish) wordScore = Math.min(wordScore, 3)
    
    // 段落结构评分 (0-15分)
    let structureScore = 0
    if (paragraphs.length >= 4) structureScore = 15
    else if (paragraphs.length === 3) structureScore = 12
    else if (paragraphs.length === 2) structureScore = 6
    else structureScore = 2
    
    // 语言丰富度评分 (0-20分) - 更严格
    const punctuationCount = (content.match(/[，。！？、；：""''（）]/g) || []).length
    const punctuationRate = wordCount > 0 ? punctuationCount / wordCount : 0
    
    // 检查形容词使用（避免过度使用"很"）
    const simpleAdjectives = (content.match(/很[好|多|大|小|高|低|长|短|快|慢|冷|热]/g) || []).length
    const advancedAdjectives = (content.match(/[非常|特别|十分|相当|极其|格外|相当|太|真|美|漂亮|高兴|快乐|开心|难过|伤心|生气|愤怒|激动|兴奋]/g) || []).length
    const adjectiveScore = Math.max(0, advancedAdjectives * 2 - simpleAdjectives)
    
    // 修辞手法
    const rhetoricPattern = /像|好像|仿佛|如同|似的|宛如|犹如|好比|是|成了|变成|比|似|拟人|排比|夸张/g
    const rhetoricCount = (content.match(rhetoricPattern) || []).length
    
    // 语言丰富度计算
    let languageRichness = Math.min(20, 
      (punctuationRate * 50) + 
      (adjectiveScore * 1.5) + 
      (rhetoricCount * 3)
    )
    
    // 如果句子重复率高，语言分降低
    if (sentenceRepetition < 0.7) languageRichness *= 0.7
    
    // 内容充实度 (0-25分) - 更严格
    // 检查是否有具体细节描写
    const detailIndicators = ['看', '听', '闻', '摸', '想', '感觉', '好像', '仿佛', '像']
    const detailCount = detailIndicators.reduce((sum, word) => sum + (content.split(word).length - 1), 0)
    const detailRate = wordCount > 0 ? detailCount / wordCount : 0
    
    // 检查是否有具体事例
    const hasExamples = content.includes('例如') || content.includes('比如') || content.includes('有一次') || 
                       content.includes('记得') || content.includes('那天') || sentences.length >= 5
    
    let contentRichness = Math.min(25, 
      (detailRate * 200) + 
      (hasExamples ? 10 : 0) + 
      (wordCount / 40)
    )
    
    // 如果是乱写，内容分极低
    if (isGibberish) contentRichness = Math.min(contentRichness, 5)
    
    // 书写规范度 (0-20分) - 更严格
    const errorPatterns = [
      { pattern: /[的地得]的/g, desc: '的地得混用' },
      { pattern: /[的地得]地/g, desc: '的地得混用' },
      { pattern: /[的地得]得/g, desc: '的地得混用' },
      { pattern: /[的][^\u4e00-\u9fa5]/g, desc: '标点错误' },
      { pattern: /[了][^\u4e00-\u9fa5，。！？]/g, desc: '标点错误' },
      { pattern: /[，]{2,}/g, desc: '重复标点' },
      { pattern: /[。]{2,}/g, desc: '重复标点' },
    ]
    let errorCount = 0
    errorPatterns.forEach(({ pattern }) => {
      errorCount += (content.match(pattern) || []).length
    })
    
    // 检查是否有错别字（简单检查）
    const typoPatterns = ['的得地', '在再', '做作', '的地得']
    let typoCount = 0
    typoPatterns.forEach(typo => {
      if (content.includes(typo)) typoCount++
    })
    
    let writingScore = Math.max(0, 20 - errorCount * 2 - typoCount * 3)
    
    // 计算各项得分 - 更严格的权重
    const contentScore = Math.round(Math.min(25, wordScore * 0.6 + contentRichness))
    const languageScore = Math.round(Math.min(25, languageRichness))
    const finalStructureScore = Math.round(Math.min(15, structureScore))
    const finalWritingScore = Math.round(Math.min(20, writingScore))
    const totalScore = Math.round(contentScore + languageScore + finalStructureScore + finalWritingScore + baseScore * 0.15)
    
    // 确保分数在合理范围内
    const finalTotalScore = Math.max(0, Math.min(100, totalScore))
    
    // 生成评语
    const contentComments: string[] = []
    const languageComments: string[] = []
    const structureComments: string[] = []
    const suggestions: string[] = []
    
    // 内容评语
    if (isGibberish) {
      contentComments.push('内容过于简单或重复，缺乏实质内容')
      suggestions.push('请认真写作，表达真实的想法和感受')
    } else if (wordCount >= 400) {
      contentComments.push('字数充足，内容较为充实')
    } else if (wordCount >= 200) {
      contentComments.push('字数基本达标')
      suggestions.push('可以增加更多细节描写，丰富内容')
    } else {
      contentComments.push('字数不足，内容单薄')
      suggestions.push('需要大幅增加字数，充实内容')
    }
    
    if (detailRate > 0.1) {
      contentComments.push('有一定的细节描写')
    } else if (!isGibberish) {
      suggestions.push('增加感官细节描写（视觉、听觉、嗅觉等）')
    }
    
    // 语言评语
    if (simpleAdjectives > 5) {
      languageComments.push('形容词使用较单一，避免过度使用"很"字')
      suggestions.push('尝试使用更丰富的形容词，减少"很"字的使用')
    } else if (advancedAdjectives > 3 || rhetoricCount > 2) {
      languageComments.push('语言表达较好，有一定文采')
    } else {
      languageComments.push('语言较为平淡')
      suggestions.push('多使用修辞手法，让语言更生动')
    }
    
    if (sentenceRepetition < 0.7) {
      suggestions.push('避免重复相似的句子')
    }
    
    // 结构评语
    if (paragraphs.length >= 3) {
      structureComments.push('文章结构基本完整')
    } else {
      structureComments.push('段落划分不够清晰')
      suggestions.push('建议按照"开头-中间-结尾"三段式结构写作')
    }
    
    // 书写评语
    if (errorCount === 0 && typoCount === 0) {
      languageComments.push('书写规范，标点正确')
    } else if (errorCount <= 2) {
      languageComments.push('有个别书写不规范的地方')
      suggestions.push('注意"的、地、得"的正确使用')
    } else {
      suggestions.push('书写错误较多，需要认真检查')
      suggestions.push('注意标点符号的规范使用')
    }
    
    // 总体评价
    let overallComment = ''
    if (isGibberish) {
      overallComment = '这篇作文内容过于简单或重复，无法给出有效评分。请认真写作，表达真实的想法和感受。'
    } else if (finalTotalScore >= 90) {
      overallComment = '这是一篇优秀的作文！立意明确，内容充实，语言流畅，结构完整。继续保持！'
    } else if (finalTotalScore >= 80) {
      overallComment = '作文整体不错，但在某些方面还有提升空间。参考建议进行修改会更好！'
    } else if (finalTotalScore >= 70) {
      overallComment = '作文基本合格，但在内容、语言或结构方面需要改进。请认真参考建议进行修改。'
    } else if (finalTotalScore >= 60) {
      overallComment = '作文存在一些问题。建议多阅读优秀范文，学习写作技巧，注意积累好词好句。'
    } else if (finalTotalScore >= 40) {
      overallComment = '作文需要大幅改进。建议认真审题，理清思路，多写多练，必要时请老师指导。'
    } else {
      overallComment = '作文质量较差。请认真对待写作，从基础开始练习，逐步提高写作水平。'
    }
    
    // 生成高亮（基于实际内容）
    const highlights: { text: string; type: 'excellent' | 'good' | 'improve' | 'error' }[] = []
    
    // 使用之前定义的 sentences 变量
    sentences.forEach(sentence => {
      if (sentence.match(/像|好像|仿佛|如同|似的/)) {
        highlights.push({ text: sentence.trim().slice(0, 20) + '...', type: 'excellent' })
      } else if (sentence.length > 15 && sentence.match(/[，。]/g)?.length && sentence.length > 10) {
        highlights.push({ text: sentence.trim().slice(0, 20) + '...', type: 'good' })
      }
    })
    
    // 找出需要改进的地方
    if (content.match(/很[好|多|大|小|高|低]/g)) {
      highlights.push({ text: '使用"很"字较多，可以换更生动的表达', type: 'improve' })
    }
    if (errorCount > 0) {
      highlights.push({ text: '注意标点符号和"的地得"的使用', type: 'error' })
    }
    
    return {
      totalScore: finalTotalScore,
      contentScore,
      languageScore,
      structureScore: finalStructureScore,
      writingScore: finalWritingScore,
      overallComment,
      contentComments,
      languageComments,
      structureComments,
      suggestions: Array.from(new Set(suggestions)).slice(0, 5),
      highlights: highlights.slice(0, 6),
    }
  }

  // 提交批改 - 调用AI API
  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert('请输入作文标题和内容')
      return
    }
    
    setStatus('analyzing')
    
    try {
      // 调用AI批改API
      const response = await fetch('/api/essay/grade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content }),
      })

      if (!response.ok) {
        throw new Error('批改服务暂时不可用')
      }

      const data = await response.json()
      setAssessment(data.assessment)
      setStatus('completed')
    } catch (error) {
      console.error('作文批改失败:', error)
      alert('AI批改服务暂时不可用，请稍后重试')
      setStatus('draft')
    }
  }

  // 获取分数颜色（满分30分制）
  const getScoreColor = (score: number) => {
    if (score >= 27) return 'text-green-600 bg-green-50'
    if (score >= 24) return 'text-blue-600 bg-blue-50'
    if (score >= 21) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  // 获取高亮样式
  const getHighlightClass = (type: string) => {
    switch (type) {
      case 'excellent':
        return 'bg-green-100 border-b-2 border-green-500'
      case 'good':
        return 'bg-blue-100 border-b-2 border-blue-500'
      case 'improve':
        return 'bg-yellow-100 border-b-2 border-yellow-500'
      case 'error':
        return 'bg-red-100 border-b-2 border-red-500'
      default:
        return ''
    }
  }

  return (
    <div className="max-w-6xl mx-auto min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* 使用说明 */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg mb-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <PenTool className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white mb-1">使用说明</h3>
            <p className="text-sm text-white/70 leading-relaxed">{usageInstructions}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">作文批改辅助</h1>
          <p className="text-white/80 mt-1">AI 智能批改，提供多维度评价与改进建议</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：作文输入 */}
        <div className="space-y-4">
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white">作文内容</h2>
              <span className="text-sm text-white/70">{wordCount} 字</span>
            </div>
            
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入作文标题"
              className="w-full px-4 py-2 bg-white/90 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4 text-gray-900"
            />
            
            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              rows={20}
              placeholder="请输入或粘贴作文内容..."
              className="w-full px-4 py-3 bg-white/90 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none text-gray-900"
            />

            {/* 图片预览 */}
            {uploadedImage && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">已上传的图片：</p>
                <img src={uploadedImage} alt="上传的作文" className="max-h-48 rounded-lg border border-gray-200" />
              </div>
            )}

            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button 
                  onClick={triggerFileInput}
                  className="flex items-center gap-2 px-3 py-2 text-white/80 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <ImageIcon className="w-4 h-4 text-white/70" />
                  上传图片
                </button>

              </div>
              <button
                onClick={handleSubmit}
                disabled={status === 'analyzing'}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg hover:from-blue-600 hover:to-teal-600 transition-colors disabled:opacity-50 shadow-md"
              >
                {status === 'analyzing' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    批改中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    AI批改
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 使用提示 */}
          <div className="bg-amber-500/20 p-4 rounded-xl border border-amber-500/30">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-white">
                <p className="font-medium mb-1">教师使用提示</p>
                <p>本功能供教师测试作文批改标准使用。AI批改结果仅供参考，最终评分请以教师专业判断为准。</p>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：批改结果 */}
        <div className="space-y-4">
          {status === 'draft' && (
            <div className="bg-white/10 backdrop-blur-sm p-12 rounded-xl shadow-sm border border-white/20 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <PenTool className="w-8 h-8 text-white" />
              </div>
              <p className="text-white/80">输入作文内容后点击"AI批改"</p>
              <p className="text-sm text-white/60 mt-2">获取智能批改结果</p>
            </div>
          )}

          {status === 'analyzing' && (
            <div className="bg-white/10 backdrop-blur-sm p-12 rounded-xl shadow-sm border border-white/20 text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Sparkles className="w-8 h-8 text-blue-400" />
              </div>
              <p className="text-white/80">AI正在分析作文...</p>
              <p className="text-sm text-white/60 mt-2">请稍候</p>
            </div>
          )}

          {status === 'completed' && assessment && (
            <>
              {/* 总分 */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-center">
                  <div className={`text-6xl font-bold inline-block px-6 py-3 rounded-xl ${getScoreColor(assessment.totalScore)}`}>
                    {assessment.totalScore}<span className="text-2xl text-gray-400">/30</span>
                  </div>
                  <p className="text-gray-500 mt-2">综合得分</p>
                </div>
              </div>

              {/* 分项得分 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                  <div className={`text-2xl font-bold ${getScoreColor(assessment.contentScore * 3).split(' ')[0]}`}>
                    {assessment.contentScore}<span className="text-sm text-gray-400">/10</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">内容</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                  <div className={`text-2xl font-bold ${getScoreColor(assessment.languageScore * 3.75).split(' ')[0]}`}>
                    {assessment.languageScore}<span className="text-sm text-gray-400">/8</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">语言</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                  <div className={`text-2xl font-bold ${getScoreColor(assessment.structureScore * 4.3).split(' ')[0]}`}>
                    {assessment.structureScore}<span className="text-sm text-gray-400">/7</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">结构</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                  <div className={`text-2xl font-bold ${getScoreColor(assessment.writingScore * 6).split(' ')[0]}`}>
                    {assessment.writingScore}<span className="text-sm text-gray-400">/5</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">书写</div>
                </div>
              </div>

              {/* 总体评价 */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-3">总体评价</h3>
                <p className="text-gray-700 leading-relaxed">{assessment.overallComment}</p>
              </div>

              {/* 详细评价 */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4">详细评价</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">内容方面</h4>
                    <ul className="space-y-1">
                      {assessment.contentComments.map((comment, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {comment}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">语言方面</h4>
                    <ul className="space-y-1">
                      {assessment.languageComments.map((comment, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {comment}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">结构方面</h4>
                    <ul className="space-y-1">
                      {assessment.structureComments.map((comment, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {comment}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* 改进建议 */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4">改进建议</h3>
                <div className="space-y-2">
                  {assessment.suggestions.map((suggestion, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
                      <span className="w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-sm text-gray-700">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
