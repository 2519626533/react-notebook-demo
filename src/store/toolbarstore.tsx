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
    setPosition(state, action) {
      state.position = action.payload
    },
  },
})

export const toolBarReducer = toolBarStore.reducer
const { setPosition } = toolBarStore.actions

export { setPosition }
