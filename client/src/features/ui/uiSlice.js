import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  toast: null,
  isSidebarOpen: true,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    showToast: (state, action) => {
      state.toast = {
        id: Date.now(),
        type: action.payload.type || "info",
        message: action.payload.message || "",
      };
    },
    clearToast: (state) => {
      state.toast = null;
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.isSidebarOpen = action.payload;
    },
  },
});

export const { showToast, clearToast, toggleSidebar, setSidebarOpen } = uiSlice.actions;
export default uiSlice.reducer;
