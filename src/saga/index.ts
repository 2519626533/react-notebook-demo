import type { noteItem, SettingState, SyncAction } from '@/types/slice'
import type { SagaIterator } from 'redux-saga'
import { requestNotes, requestSettings, saveSettings, saveState } from '@/apis/local'
import { createNoteApi, deleteNoteApi, getAllNotesApi, updateNoteApi } from '@/apis/notes'
import { getAllSettingsApi, updateSettingApi } from '@/apis/settings'
import { addNote, loadNote, loadNotesError, loadNotesSuccess, pruneEmptyNotes, updateNote } from '@/store/note'
import { getNotes, getSettings, getSync } from '@/store/selector'
import { loadSetting, loadSettingsError, loadSettingSuccess, togglePreviewMode, toggleThemeMode } from '@/store/setting'
import { sync, syncError, syncSuccess } from '@/store/sync'
import dayjs from 'dayjs'
import { all, call, put, select, takeLatest } from 'redux-saga/effects'
import { handleSync } from './sync-saga'

/*
* 获取数据/设置流程：
  请求服务器端数据-->请求成功，loadSuccess，保存本地
              |——>请求失败，降级到从本地存储中获取
*/

/*
  同步数据/设置流程：本地保存--→服务器同步
*/

// 初始化获取notes
function* fetchNotes(): SagaIterator {
  try {
    const { ServiceStatus } = yield select(getSync)
    if (ServiceStatus === 'online') {
      yield call(handleSync)
      const serverNotes: noteItem[] = yield call(getAllNotesApi)
      yield put(loadNotesSuccess({ notes: serverNotes }))

      yield call(saveState, { notes: serverNotes })
    } else {
      const localNotes: noteItem[] = yield call(requestNotes)
      yield put(loadNotesSuccess({ notes: localNotes }))
    }
  } catch (Error) {
    yield put(loadNotesError((Error as Error).message))
  }
}

// 初始化获取settings
function* fetchSettings(): SagaIterator {
  try {
    const { ServiceStatus } = yield select(getSync)
    if (ServiceStatus === 'online') {
      const serverSettings = yield call(getAllSettingsApi)
      yield put(loadSettingSuccess(serverSettings))

      yield call(saveSettings, serverSettings)
    } else {
      const localSetting = yield call(requestSettings)
      yield put(loadSettingSuccess(localSetting))
    }
  } catch {
    yield put(loadSettingsError())
  }
}

// 保存notes
function* syncData({ payload }: SyncAction) {
  try {
    const { ServiceStatus } = yield select(getSync)
    yield saveState(payload)

    if (ServiceStatus === 'online') {
      const { notes } = payload
      yield all(notes.map(note =>
        note.id
          ? call(updateNoteApi, note.id, note)
          : call(createNoteApi, note),
      ))
    }

    yield put(syncSuccess(dayjs().format()))
  } catch (error) {
    yield put(syncError((error as Error).message))
  }
}

// 处理note CRUD的服务器同步
function* syncNoteAction(action: { type: string, payload: noteItem }) {
  try {
    const { ServiceStatus } = yield select(getSync)
    if (ServiceStatus !== 'online') {
      return
    }

    switch (action.type) {
      case addNote.type:
        yield call(createNoteApi, action.payload)
        break
      case updateNote.type:
        yield call(updateNoteApi, action.payload.id, action.payload)
        break
      case pruneEmptyNotes.type:
        yield call(deleteNoteApi, action.payload.id)
        break
    }

    yield put(sync({ notes: yield select(getNotes) }))
  } catch (error) {
    console.error('服务器同步失败:', error)
  }
}

// 保存settings
function* syncSettings(action: { type: string }): Generator<any, void> {
  try {
    const settings = yield select(getSettings)
    const { ServiceStatus } = yield select(getSync)

    const [key, value]: [key: keyof SettingState, value: boolean]
      = action.type === toggleThemeMode.type
        ? ['darkTheme', (settings as SettingState).darkTheme]
        : ['isPreviewMode', (settings as SettingState).isPreviewMode]

    yield saveSettings(settings as SettingState)

    if (ServiceStatus === 'online') {
      yield call(() => updateSettingApi(key, value))
    }
  } catch (error) {
    console.error('设置同步失败:', error)
  }
}

function* rootSaga() {
  yield all([
    takeLatest(loadNote.type, fetchNotes),
    takeLatest(loadSetting.type, fetchSettings),
    takeLatest(sync.type, syncData),
    takeLatest([
      addNote.type,
      updateNote.type,
      pruneEmptyNotes.type,
    ], syncNoteAction),
    takeLatest([
      togglePreviewMode.type,
      toggleThemeMode.type,
    ], syncSettings),
  ])
}

export default rootSaga
