import { createSlice } from '@reduxjs/toolkit'

const toolBarStore = createSlice({
  name: 'toolBar',
  initialState: {
    position: {
      x: 200,
      y: 10,
    },
  },
  reducers: {
    getPosition(state) {
      state.position = JSON.parse(localStorage.getItem('position') as string) || state.position
    },
    setPosition(state, action) {
      state.position = action.payload
      localStorage.setItem('position', JSON.stringify(state.position))
    },
  },
})

export const toolBarReducer = toolBarStore.reducer
export const { setPosition, getPosition } = toolBarStore.actions
