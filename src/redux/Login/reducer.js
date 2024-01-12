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
    }
  }
})

export const { resetState, updateUserData } = sliceLogin.actions
