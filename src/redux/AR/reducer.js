import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  arProfile: {},
  arSettings: {},
  selectedDestination: {},
  anywhereChallenges: {},
  selectedGeoSite: {}
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
      state.selectedDestination = action.payload
    },
    updateAnyWhereChallenges: (state, action) => {
      state.anywhereChallenges = action.payload
    },
    updateSelectedSites: (state, action) => {
      state.selectedGeoSite = action.payload
    }
  }
})

export const { resetState, updateARUserData,
  updateARSettings, updateSelectedDestination,
  updateAnyWhereChallenges, updateSelectedSites
} = sliceAR.actions
