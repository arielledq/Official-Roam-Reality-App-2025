import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  arProfile: {},
  arSettings: {},
  selectedDestination: {}
}

export const sliceAR = createSlice({
  name: 'ar',
  initialState,
  reducers: {
    resetState: () => initialState,
    updateARUserData: (state, action) => {
      console.log(state, action)
      state.arProfile = action.payload
    },
    updateARSettings: (state, action) => {
      console.log(state, action)
      state.arSettings = action.payload
    },
    updateSelectedDestination: (state, action) => {
      console.log(state, action)
      state.selectedDestination = action.payload
    }
  }
})

export const { resetState, updateARUserData, updateARSettings, updateSelectedDestination } = sliceAR.actions
