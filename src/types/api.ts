// Note Api interface
export interface APINoteItem {
  id: string
  title: string
  content: string
  created_at: string
  updated_at: string
  scratchpad?: boolean
  favorite?: boolean
  trash?: boolean
  category: string | null
}
// 语言检测接口类型
export interface LanguageDetectAPI {
  code: string
}

// Setting API Interface
export interface APISettings {
  darkTheme: boolean
  isPreviewMode: boolean
}
