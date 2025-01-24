import { configureStore } from '@reduxjs/toolkit'
import { noteReducer } from './note'
import { settingReducer } from './setting'
import { toolBarReducer } from './toolbarstore'

const store = configureStore({
  reducer: {
    toolbar: toolBarReducer,
    setting: settingReducer,
    note: noteReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
