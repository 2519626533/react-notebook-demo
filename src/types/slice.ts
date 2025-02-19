import type { sync } from '@/store/sync'
import type { Folder } from '@/utils/enums'
import type { Descendant } from 'slate'

export interface RootState {
  setting: SettingState
  note: NoteState
  sync: SyncState
}

export interface noteItem {
  id: string
  title: string
  content: Descendant[]
  createdAt: string
  updatedAt: string
  /*
  * Folder
  */
  scratchpad?: boolean
  favorite?: boolean
  trash?: boolean
  category?: string
}

export const emptyNote: noteItem = {
  id: '',
  title: '',
  content: [],
  createdAt: '',
  updatedAt: '',
}

/*
* InitialState
 */
export interface SettingState {
  isPreviewMode: boolean
  darkTheme: boolean
  loading: boolean
}

export interface NoteState {
  notes: noteItem[]
  activeNoteId: string
  activeFolder: Folder
  searchValue: string
  loading: boolean
  error: string
}

export interface SyncState {
  pendingSync: boolean
  syncing: boolean
  lastSynced: string
  error: string
}

// api
export type PromiseCallback = (value?: any) => void
export type GetLocalStorage = (
  key: string,
  errorMessage?: string
) => (resolve: PromiseCallback, reject: PromiseCallback) => void

export interface SyncPayload {
  notes: noteItem[]
}

export interface SyncAction {
  type: typeof sync.type
  payload: SyncPayload
}
