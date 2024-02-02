import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  newUser: true,
  isOnboarded: false,
}

export const slicePersist = createSlice({
  name: 'persist',
  initialState,
  reducers: {
    resetPersist: () => initialState,
    updateAsOldUser: (state, action) => {
      state.newUser = false
    },
    toggleOnboard : (state, action) => {
      state.isOnboarded = !state.isOnboarded
    },
  }
})

export const { resetPersist, updateAsOldUser, toggleOnboard } = slicePersist.actions
