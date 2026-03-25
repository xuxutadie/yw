// 用户类型定义 - 仅限教师
export type UserRole = 'teacher' | 'admin'

export interface Teacher {
  id: string
  name: string
  email: string
  role: UserRole
  school?: string
  grade?: number // 1-6 年级
  subject: 'chinese'
  avatar?: string // 头像 URL
  createdAt: Date
  lastLoginAt: Date
}

// 教材相关类型
export type TextbookVersion = '部编人教版' | '苏教版' | '北师大版'

export interface Textbook {
  id: string
  version: TextbookVersion
  grade: number
  semester: '上册' | '下册'
  title: string
  units: Unit[]
}

export interface Unit {
  id: string
  textbookId: string
  unitNumber: number
  title: string
  lessons: Lesson[]
}

export interface Lesson {
  id: string
  unitId: string
  lessonNumber: number
  title: string
  content: string
  annotations?: Annotation[]
  audioUrl?: string
  teachingPlan?: TeachingPlan
  courseware?: Courseware
}

// 备课相关
export interface Annotation {
  id: string
  lessonId: string
  teacherId: string
  content: string
  position: { start: number; end: number }
  color: string
  createdAt: Date
  updatedAt: Date
}

export interface TeachingPlan {
  id: string
  lessonId: string
  teacherId: string
  objectives: string[]
  keyPoints: string[]
  difficulties: string[]
  procedures: TeachingProcedure[]
  homework: string
  reflection?: string
  createdAt: Date
  updatedAt: Date
}

export interface TeachingProcedure {
  step: number
  title: string
  content: string
  duration: number // 分钟
  method: string
}

export interface Courseware {
  id: string
  lessonId: string
  teacherId: string
  slides: Slide[]
  createdAt: Date
  updatedAt: Date
}

export interface Slide {
  id: string
  order: number
  title: string
  content: string
  mediaUrl?: string
}

// 朗读测评
export interface ReadingAssessment {
  id: string
  lessonId: string
  teacherId: string
  audioUrl: string
  transcript: string
  score: number
  fluency: number
  accuracy: number
  completeness: number
  feedback: string
  createdAt: Date
}

// 出题组卷
export type QuestionType = 'choice' | 'fill_blank' | 'short_answer' | 'essay'
export type DifficultyLevel = 'easy' | 'medium' | 'hard'

export interface Question {
  id: string
  type: QuestionType
  content: string
  options?: string[]
  answer: string
  analysis: string
  difficulty: DifficultyLevel
  knowledgePoint: string
  grade: number
  source?: string
  createdBy: string
  createdAt: Date
}

export interface ExamPaper {
  id: string
  title: string
  teacherId: string
  grade: number
  questions: Question[]
  totalScore: number
  timeLimit: number
  createdAt: Date
  updatedAt: Date
}

// 作文批改
export interface Essay {
  id: string
  teacherId: string
  title: string
  content: string
  wordCount: number
  assessment?: EssayAssessment
  createdAt: Date
}

export interface EssayAssessment {
  id: string
  essayId: string
  totalScore: number
  contentScore: number
  languageScore: number
  structureScore: number
  writingScore: number
  comments: string
  suggestions: string[]
  highlights: TextHighlight[]
  createdAt: Date
}

export interface TextHighlight {
  start: number
  end: number
  type: 'good' | 'improve'
  comment: string
}

// 学情分析
export interface ClassAnalysis {
  id: string
  teacherId: string
  className: string
  grade: number
  semester: string
  examResults: ExamResult[]
  knowledgeMastery: KnowledgeMastery[]
  generatedAt: Date
}

export interface ExamResult {
  examName: string
  averageScore: number
  highestScore: number
  lowestScore: number
  passRate: number
  excellentRate: number
}

export interface KnowledgeMastery {
  knowledgePoint: string
  masteryRate: number
  weakPoints: string[]
}

// 资源库
export interface Resource {
  id: string
  teacherId: string
  title: string
  type: 'lesson_plan' | 'courseware' | 'question' | 'material' | 'video' | 'pdf'
  content: string
  tags: string[]
  grade?: number
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

// 成长档案
export interface GrowthRecord {
  id: string
  teacherId: string
  type: 'training' | 'research' | 'teaching' | 'honor'
  title: string
  description: string
  date: Date
  attachments?: string[]
  createdAt: Date
}

// AI助手对话
export interface AIConversation {
  id: string
  teacherId: string
  title: string
  messages: AIMessage[]
  context?: string
  createdAt: Date
  updatedAt: Date
}

export interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}
