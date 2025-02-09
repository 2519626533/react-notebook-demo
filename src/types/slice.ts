import type { Descendant } from 'slate'

export interface RootState {
  setting: SettingState
  note: NoteState
}

export interface SettingState {
  isPreviewMode: boolean
  darkTheme: boolean
}

export interface noteItem {
  id: string
  title: string
  content: Descendant[]
  createdAt: string
  updatedAt: string
  isFavorite?: boolean
}

export const emptyNote: noteItem = {
  id: '',
  title: '',
  content: [],
  createdAt: '',
  updatedAt: '',
}

export interface NoteState {
  notes: noteItem[]
  activeNoteId: string
  scratchpadContent: Descendant[]
}
