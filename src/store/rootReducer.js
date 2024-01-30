import { combineReducers } from '@reduxjs/toolkit'

import { sliceLogin } from '../redux/Login/reducer'
import { slicePersist } from '../redux/Persist/reducer'
import { sliceAR } from '../redux/AR/reducer'
import { sliceSplash } from '../redux/Splash/reducer'

const rootReducer = combineReducers({
  login: sliceLogin.reducer,
  persist: slicePersist.reducer,
  ar: sliceAR.reducer,
  splash: sliceSplash.reducer
})

export default rootReducer
