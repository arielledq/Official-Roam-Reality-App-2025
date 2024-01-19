import { combineReducers } from '@reduxjs/toolkit'

import { sliceLogin } from '../redux/Login/reducer'
import { slicePersist } from '../redux/Persist/reducer'

const rootReducer = combineReducers({
  login: sliceLogin.reducer,
  persist: slicePersist.reducer
})

export default rootReducer
