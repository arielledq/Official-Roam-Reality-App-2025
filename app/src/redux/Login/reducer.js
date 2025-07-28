import {createSlice} from "@reduxjs/toolkit";

const initialState = {
  data: {},
};

export const sliceLogin = createSlice({
  name: "login",
  initialState,
  reducers: {
    resetState: () => initialState,
    updateUserData: (state, action) => {
      state.data = action.payload;
    },
    updateUserProperties: (state, action) => {
      state.data.user = {
        ...state.data.user,
        ...action.payload,
      };
    },
    updateUserLocationData: (state, action) => {
      const {longitude, latitude} = action.payload || {};
      if (
        !state?.data?.user?.ar_user_profile_user ||
        typeof longitude !== "number" ||
        typeof latitude !== "number"
      ) {
        state.data.user.ar_user_profile_user.current_location = null;
        return;
      }
      state.data.user.ar_user_profile_user.current_location = {
        ...state.data.user.ar_user_profile_user.current_location,
        coordinates: [longitude, latitude],
      };
    },
    updateAccountFlag: (state, action) => {
      state.data.user.user_profile.account_setup = action.payload;
    },
    updateVerified: (state, action) => {
      if (state?.data?.user?.user_profile) {
        state.data.user.user_profile.is_verified = action.payload;
      }
    },
  },
});

export const {
  resetState,
  updateUserData,
  updateUserProperties,
  updateUserLocationData,
  updateAccountFlag,
  updateVerified,
} = sliceLogin.actions;
