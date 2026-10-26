import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload;
      if (user) state.user = user;
      if (accessToken) state.accessToken = accessToken;
      state.isAuthenticated = true;
      state.isInitialized = true;
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
    },
    setInitialized: (state, action) => {
      state.isInitialized = action.payload;
    },
  },
});

export const { setCredentials, updateUser, logout, setInitialized } = authSlice.actions;
export default authSlice.reducer;
