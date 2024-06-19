import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  arProfile: {},
  arSettings: {},
  selectedDestination: {},
  anywhereChallenges: {},
  selectedGeoSite: {},
  selectedGeoARSiteStars: []
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
    },
    updateSelectedDestination: (state, action) => {
      state.selectedDestination = action.payload
    },
    updateAnyWhereChallenges: (state, action) => {
      state.anywhereChallenges = action.payload
    },
    updateSelectedSites: (state, action) => {
      state.selectedGeoSite = action.payload
    },
    updateSelectedGeoARSiteStars: (state, action) => {
      state.selectedGeoARSiteStars = action.payload
    }
  }
})

export const { resetState, updateARUserData,
  updateARSettings, updateSelectedDestination,
  updateAnyWhereChallenges, updateSelectedSites,
  updateSelectedGeoARSiteStars
} = sliceAR.actions
