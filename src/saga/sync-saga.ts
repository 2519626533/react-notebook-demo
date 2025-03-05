import type { noteItem, SyncSagaAction } from '@/types/slice'
import type { SagaIterator } from 'redux-saga'
import { requestNotes } from '@/apis/local'
import { createNoteApi, deleteNoteApi, getAllNotesApi, updateNoteApi } from '@/apis/notes'
import { syncError, syncSuccess } from '@/store/sync'
import dayjs from 'dayjs'
import { diff } from 'deep-object-diff'
import { all, call, put } from 'redux-saga/effects'

const SYNC_CONFIG = {
  maxRetries: 3,
  conflictStrategy: 'client' as 'client' | 'server',
  // 冲突同步策略，’client‘则以本地数据为准，’server‘则以服务端数据为准
}
// 处理服务器与离线数据同步
export function* handleSync(): SagaIterator {
  try {
    // 获取本地和服务器数据
    const [localNotes, serverNotes]: [noteItem[], noteItem[]]
      = yield all([
        call(requestNotes),
        call(getAllNotesApi),
      ])
    // console.log('同步前的数据:', localNotes, serverNotes)
    // 生成待同步操作队列
    const syncQueue = yield call(generateSyncActions, localNotes, serverNotes)
    // console.log('同步操作队列:', syncQueue)
    // 执行同步
    const result: boolean[] = yield all(syncQueue.map(
      (action: SyncSagaAction) => call(processSyncAction, action),
    ))
    // console.log('同步结果:', result)
    if (result.every(Boolean)) {
      yield put(syncSuccess(dayjs().format()))
    } else {
      yield put(syncError('部分同步失败'))
    }
  } catch (error) {
    yield put(syncError((error as Error).message))
  }
}
// 生成同步操作队列
function* generateSyncActions(local: noteItem[], server: noteItem[]) {
  const localMap = new Map(local.map(n => [n.id, n]))
  const serverMap = new Map(server.map(n => [n.id, n]))
  const actions = []

  // 检查新增/修改
  for (const [id, localNote] of localMap) {
    const serverNote = serverMap.get(id)

    if (!serverNote) {
      actions.push({ type: 'CREATE', payload: localNote })
    } else {
      const changes = diff(serverNote, localNote)
      // console.log('diff:', changes)
      if (Object.keys(changes).length > 0) {
        actions.push({
          type: 'UPDATE',
          payload: mergeNotes(serverNote, localNote, SYNC_CONFIG.conflictStrategy),
        })
      }
    }
  }

  // 检测删除
  for (const [id, serverNote] of serverMap) {
    if (!localMap.has(id)) {
      actions.push({ type: 'DELETE', payload: serverNote })
    }
  }
  return actions
}

// 合并笔记数据
function mergeNotes(server: noteItem, local: noteItem, strategy: string) {
  const serverDate = new Date(server.updatedAt)
  const localDate = new Date(local.updatedAt)
  // console.log('merge:', strategy, localDate, serverDate)
  // 根据策略解决冲突
  if (strategy === 'client' || localDate >= serverDate) {
    return { ...server, ...local, updateAt: new Date().toISOString() }
  }
  return server
}

// 处理单个同步动作
function* processSyncAction(action: SyncSagaAction, retry: number = 0): SagaIterator {
  try {
    switch (action.type) {
      case 'CREATE':
        yield call(createNoteApi, action.payload)
        return true
      case 'UPDATE':
        yield call(updateNoteApi, action.payload.id, action.payload)
        return true
      case 'DELETE':
        yield call(deleteNoteApi, action.payload.id)
        return true
      default:
        return false
    }
  } catch {
    if (retry < SYNC_CONFIG.maxRetries) {
      yield call(processSyncAction, action, retry + 1)
    }
    return false
  }
}
