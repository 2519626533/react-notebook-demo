import type { NoteState } from '@/types/slice'
import { createSlice } from '@reduxjs/toolkit'

const slateInitial = [{
  type: 'paragraph',
  children: [{
    text: '',
  }],
}]

export const noteInitialState: NoteState = {
  content: JSON.parse(localStorage.getItem('content') as string) || slateInitial,
}

const noteStore = createSlice({
  name: 'note',
  initialState: noteInitialState,
  reducers: {
    setContent(state, action) {
      state.content = action.payload
      localStorage.setItem('content', JSON.stringify(action.payload))
    },
  },
})

export const noteReducer = noteStore.reducer
export const { setContent } = noteStore.actions
