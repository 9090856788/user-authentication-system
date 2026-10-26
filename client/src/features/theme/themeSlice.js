import { createSlice } from "@reduxjs/toolkit";

const getInitialTheme = () => {
  try {
    const saved = localStorage.getItem("app_theme");
    if (saved === "light" || saved === "dark") {
      document.documentElement.setAttribute("data-theme", saved);
      return saved;
    }
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = prefersDark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", initial);
    return initial;
  } catch {
    return "light";
  }
};

const initialState = {
  mode: getInitialTheme(),
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.mode = action.payload;
      try {
        localStorage.setItem("app_theme", action.payload);
        document.documentElement.setAttribute("data-theme", action.payload);
      } catch (e) {
        console.warn("Could not save theme preference:", e);
      }
    },
    toggleTheme: (state) => {
      const nextTheme = state.mode === "dark" ? "light" : "dark";
      state.mode = nextTheme;
      try {
        localStorage.setItem("app_theme", nextTheme);
        document.documentElement.setAttribute("data-theme", nextTheme);
      } catch (e) {
        console.warn("Could not toggle theme:", e);
      }
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
