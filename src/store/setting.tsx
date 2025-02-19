import type { SettingState } from '@/types/slice'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export const settingInitialState: SettingState = {
  isPreviewMode: false,
  darkTheme: false,
  loading: true,
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
    loadSetting(state) {
      state.loading = true
    },
    loadSettingsError(state) {
      state.loading = false
    },
    loadSettingSuccess(state, { payload }: PayloadAction<SettingState>) {
      return { ...payload, loading: false }
    },
  },
})

export const settingReducer = settingStore.reducer
export const {
  togglePreviewMode,
  toggleThemeMode,
  loadSetting,
  loadSettingSuccess,
  loadSettingsError,
} = settingStore.actions
