import type { SettingState, SyncAction } from '@/types/slice'
import type { SagaIterator } from 'redux-saga'
import { requestNotes, requestSettings, saveSettings, saveState } from '@/apis'
import { loadNote, loadNotesError, loadNotesSuccess } from '@/store/note'
import { getSettings } from '@/store/selector'
import { loadSetting, loadSettingsError, loadSettingSuccess, togglePreviewMode, toggleThemeMode } from '@/store/setting'
import { sync, syncError, syncSuccess } from '@/store/sync'
import dayjs from 'dayjs'
import { all, call, put, select, takeLatest } from 'redux-saga/effects'

// 初始化获取notes
function* fetchNotes(): SagaIterator {
  try {
    const notes = yield call(requestNotes)
    yield put(loadNotesSuccess({ notes }))
  } catch (error) {
    yield put(loadNotesError((error as Error).message))
  }
}

// 初始化获取settings
function* fetchSettings(): SagaIterator {
  try {
    const settingsData = yield call(requestSettings)
    yield put(loadSettingSuccess(settingsData))
  } catch {
    yield put(loadSettingsError())
  }
}

// 保存notes
function* syncData({ payload }: SyncAction) {
  try {
    yield saveState(payload)

    yield put(syncSuccess(dayjs().format()))
  } catch (error) {
    yield put(syncError((error as Error).message))
  }
}

// 保存settings
function* syncSettings(): Generator<any, void, unknown> {
  try {
    const settings = yield select(getSettings)
    yield saveSettings(settings as SettingState)
  } catch {}
}

function* rootSaga() {
  yield all([
    takeLatest(loadNote.type, fetchNotes),
    takeLatest(loadSetting.type, fetchSettings),
    takeLatest(sync.type, syncData),
    takeLatest([
      togglePreviewMode.type,
      toggleThemeMode.type,
    ], syncSettings),
  ])
}

export default rootSaga
