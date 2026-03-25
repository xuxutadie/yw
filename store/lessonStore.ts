import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Lesson, Annotation, TeachingPlan, Courseware } from '@/types'

interface LessonState {
  // 当前选中的课程
  currentLesson: Lesson | null
  
  // 备课数据
  annotations: Annotation[]
  teachingPlans: TeachingPlan[]
  coursewares: Courseware[]
  
  // 操作方法
  setCurrentLesson: (lesson: Lesson | null) => void
  addAnnotation: (annotation: Omit<Annotation, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateAnnotation: (id: string, updates: Partial<Annotation>) => void
  deleteAnnotation: (id: string) => void
  saveTeachingPlan: (plan: Omit<TeachingPlan, 'id' | 'createdAt' | 'updatedAt'>) => void
  saveCourseware: (courseware: Omit<Courseware, 'id' | 'createdAt' | 'updatedAt'>) => void
  
  // 获取方法
  getAnnotationsByLesson: (lessonId: string) => Annotation[]
  getTeachingPlanByLesson: (lessonId: string) => TeachingPlan | undefined
  getCoursewareByLesson: (lessonId: string) => Courseware | undefined
}

export const useLessonStore = create<LessonState>()(
  persist(
    (set, get) => ({
      currentLesson: null,
      annotations: [],
      teachingPlans: [],
      coursewares: [],

      setCurrentLesson: (lesson) => set({ currentLesson: lesson }),

      addAnnotation: (annotation) => {
        const newAnnotation: Annotation = {
          ...annotation,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        set((state) => ({
          annotations: [...state.annotations, newAnnotation],
        }))
      },

      updateAnnotation: (id, updates) => {
        set((state) => ({
          annotations: state.annotations.map((a) =>
            a.id === id ? { ...a, ...updates, updatedAt: new Date() } : a
          ),
        }))
      },

      deleteAnnotation: (id) => {
        set((state) => ({
          annotations: state.annotations.filter((a) => a.id !== id),
        }))
      },

      saveTeachingPlan: (plan) => {
        const newPlan: TeachingPlan = {
          ...plan,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        set((state) => ({
          teachingPlans: [
            ...state.teachingPlans.filter((p) => p.lessonId !== plan.lessonId),
            newPlan,
          ],
        }))
      },

      saveCourseware: (courseware) => {
        const newCourseware: Courseware = {
          ...courseware,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        set((state) => ({
          coursewares: [
            ...state.coursewares.filter((c) => c.lessonId !== courseware.lessonId),
            newCourseware,
          ],
        }))
      },

      getAnnotationsByLesson: (lessonId) => {
        return get().annotations.filter((a) => a.lessonId === lessonId)
      },

      getTeachingPlanByLesson: (lessonId) => {
        return get().teachingPlans.find((p) => p.lessonId === lessonId)
      },

      getCoursewareByLesson: (lessonId) => {
        return get().coursewares.find((c) => c.lessonId === lessonId)
      },
    }),
    {
      name: 'lesson-storage',
    }
  )
)
