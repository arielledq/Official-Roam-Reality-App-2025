import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  arProfile: {}
}

export const sliceAR = createSlice({
  name: 'ar',
  initialState,
  reducers: {
    resetState: () => initialState,
    updateARUserData: (state, action) => {
      state.arProfile = action.payload
    }
  }
})

export const { resetState, updateARUserData } = sliceAR.actions
