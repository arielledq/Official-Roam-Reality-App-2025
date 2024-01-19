import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  newUser: true
}

export const slicePersist = createSlice({
  name: 'persist',
  initialState,
  reducers: {
    resetPersist: () => initialState,
    updateAsOldUser: (state, action) => {
      state.newUser = false
    }
  }
})

export const { resetPersist, updateAsOldUser } = slicePersist.actions
