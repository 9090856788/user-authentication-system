import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme } from "../../features/theme/themeSlice.js";
import { logout } from "../../features/auth/authSlice.js";
import { showToast } from "../../features/ui/uiSlice.js";
import { authApi } from "../../services/authApi.js";
import { queryClient } from "../../app/queryClient.js";
import { Shield, Sun, Moon, LogOut, ShieldCheck } from "lucide-react";

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useSelector((state) => state.theme.mode);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignored on logout
    } finally {
      dispatch(logout());
      queryClient.clear();
      dispatch(showToast({ type: "info", message: "You have been logged out." }));
      navigate("/login");
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="top-header">
      <Link to={isAuthenticated ? "/dashboard" : "/"} className="brand-logo">
        <div className="brand-icon-box">
          <Shield size={20} />
        </div>
        <span>AuthApp</span>
      </Link>

      {!isAuthenticated && (
        <nav style={{ display: "flex", alignItems: "center", gap: "1.5rem" }} className="desktop-nav">
          <Link to="/" style={{ color: "var(--text-secondary)", fontSize: "0.9rem", fontWeight: 500 }}>
            Home
          </Link>
          <a href="#features" style={{ color: "var(--text-secondary)", fontSize: "0.9rem", fontWeight: 500 }}>
            Features
          </a>
          <a href="#about" style={{ color: "var(--text-secondary)", fontSize: "0.9rem", fontWeight: 500 }}>
            About
          </a>
        </nav>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
        {/* Theme Toggle */}
        <button
          className="btn-icon"
          onClick={() => dispatch(toggleTheme())}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          aria-label="Toggle color theme"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {isAuthenticated && user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            {user.role === "admin" && (
              <Link to="/admin" className="badge badge-info" style={{ textDecoration: "none", padding: "0.4rem 0.75rem" }}>
                <ShieldCheck size={14} />
                Admin Panel
              </Link>
            )}

            <Link
              to="/profile"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                textDecoration: "none",
                padding: "0.3rem 0.6rem",
                borderRadius: "var(--radius-md)",
                background: "var(--bg-surface-secondary)",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #4f46e5, #06b6d4)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                }}
              >
                {getInitials(user.fullName)}
              </div>
              <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>
                {user.fullName || user.username}
              </span>
            </Link>

            <button
              onClick={handleLogout}
              className="btn-icon"
              title="Logout"
              aria-label="Log out"
              style={{ color: "var(--danger)" }}
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Link to="/login" className="btn btn-primary" style={{ padding: "0.45rem 1rem", fontSize: "0.85rem" }}>
              Login
            </Link>
            <Link to="/register" className="btn btn-secondary" style={{ padding: "0.45rem 1rem", fontSize: "0.85rem" }}>
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
