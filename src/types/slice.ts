import type { Descendant } from 'slate'
import type { CustomElement } from './slate'

export interface RootState {
  setting: SettingState
  note: NoteSate
}

export interface SettingState {
  isPreviewMode: boolean
}

export interface NoteSate {
  content: CustomElement[]
}
