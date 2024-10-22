import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  data: {},
}

export const sliceLogin = createSlice({
  name: 'login',
  initialState,
  reducers: {
    resetState: () => initialState,
    updateUserData: (state, action) => {
      state.data = action.payload
    },
    updateUserLocationData: (state, action) => {
      let coordinates = []
      if (!isNaN(action.payload?.longitude) && !isNaN(action.payload?.latitude)) {
        coordinates = [action.payload.longitude, action.payload.latitude]
      }
      state.data.user.user_ar_profile.current_location = {
        ...state.data.user.user_ar_profile.current_location,
        coordinates: coordinates,
      }
    },
    updateName: (state, action) => {
      state.data.user.name = action.payload
    },
    updateAccountFlag: (state, action) => {
      state.data.user.user_profile.account_setup = action.payload
    },
    updateVerified: (state, action) => {
      state.data.user.user_profile.is_verified = action.payload
    },
  },
})

export const {
  resetState,
  updateUserData,
  updateUserLocationData,
  updateName,
  updateAccountFlag,
  updateVerified,
} = sliceLogin.actions
