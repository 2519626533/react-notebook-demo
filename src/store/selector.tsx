import type { RootState } from '@/types/slice'
import store from '.'

export const getSettings = (state: RootState) => state.setting
export const getNotes = (state: RootState) => state.note

export const getLatestCodeBlockNum = () => {
  return store.getState().note.codeBlockNum
}
