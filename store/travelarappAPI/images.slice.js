import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { apiService } from "./api"
export const modules_camera_photos_user_list = createAsyncThunk(
  "images/modules_camera_photos_user_list",
  async payload => {
    const response = await apiService.modules_camera_photos_user_list(payload)
    return response.data
  }
)
export const modules_camera_photos_user_retrieve = createAsyncThunk(
  "images/modules_camera_photos_user_retrieve",
  async payload => {
    const response = await apiService.modules_camera_photos_user_retrieve(
      payload
    )
    return response.data
  }
)
const initialState = { entities: [], api: { loading: "idle", error: null } }
const imagesSlice = createSlice({
  name: "images",
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(modules_camera_photos_user_list.pending, (state, action) => {
        if (state.api.loading === "idle") {
          state.api.loading = "pending"
        }
      })
      .addCase(modules_camera_photos_user_list.fulfilled, (state, action) => {
        if (state.api.loading === "pending") {
          state.entities = action.payload
          state.api.loading = "idle"
        }
      })
      .addCase(modules_camera_photos_user_list.rejected, (state, action) => {
        if (state.api.loading === "pending") {
          state.api.error = action.error
          state.api.loading = "idle"
        }
      })
      .addCase(modules_camera_photos_user_retrieve.pending, (state, action) => {
        if (state.api.loading === "idle") {
          state.api.loading = "pending"
        }
      })
      .addCase(
        modules_camera_photos_user_retrieve.fulfilled,
        (state, action) => {
          if (state.api.loading === "pending") {
            state.entities = [
              ...state.entities.filter(
                record => record.id !== action.payload.id
              ),
              action.payload
            ]
            state.api.loading = "idle"
          }
        }
      )
      .addCase(
        modules_camera_photos_user_retrieve.rejected,
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
  modules_camera_photos_user_list,
  modules_camera_photos_user_retrieve,
  slice: imagesSlice
}
