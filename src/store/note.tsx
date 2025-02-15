import type { noteItem, NoteState } from '@/types/slice'
import { saveNotesLocal, saveScratchpadLocal } from '@/apis/localStorage'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import dayjs from 'dayjs'
import { v4 as uuid } from 'uuid'

const slateInitial = [{
  type: 'paragraph',
  children: [{
    text: '',
  }],
}]

export const noteInitialState: NoteState = {
  notes: JSON.parse(localStorage.getItem('notes') as string) || [],
  activeNoteId: '',
  scratchpadContent: JSON.parse(localStorage.getItem('scratchpad-content') as string) || slateInitial,
}

const noteStore = createSlice({
  name: 'note',
  initialState: noteInitialState,
  reducers: {
    // 新增笔记
    addNote(state) {
      const newNote: noteItem = {
        id: uuid(),
        title: 'Untitled',
        content: [
          {
            type: 'paragraph',
            children: [{ text: '' }],
            lineNumber: 1,
          },
        ],
        createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      }
      state.notes.push(newNote)
      saveNotesLocal(state.notes)
    },
    // 设置当前所选笔记
    setActiveNote(state, action) {
      state.activeNoteId = action.payload
    },
    // 更新笔记内容和更新时间
    updateNote(state, { payload }: PayloadAction<noteItem>) {
      state.notes = state.notes.map(note =>
        note.id === payload.id
          ? {
              ...note,
              content: payload.content,
              updatedAt: payload.updatedAt,
            }
          : note,
      )
      saveNotesLocal(state.notes)
    },
    // 更新笔记标题
    updateNoteTitle(state, { payload }: PayloadAction<noteItem>) {
      state.notes = state.notes.map(note =>
        note.id === payload.id
          ? {
              ...note,
              title: payload.title,
            }
          : note,
      )
      saveNotesLocal(state.notes)
    },
    // 设置scratchpad内容的更新
    setContent(state, action) {
      state.scratchpadContent = action.payload
      saveScratchpadLocal(state.scratchpadContent)
    },
    // 删除笔记
    deleteNote(state, { payload }: PayloadAction<string>) {
      state.notes = state.notes.filter(note => !payload.includes(note.id))
      saveNotesLocal(state.notes)
      state.activeNoteId = ''
    },
  },
})

export const noteReducer = noteStore.reducer
export const {
  setContent,
  addNote,
  setActiveNote,
  updateNote,
  updateNoteTitle,
  deleteNote,
} = noteStore.actions
