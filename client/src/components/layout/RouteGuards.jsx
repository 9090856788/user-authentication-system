import React from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { ShieldAlert } from "lucide-react";

export function ProtectedRoute() {
  const { isAuthenticated, isInitialized } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isInitialized) {
    return null; // Will show spinner in App while checking session
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

export function AdminRoute() {
  const { user, isAuthenticated, isInitialized } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isInitialized) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== "admin") {
    return (
      <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "var(--danger-bg)",
            color: "var(--danger)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem auto",
          }}
        >
          <ShieldAlert size={36} />
        </div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--danger)" }}>403 - Unauthorized Access</h2>
        <p style={{ color: "var(--text-muted)", maxWidth: 440, margin: "0.5rem auto 1.5rem auto" }}>
          You do not have administrative privileges to access this area. This attempt is logged.
        </p>
        <Navigate to="/dashboard" replace />
      </div>
    );
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { isAuthenticated, isInitialized } = useSelector((state) => state.auth);

  if (!isInitialized) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
