import type { GetLocalStorage, noteItem, PromiseCallback, SettingState, SyncPayload } from '@/types/slice'
import dayjs from 'dayjs'
import { v4 as uuid } from 'uuid'

export const scratchpadNote: noteItem = {
  id: uuid(),
  title: 'scratchpad',
  content: [{
    type: 'paragraph',
    children: [{
      text: `# Scratchpad The easiest note to find.`,
    }],
    lineNumber: 1,
  }],
  category: '',
  scratchpad: true,
  favorite: false,
  createdAt: dayjs().format(),
  updatedAt: dayjs().format(),
}

export const welcomeNote: noteItem = {
  id: uuid(),
  title: 'Welcome to TakeNote!',
  content: [{
    type: 'paragraph',
    children: [{
      text: 'Welcome to TakeNote!',
    }],
    lineNumber: 1,
  }],
  category: '',
  favorite: false,
  createdAt: dayjs().format(),
  updatedAt: dayjs().format(),
}

const getLocalStorage: GetLocalStorage = (key, errorMessage = 'Something went wrong') => (
  resolve,
  reject,
) => {
  const data = localStorage.getItem(key)

  if (data) {
    resolve(JSON.parse(data))
  } else {
    reject({
      message: errorMessage,
    })
  }
}

const getUserNotes = () => (resolve: PromiseCallback, reject: PromiseCallback) => {
  const notes = localStorage.getItem('notes')

  if (!notes) {
    resolve([scratchpadNote, welcomeNote])
  } else if (Array.isArray(JSON.parse(notes))) {
    resolve(
      (JSON.parse(notes).length === 0
        || !JSON.parse(notes).find((note: noteItem) => note.scratchpad))
        ? [scratchpadNote, ...JSON.parse(notes)]
        : JSON.parse(notes),
    )
  } else {
    reject({
      message: 'Something went wrong',
    })
  }
}

export const saveState = ({ notes }: SyncPayload) =>
  new Promise((resolve) => {
    localStorage.setItem('notes', JSON.stringify(notes))
    resolve({
      notes: JSON.parse(localStorage.getItem('notes') || '[]'),
    })
  })

export const saveSettings = (settings: SettingState) =>
  Promise.resolve(localStorage.setItem('settings', JSON.stringify(settings)))

export const requestNotes = () => new Promise(getUserNotes())
export const requestSettings = () => new Promise(getLocalStorage('settings'))
