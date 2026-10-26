import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice.js";
import themeReducer from "../features/theme/themeSlice.js";
import uiReducer from "../features/ui/uiSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    ui: uiReducer,
  },
});
