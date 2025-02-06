import type { SettingState } from '@/types/slice'
import { createSlice } from '@reduxjs/toolkit'

export const settingInitialState: SettingState = {
  isPreviewMode: false,
  darkTheme: false,
}

const settingStore = createSlice({
  name: 'setting',
  initialState: settingInitialState,
  reducers: {
    togglePreviewMode(state) {
      state.isPreviewMode = !state.isPreviewMode
    },
    toggleThemeMode(state) {
      state.darkTheme = !state.darkTheme
    },
  },
})

export const settingReducer = settingStore.reducer
export const { togglePreviewMode, toggleThemeMode } = settingStore.actions
