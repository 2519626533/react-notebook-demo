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
  try {
    const notesStr: string | null = localStorage.getItem('notes')
    let notesData: noteItem[] = []

    if (!notesStr) {
      notesData = [scratchpadNote, welcomeNote]
    } else {
      const parsedData = JSON.parse(notesStr)
      if (Array.isArray(parsedData)) {
        const hasScratchpad = parsedData.some((note: noteItem) => note.scratchpad)
        notesData = hasScratchpad ? parsedData : [scratchpadNote, ...parsedData]
      } else {
        notesData = [scratchpadNote, welcomeNote]
      }
    }
    resolve(notesData)
  } catch {
    reject({ message: 'Failed to parse notes data' })
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

export const requestNotes = () =>
  new Promise(getUserNotes())

export const requestSettings = () => new Promise(getLocalStorage('settings'))
