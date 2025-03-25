import type { RootState } from '@/types/slice'

export const getSettings = (state: RootState) => state.setting
export const getNoteState = (state: RootState) => state.note
export const getNotes = (state: RootState) => state.note.notes
export const getSync = (state: RootState) => state.sync
