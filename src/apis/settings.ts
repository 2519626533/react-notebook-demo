// 设置相关API服务
import type { SettingState } from '@/types/slice'
import request from './request'

// 获取单个设置项
export const getSettingApi = async <T>(key: keyof SettingState): Promise<T> => {
  try {
    const response = await request.get<{ value: string }>(`/settings/${key}`)
    return JSON.parse(response.data.value) as T
  } catch (error) {
    console.error(`获取设置项 ${key} 失败:`, error)
    throw new Error('Failed to fetch setting')
  }
}

// 获取全部设置
export const getAllSettingsApi = async (): Promise<SettingState> => {
  try {
    const [darkTheme, isPreviewMode] = await Promise.all([
      getSettingApi<boolean>('darkTheme'),
      getSettingApi<boolean>('isPreviewMode'),
    ])

    return {
      darkTheme: darkTheme ?? false,
      isPreviewMode: isPreviewMode ?? false,
      loading: false,
    }
  } catch (error) {
    console.error('获取全部设置失败:', error)
    throw new Error('Failed to fetch settings')
  }
}

// 更新设置项
export const updateSettingApi = async <T>(key: keyof SettingState, value: T): Promise<void> => {
  try {
    await request.post('/settings', {
      key,
      value: JSON.stringify(value),
    })
  } catch (error) {
    console.error(`更新设置项 ${key} 失败:`, error)
    throw new Error('Failed to update setting')
  }
}
