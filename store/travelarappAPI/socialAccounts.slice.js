import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { apiService } from "./api"
export const modules_social_auth_socialaccounts_list = createAsyncThunk(
  "socialAccounts/modules_social_auth_socialaccounts_list",
  async payload => {
    const response = await apiService.modules_social_auth_socialaccounts_list(
      payload
    )
    return response.data
  }
)
const initialState = { entities: [], api: { loading: "idle", error: null } }
const socialAccountsSlice = createSlice({
  name: "socialAccounts",
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(
        modules_social_auth_socialaccounts_list.pending,
        (state, action) => {
          if (state.api.loading === "idle") {
            state.api.loading = "pending"
          }
        }
      )
      .addCase(
        modules_social_auth_socialaccounts_list.fulfilled,
        (state, action) => {
          if (state.api.loading === "pending") {
            state.entities = action.payload
            state.api.loading = "idle"
          }
        }
      )
      .addCase(
        modules_social_auth_socialaccounts_list.rejected,
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
  modules_social_auth_socialaccounts_list,
  slice: socialAccountsSlice
}
