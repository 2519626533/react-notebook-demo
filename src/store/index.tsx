import rootSaga from '@/saga'
import { configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
import { noteReducer } from './note'
import { settingReducer } from './setting'
import { syncReducer } from './sync'
import { toolBarReducer } from './toolbarstore'

const sageMiddleware = createSagaMiddleware()

const store = configureStore({
  reducer: {
    toolbar: toolBarReducer,
    setting: settingReducer,
    note: noteReducer,
    sync: syncReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({ thunk: true }).concat(sageMiddleware),
})

sageMiddleware.run(rootSaga)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
