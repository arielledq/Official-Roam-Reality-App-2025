import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  data: {}
}

export const sliceLogin = createSlice({
  name: 'login',
  initialState,
  reducers: {
    resetState: () => initialState,
    updateUserData: (state, action) => {
      state.data = action.payload
    },
    updateName: (state, action) => {
      state.data.user.name = action.payload
    },
    updateAccountFlag: (state, action) => {
      state.data.user.user_profile.account_setup = action.payload
    },
    updateVerified: (state, action) => {
      state.data.user.user_profile.is_verified = action.payload
    }
  }
})

export const {
  resetState,
  updateUserData,
  updateName,
  updateAccountFlag,
  updateVerified
} = sliceLogin.actions
