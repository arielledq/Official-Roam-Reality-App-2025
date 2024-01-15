import { store } from '../store/index'

export const BASE_URL = 'https://travel-ar-app-42706-staging.botics.co/'

export const commonApiRoute = 'api/v1/'

export const MULTIPART_HEADER = async () => {
  const token = await store.getState().login.data.token
  const header = {
    Accept: 'application/json',
    'Content-Type': 'multipart/form-data'
  }
  if (token) {
    header.Authorization = `Token ${token}`
  }
  return header
}

export const APP_JSON_HEADER = {
  Accept: 'application/json',
  'Content-Type': 'application/json'
}

export const TOKEN_HEADER = async () => {
  const token = await store.getState().login.data.token
  console.log({ token })
  const header = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Token ${token}`
  }
  return header
}
