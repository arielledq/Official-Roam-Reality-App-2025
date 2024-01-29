import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  data: {}
}

export const sliceAR = createSlice({
  name: 'ar',
  initialState,
  reducers: {
    resetState: () => initialState,
    updateARUserData: (state, action) => {
      state.data = action.payload
    }
  }
})

export const { resetState, updateUserData } = sliceAR.actions
