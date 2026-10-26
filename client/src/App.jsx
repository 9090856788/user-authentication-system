import React, { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { router } from "./app/router.jsx";
import { setCredentials, setInitialized } from "./features/auth/authSlice.js";
import { authApi } from "./services/authApi.js";
import { LoadingSpinner } from "./components/common/LoadingSpinner.jsx";
import "./styles/global.css";
import "./styles/components.css";

export default function App() {
  const dispatch = useDispatch();
  const isInitialized = useSelector((state) => state.auth.isInitialized);

  useEffect(() => {
    // Attempt initial session restoration via refresh token cookie
    const restoreSession = async () => {
      try {
        const data = await authApi.refreshToken();
        if (data?.accessToken && data?.user) {
          dispatch(
            setCredentials({
              accessToken: data.accessToken,
              user: data.user,
            })
          );
        } else {
          dispatch(setInitialized(true));
        }
      } catch {
        dispatch(setInitialized(true));
      }
    };

    restoreSession();
  }, [dispatch]);

  if (!isInitialized) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)" }}>
        <LoadingSpinner text="Initializing AuthApp..." />
      </div>
    );
  }

  return <RouterProvider router={router} />;
}