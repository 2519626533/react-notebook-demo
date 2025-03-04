// 语言检测服务
import request from './request'

export interface LanguageDetection {
  language: string
  confidence: number
  // 添加更多hljs返回的字段
  relevance: number
  value: string
}

export const detectCodeLanguageApi = async (code: string): Promise<LanguageDetection> => {
  try {
    const response = await request.post<LanguageDetection>('/detect-language', { code })
    return response.data
  } catch (error) {
    console.error('语言检测失败:', error)
    throw new Error('Failed to detect language')
  }
}
