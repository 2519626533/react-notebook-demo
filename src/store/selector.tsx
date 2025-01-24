import type { RootState } from '@/types/slice'

export const getSettings = (state: RootState) => state.setting
export const getNotes = (state: RootState) => state.note
