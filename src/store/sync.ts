import type { SyncPayload, SyncState } from '@/types/slice'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import dayjs from 'dayjs'

const syncInitialState: SyncState = {
  pendingSync: false,
  syncing: false,
  error: '',
  lastSynced: dayjs().format(),
  ServiceStatus: 'offline',
}

const syncStore = createSlice({
  name: 'sync',
  initialState: syncInitialState,
  reducers: {
    sync(state, { payload }: PayloadAction<SyncPayload>) {
      state.syncing = true
    },
    setPendingSync(state) {
      state.pendingSync = true
    },
    syncSuccess(state, { payload }: PayloadAction<string>) {
      state.syncing = false
      state.lastSynced = payload
    },
    syncError(state, { payload }: PayloadAction<string>) {
      state.error = payload
      state.syncing = false
    },
    updateServiceStatus(state, { payload }: PayloadAction<'online' | 'offline'>) {
      state.ServiceStatus = payload
    },
  },
})

export const syncReducer = syncStore.reducer
export const {
  sync,
  setPendingSync,
  syncSuccess,
  syncError,
  updateServiceStatus,
} = syncStore.actions
