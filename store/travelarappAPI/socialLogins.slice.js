import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { apiService } from "./api"
export const modules_social_auth_facebook_connect_create = createAsyncThunk(
  "socialLogins/modules_social_auth_facebook_connect_create",
  async payload => {
    const response = await apiService.modules_social_auth_facebook_connect_create(
      payload
    )
    return response.data
  }
)
export const modules_social_auth_facebook_login_create = createAsyncThunk(
  "socialLogins/modules_social_auth_facebook_login_create",
  async payload => {
    const response = await apiService.modules_social_auth_facebook_login_create(
      payload
    )
    return response.data
  }
)
export const modules_social_auth_google_connect_create = createAsyncThunk(
  "socialLogins/modules_social_auth_google_connect_create",
  async payload => {
    const response = await apiService.modules_social_auth_google_connect_create(
      payload
    )
    return response.data
  }
)
export const modules_social_auth_google_login_create = createAsyncThunk(
  "socialLogins/modules_social_auth_google_login_create",
  async payload => {
    const response = await apiService.modules_social_auth_google_login_create(
      payload
    )
    return response.data
  }
)
const initialState = { entities: [], api: { loading: "idle", error: null } }
const socialLoginsSlice = createSlice({
  name: "socialLogins",
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(
        modules_social_auth_facebook_connect_create.pending,
        (state, action) => {
          if (state.api.loading === "idle") {
            state.api.loading = "pending"
          }
        }
      )
      .addCase(
        modules_social_auth_facebook_connect_create.fulfilled,
        (state, action) => {
          if (state.api.loading === "pending") {
            state.entities.push(action.payload)
            state.api.loading = "idle"
          }
        }
      )
      .addCase(
        modules_social_auth_facebook_connect_create.rejected,
        (state, action) => {
          if (state.api.loading === "pending") {
            state.api.error = action.error
            state.api.loading = "idle"
          }
        }
      )
      .addCase(
        modules_social_auth_facebook_login_create.pending,
        (state, action) => {
          if (state.api.loading === "idle") {
            state.api.loading = "pending"
          }
        }
      )
      .addCase(
        modules_social_auth_facebook_login_create.fulfilled,
        (state, action) => {
          if (state.api.loading === "pending") {
            state.entities.push(action.payload)
            state.api.loading = "idle"
          }
        }
      )
      .addCase(
        modules_social_auth_facebook_login_create.rejected,
        (state, action) => {
          if (state.api.loading === "pending") {
            state.api.error = action.error
            state.api.loading = "idle"
          }
        }
      )
      .addCase(
        modules_social_auth_google_connect_create.pending,
        (state, action) => {
          if (state.api.loading === "idle") {
            state.api.loading = "pending"
          }
        }
      )
      .addCase(
        modules_social_auth_google_connect_create.fulfilled,
        (state, action) => {
          if (state.api.loading === "pending") {
            state.entities.push(action.payload)
            state.api.loading = "idle"
          }
        }
      )
      .addCase(
        modules_social_auth_google_connect_create.rejected,
        (state, action) => {
          if (state.api.loading === "pending") {
            state.api.error = action.error
            state.api.loading = "idle"
          }
        }
      )
      .addCase(
        modules_social_auth_google_login_create.pending,
        (state, action) => {
          if (state.api.loading === "idle") {
            state.api.loading = "pending"
          }
        }
      )
      .addCase(
        modules_social_auth_google_login_create.fulfilled,
        (state, action) => {
          if (state.api.loading === "pending") {
            state.entities.push(action.payload)
            state.api.loading = "idle"
          }
        }
      )
      .addCase(
        modules_social_auth_google_login_create.rejected,
        (state, action) => {
          if (state.api.loading === "pending") {
            state.api.error = action.error
            state.api.loading = "idle"
          }
        }
      )
  }
})
export default {
  modules_social_auth_facebook_connect_create,
  modules_social_auth_facebook_login_create,
  modules_social_auth_google_connect_create,
  modules_social_auth_google_login_create,
  slice: socialLoginsSlice
}
