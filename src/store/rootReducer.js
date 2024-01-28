import { combineReducers } from '@reduxjs/toolkit'

import { sliceLogin } from '../redux/Login/reducer'
import { slicePersist } from '../redux/Persist/reducer'
import { sliceAR } from '../redux/AR/reducer'

const rootReducer = combineReducers({
  login: sliceLogin.reducer,
  persist: slicePersist.reducer,
  ar: sliceAR.reducer
})

export default rootReducer
