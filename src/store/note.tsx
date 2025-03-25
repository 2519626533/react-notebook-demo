import type { noteItem, NoteState } from '@/types/slice'
import { Folder } from '@/utils/enums'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export const getFirstNoteId = (
  folder: Folder,
  notes: noteItem[],
) => {
  const availableNotes = notes

  const firstNote: noteItem | undefined = {
    [Folder.NOTES]: () => availableNotes.find(note => !note.scratchpad),
    [Folder.SCRATCHPAD]: () => availableNotes.find(note => note.scratchpad),
    [Folder.FAVORITES]: () => availableNotes.find(note => note.favorite),
    [Folder.TRASH]: () => availableNotes.find(note => note.trash),
  }[folder]()

  return firstNote ? firstNote.id : ''
}

export const noteInitialState: NoteState = {
  notes: [],
  activeNoteId: '',
  activeFolder: Folder.NOTES,
  searchValue: '',
  loading: true,
  error: '',
}

const noteStore = createSlice({
  name: 'note',
  initialState: noteInitialState,
  reducers: {
    // 新增笔记
    addNote(state, { payload }: PayloadAction<noteItem>) {
      state.notes.push(payload)
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
    },
    // 添加笔记到favorites
    toggleNoteToFavorite(state, { payload }: PayloadAction<string>) {
      state.notes = state.notes.map(note =>
        note.id === payload ? { ...note, favorite: !note.favorite } : note,
      )
    },
    // 将笔记移入Trash
    toggleTrashNotes(state, { payload }: PayloadAction<string>) {
      state.notes = state.notes.map(note =>
        (note.id === payload) ? { ...note, trash: !note.trash } : note)
    },
    // Empty the Trash
    pruneEmptyNotes(state) {
      state.notes = state.notes.filter(
        note => !note.trash,
      )
      state.activeNoteId = getFirstNoteId(
        Folder.TRASH,
        state.notes,
      )
    },
    // 更新搜索词
    updateSearchValue(state, { payload }: PayloadAction<string>) {
      state.searchValue = payload
    },
    // 切换文件夹
    swapFolder(state, { payload }: PayloadAction<{ folder: Folder, activeNoteId?: string }>) {
      state.activeFolder = payload.folder
      state.activeNoteId = payload.activeNoteId
        ? payload.activeNoteId
        : getFirstNoteId(
            payload.folder,
            state.notes,
          )
    },
    // 从 localStorage中获取notes
    loadNote(state) {
      state.loading = true
    },
    loadNotesSuccess(state, { payload }: PayloadAction<{ notes: noteItem[] }>) {
      state.notes = payload.notes
      state.loading = false
      state.activeNoteId = getFirstNoteId(
        state.activeFolder,
        payload.notes,
      )
    },
    loadNotesError(state, { payload }: PayloadAction<string>) {
      state.loading = false
      state.error = payload
    },
  },
})

export const noteReducer = noteStore.reducer
export const {
  addNote,
  setActiveNote,
  updateNote,
  updateNoteTitle,
  toggleNoteToFavorite,
  toggleTrashNotes,
  updateSearchValue,
  swapFolder,
  loadNote,
  loadNotesSuccess,
  loadNotesError,
  pruneEmptyNotes,
} = noteStore.actions
