import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { apiService } from "./api"
export const modules_social_auth_socialaccounts_disconnect_create = createAsyncThunk(
  "socialConnects/modules_social_auth_socialaccounts_disconnect_create",
  async payload => {
    const response = await apiService.modules_social_auth_socialaccounts_disconnect_create(
      payload
    )
    return response.data
  }
)
const initialState = { entities: [], api: { loading: "idle", error: null } }
const socialConnectsSlice = createSlice({
  name: "socialConnects",
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(
        modules_social_auth_socialaccounts_disconnect_create.pending,
        (state, action) => {
          if (state.api.loading === "idle") {
            state.api.loading = "pending"
          }
        }
      )
      .addCase(
        modules_social_auth_socialaccounts_disconnect_create.fulfilled,
        (state, action) => {
          if (state.api.loading === "pending") {
            state.entities.push(action.payload)
            state.api.loading = "idle"
          }
        }
      )
      .addCase(
        modules_social_auth_socialaccounts_disconnect_create.rejected,
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
  modules_social_auth_socialaccounts_disconnect_create,
  slice: socialConnectsSlice
}
