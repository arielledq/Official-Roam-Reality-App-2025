import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { apiService } from "./api"
export const modules_social_auth_apple_connect_create = createAsyncThunk(
  "customAppleSocialLogins/modules_social_auth_apple_connect_create",
  async payload => {
    const response = await apiService.modules_social_auth_apple_connect_create(
      payload
    )
    return response.data
  }
)
export const modules_social_auth_apple_login_create = createAsyncThunk(
  "customAppleSocialLogins/modules_social_auth_apple_login_create",
  async payload => {
    const response = await apiService.modules_social_auth_apple_login_create(
      payload
    )
    return response.data
  }
)
const initialState = { entities: [], api: { loading: "idle", error: null } }
const customAppleSocialLoginsSlice = createSlice({
  name: "customAppleSocialLogins",
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(
        modules_social_auth_apple_connect_create.pending,
        (state, action) => {
          if (state.api.loading === "idle") {
            state.api.loading = "pending"
          }
        }
      )
      .addCase(
        modules_social_auth_apple_connect_create.fulfilled,
        (state, action) => {
          if (state.api.loading === "pending") {
            state.entities.push(action.payload)
            state.api.loading = "idle"
          }
        }
      )
      .addCase(
        modules_social_auth_apple_connect_create.rejected,
        (state, action) => {
          if (state.api.loading === "pending") {
            state.api.error = action.error
            state.api.loading = "idle"
          }
        }
      )
      .addCase(
        modules_social_auth_apple_login_create.pending,
        (state, action) => {
          if (state.api.loading === "idle") {
            state.api.loading = "pending"
          }
        }
      )
      .addCase(
        modules_social_auth_apple_login_create.fulfilled,
        (state, action) => {
          if (state.api.loading === "pending") {
            state.entities.push(action.payload)
            state.api.loading = "idle"
          }
        }
      )
      .addCase(
        modules_social_auth_apple_login_create.rejected,
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
  modules_social_auth_apple_connect_create,
  modules_social_auth_apple_login_create,
  slice: customAppleSocialLoginsSlice
}
