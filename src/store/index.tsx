import { configureStore } from '@reduxjs/toolkit'
import { toolBarReducer } from './toolbarstore'

const store = configureStore({
  reducer: {
    toolbar: toolBarReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
