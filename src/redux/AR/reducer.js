import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  arProfile: {},
  arSettings: {}
}

export const sliceAR = createSlice({
  name: 'ar',
  initialState,
  reducers: {
    resetState: () => initialState,
    updateARUserData: (state, action) => {
      state.arProfile = action.payload
    },
    updateARSettings: (state, action) => {
      state.arSettings = action.payload
    }
  }
})

export const { resetState, updateARUserData, updateARSettings } = sliceAR.actions
