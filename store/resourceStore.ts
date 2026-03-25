import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Resource, GrowthRecord } from '@/types'

interface ResourceState {
  // 个人资源库
  resources: Resource[]
  
  // 成长档案 - 按用户ID存储
  growthRecords: Record<string, GrowthRecord[]>
  
  // 是否已经初始化示例数据 - 按用户ID存储
  isSampleDataInitialized: Record<string, boolean>
  
  // 操作方法
  addResource: (resource: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateResource: (id: string, updates: Partial<Resource>) => void
  deleteResource: (id: string) => void
  
  // 成长档案 - 需要传入当前用户ID
  addGrowthRecord: (teacherId: string, record: Omit<GrowthRecord, 'id' | 'createdAt' | 'teacherId'>) => void
  updateGrowthRecord: (teacherId: string, id: string, updates: Partial<GrowthRecord>) => void
  deleteGrowthRecord: (teacherId: string, id: string) => void
  getGrowthRecordsByTeacher: (teacherId: string) => GrowthRecord[]
  
  // 示例数据初始化标志
  isSampleDataInitializedForTeacher: (teacherId: string) => boolean
  setSampleDataInitializedForTeacher: (teacherId: string, value: boolean) => void
  
  // 清空成长记录 - 只清空指定用户的
  clearGrowthRecords: (teacherId: string) => void
  
  // 查询
  getResourcesByType: (type: Resource['type']) => Resource[]
  getResourcesByGrade: (grade: number) => Resource[]
  searchResources: (keyword: string) => Resource[]
  getGrowthRecordsByType: (teacherId: string, type: GrowthRecord['type']) => GrowthRecord[]
}

export const useResourceStore = create<ResourceState>()(
  persist(
    (set, get) => ({
      resources: [],
      growthRecords: {},
      isSampleDataInitialized: {},

      addResource: (resource) => {
        const newResource: Resource = {
          ...resource,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        set((state) => ({
          resources: [...state.resources, newResource],
        }))
      },

      updateResource: (id, updates) => {
        set((state) => ({
          resources: state.resources.map((r) =>
            r.id === id ? { ...r, ...updates, updatedAt: new Date() } : r
          ),
        }))
      },

      deleteResource: (id) => {
        set((state) => ({
          resources: state.resources.filter((r) => r.id !== id),
        }))
      },

      addGrowthRecord: (teacherId, record) => {
        const newRecord: GrowthRecord = {
          ...record,
          id: Date.now().toString(),
          teacherId,
          createdAt: new Date(),
        }
        set((state) => ({
          growthRecords: {
            ...state.growthRecords,
            [teacherId]: [...(state.growthRecords[teacherId] || []), newRecord],
          },
        }))
      },

      updateGrowthRecord: (teacherId, id, updates) => {
        set((state) => ({
          growthRecords: {
            ...state.growthRecords,
            [teacherId]: (state.growthRecords[teacherId] || []).map((r) =>
              r.id === id ? { ...r, ...updates } : r
            ),
          },
        }))
      },

      deleteGrowthRecord: (teacherId, id) => {
        console.log('Store: Deleting record', id, 'for teacher', teacherId)
        console.log('Before delete:', get().growthRecords[teacherId])
        set((state) => ({
          growthRecords: {
            ...state.growthRecords,
            [teacherId]: (state.growthRecords[teacherId] || []).filter((r) => r.id !== id),
          },
        }))
        console.log('After delete:', get().growthRecords[teacherId])
      },

      getGrowthRecordsByTeacher: (teacherId) => {
        return get().growthRecords[teacherId] || []
      },

      isSampleDataInitializedForTeacher: (teacherId) => {
        return get().isSampleDataInitialized[teacherId] || false
      },

      setSampleDataInitializedForTeacher: (teacherId, value) => {
        set((state) => ({
          isSampleDataInitialized: {
            ...state.isSampleDataInitialized,
            [teacherId]: value,
          },
        }))
      },

      clearGrowthRecords: (teacherId) => {
        set((state) => ({
          growthRecords: {
            ...state.growthRecords,
            [teacherId]: [],
          },
        }))
      },

      getResourcesByType: (type) => {
        return get().resources.filter((r) => r.type === type)
      },

      getResourcesByGrade: (grade) => {
        return get().resources.filter((r) => r.grade === grade)
      },

      searchResources: (keyword) => {
        return get().resources.filter((r) =>
          r.title.toLowerCase().includes(keyword.toLowerCase()) ||
          r.tags.some((tag) => tag.toLowerCase().includes(keyword.toLowerCase()))
        )
      },

      getGrowthRecordsByType: (teacherId, type) => {
        return (get().growthRecords[teacherId] || []).filter((r) => r.type === type)
      },
    }),
    {
      name: 'resource-storage',
    }
  )
)
