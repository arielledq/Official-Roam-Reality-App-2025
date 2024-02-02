import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  splashShown: false
}

export const sliceSplash = createSlice({
  name: 'splash',
  initialState,
  reducers: {
    resetSplash: () => initialState,
    update: (state, action) => {
      state.splashShown = true
    }
  }
})

export const { resetSplash, update } = sliceSplash.actions
