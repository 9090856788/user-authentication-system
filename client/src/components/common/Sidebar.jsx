import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../features/auth/authSlice.js";
import { showToast } from "../../features/ui/uiSlice.js";
import { authApi } from "../../services/authApi.js";
import { queryClient } from "../../app/queryClient.js";
import {
  LayoutDashboard,
  User,
  Shield,
  LogOut,
  Users,
  ShieldAlert,
} from "lucide-react";

export default function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignored on logout
    } finally {
      dispatch(logout());
      queryClient.clear();
      dispatch(showToast({ type: "info", message: "Logged out successfully" }));
      navigate("/login");
    }
  };

  const navItemStyle = ({ isActive }) => ({
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.75rem 1rem",
    borderRadius: "var(--radius-md)",
    fontSize: "0.9rem",
    fontWeight: 500,
    textDecoration: "none",
    transition: "all 0.15s ease",
    background: isActive ? "var(--accent-primary)" : "transparent",
    color: isActive ? "#ffffff" : "var(--text-secondary)",
  });

  return (
    <aside className="sidebar">
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", flex: 1 }}>
        <NavLink to="/dashboard" style={navItemStyle}>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/profile" style={navItemStyle}>
          <User size={18} />
          <span>Profile</span>
        </NavLink>

        <NavLink to="/settings" style={navItemStyle}>
          <Shield size={18} />
          <span>Security & Settings</span>
        </NavLink>

        {user?.role === "admin" && (
          <div style={{ marginTop: "1.75rem" }}>
            <div
              style={{
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--text-muted)",
                padding: "0 1rem 0.5rem 1rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <ShieldAlert size={14} />
              <span>Admin Panel</span>
            </div>

            <NavLink to="/admin" end style={navItemStyle}>
              <LayoutDashboard size={18} />
              <span>Admin Stats</span>
            </NavLink>

            <NavLink to="/admin/users" style={navItemStyle}>
              <Users size={18} />
              <span>Users Management</span>
            </NavLink>
          </div>
        )}
      </div>

      <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "1rem" }}>
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-md)",
            fontSize: "0.9rem",
            fontWeight: 500,
            background: "transparent",
            border: "none",
            color: "var(--danger)",
            textAlign: "left",
          }}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
