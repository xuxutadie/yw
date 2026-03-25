import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Question, ExamPaper } from '@/types'

interface QuestionState {
  // 题库
  questions: Question[]
  examPapers: ExamPaper[]
  initialized: boolean
  
  // 操作方法
  addQuestion: (question: Omit<Question, 'id' | 'createdAt'>) => void
  updateQuestion: (id: string, updates: Partial<Question>) => void
  deleteQuestion: (id: string) => void
  initSampleQuestions: () => void
  
  // 组卷
  createExamPaper: (paper: Omit<ExamPaper, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateExamPaper: (id: string, updates: Partial<ExamPaper>) => void
  deleteExamPaper: (id: string) => void
  
  // 查询
  getQuestionsByGrade: (grade: number) => Question[]
  getQuestionsByType: (type: Question['type']) => Question[]
  searchQuestions: (keyword: string) => Question[]
  generateSimilarQuestion: (originalQuestion: Question) => Question | null
}

// 示例题目
const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 'sample-1',
    type: 'choice',
    content: '下列词语中，加点字的读音全部正确的一项是（ ）',
    options: [
      'A. 酝酿(niàng) 应和(hè) 黄晕(yùn)',
      'B. 嘹亮(liáo) 抖擞(sǒu) 窠巢(guǒ)',
      'C. 朗润(rùn) 卖弄(lòng) 喉咙(hóu)',
      'D. 烘托(hōng) 风筝(zēng) 静默(mò)',
    ],
    answer: 'A',
    analysis: 'B项"窠"应读kē；C项"弄"应读nòng；D项"筝"应读zheng。',
    difficulty: 'medium',
    knowledgePoint: '字音辨析',
    grade: 7,
    source: '《春》课后练习',
    createdBy: '1',
    createdAt: new Date(),
  },
  {
    id: 'sample-2',
    type: 'fill_blank',
    content: '《春》的作者是____，原名____，字____，现代著名____、____。',
    answer: '朱自清；自华；佩弦；散文家；诗人',
    analysis: '本题考查文学常识，需要准确记忆作者的基本信息。',
    difficulty: 'easy',
    knowledgePoint: '文学常识',
    grade: 7,
    source: '课文基础知识',
    createdBy: '1',
    createdAt: new Date(),
  },
]

export const useQuestionStore = create<QuestionState>()(
  persist(
    (set, get) => ({
      questions: [],
      examPapers: [],
      initialized: false,
      
      initSampleQuestions: () => {
        const state = get()
        if (!state.initialized) {
          set({
            questions: [...SAMPLE_QUESTIONS],
            initialized: true,
          })
        }
      },

      addQuestion: (question) => {
        const newQuestion: Question = {
          ...question,
          id: Date.now().toString(),
          createdAt: new Date(),
        }
        set((state) => ({
          questions: [...state.questions, newQuestion],
        }))
      },

      updateQuestion: (id, updates) => {
        set((state) => ({
          questions: state.questions.map((q) =>
            q.id === id ? { ...q, ...updates } : q
          ),
        }))
      },

      deleteQuestion: (id) => {
        set((state) => ({
          questions: state.questions.filter((q) => q.id !== id),
        }))
      },

      createExamPaper: (paper) => {
        const newPaper: ExamPaper = {
          ...paper,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        set((state) => ({
          examPapers: [...state.examPapers, newPaper],
        }))
      },

      updateExamPaper: (id, updates) => {
        set((state) => ({
          examPapers: state.examPapers.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
          ),
        }))
      },

      deleteExamPaper: (id) => {
        set((state) => ({
          examPapers: state.examPapers.filter((p) => p.id !== id),
        }))
      },

      getQuestionsByGrade: (grade) => {
        return get().questions.filter((q) => q.grade === grade)
      },

      getQuestionsByType: (type) => {
        return get().questions.filter((q) => q.type === type)
      },

      searchQuestions: (keyword) => {
        return get().questions.filter((q) =>
          q.content.toLowerCase().includes(keyword.toLowerCase()) ||
          q.knowledgePoint.toLowerCase().includes(keyword.toLowerCase())
        )
      },

      // AI生成同类题
      generateSimilarQuestion: (original) => {
        // 简化版本：基于原题生成变式题
        const variations: Record<string, string[]> = {
          '比喻': ['拟人', '夸张', '排比'],
          '动词': ['形容词', '副词', '名词'],
        }
        
        // 简单替换关键词生成变式
        let newContent = original.content
        Object.entries(variations).forEach(([key, values]) => {
          if (newContent.includes(key)) {
            const replacement = values[Math.floor(Math.random() * values.length)]
            newContent = newContent.replace(key, replacement)
          }
        })

        if (newContent === original.content) return null

        return {
          ...original,
          id: Date.now().toString(),
          content: newContent,
          createdAt: new Date(),
        }
      },
    }),
    {
      name: 'question-storage',
    }
  )
)
