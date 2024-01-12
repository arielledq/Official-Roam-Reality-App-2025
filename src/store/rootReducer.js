import { combineReducers } from '@reduxjs/toolkit'

import { sliceLogin } from '../redux/Login/reducer'

const rootReducer = combineReducers({
  login: sliceLogin.reducer
})

export default rootReducer
