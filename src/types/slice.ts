import type { CustomElement } from './slate'

export interface RootState {
  setting: SettingState
  note: NoteState
}

export interface SettingState {
  isPreviewMode: boolean
  darkTheme: boolean
}

export interface NoteState {
  content: CustomElement[]
}
