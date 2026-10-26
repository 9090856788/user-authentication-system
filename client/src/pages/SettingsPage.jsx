import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { setTheme } from "../features/theme/themeSlice.js";
import { logout } from "../features/auth/authSlice.js";
import { showToast } from "../features/ui/uiSlice.js";
import { userApi } from "../services/userApi.js";
import { queryClient } from "../app/queryClient.js";
import Modal from "../components/common/Modal.jsx";
import { Key, Sun, Moon, Trash2, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useSelector((state) => state.theme.mode);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");

  const changePasswordMutation = useMutation({
    mutationFn: (data) => userApi.changePassword(data),
    onSuccess: () => {
      dispatch(showToast({ type: "success", message: "Password updated successfully!" }));
      setPasswordForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    },
    onError: (err) => {
      dispatch(showToast({ type: "error", message: err.message || "Failed to update password." }));
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: () => userApi.deleteAccount(deletePassword),
    onSuccess: () => {
      dispatch(logout());
      queryClient.clear();
      dispatch(showToast({ type: "info", message: "Your account has been deleted." }));
      navigate("/register");
    },
    onError: (err) => {
      dispatch(showToast({ type: "error", message: err.message || "Failed to delete account." }));
    },
  });

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      dispatch(showToast({ type: "error", message: "New passwords do not match." }));
      return;
    }
    changePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--text-primary)" }}>
          Security & Account Settings
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginTop: "0.25rem" }}>
          Manage your credentials, theme preferences, and security options
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: 760 }}>
        {/* Change Password Card matching Screen 12 */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
            <div style={{ width: 36, height: 36, borderRadius: "8px", background: "var(--accent-light)", color: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Key size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)" }}>Change Password</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Ensure your account is using a long, random password</p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="input-field"
                required
                placeholder="••••••••"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="input-field"
                required
                minLength={8}
                placeholder="••••••••"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="input-field"
                required
                minLength={8}
                placeholder="••••••••"
                value={passwordForm.confirmNewPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
              />
            </div>

            {/* Password strength indicators matching Screen 12 */}
            <div style={{ background: "var(--bg-surface-secondary)", padding: "0.85rem 1rem", borderRadius: "8px", fontSize: "0.85rem", margin: "1rem 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.35rem" }}>
                <CheckCircle2 size={16} color={passwordForm.newPassword.length >= 8 ? "var(--success)" : "var(--text-muted)"} />
                <span style={{ color: passwordForm.newPassword.length >= 8 ? "var(--success)" : "var(--text-muted)" }}>
                  At least 8 characters long
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.35rem" }}>
                <CheckCircle2 size={16} color={/\d/.test(passwordForm.newPassword) ? "var(--success)" : "var(--text-muted)"} />
                <span style={{ color: /\d/.test(passwordForm.newPassword) ? "var(--success)" : "var(--text-muted)" }}>
                  Include a number
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <CheckCircle2 size={16} color={/[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.newPassword) ? "var(--success)" : "var(--text-muted)"} />
                <span style={{ color: /[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.newPassword) ? "var(--success)" : "var(--text-muted)" }}>
                  Include a special character
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={changePasswordMutation.isPending || passwordForm.newPassword.length < 8}
            >
              {changePasswordMutation.isPending ? "Updating Password..." : "Update Password"}
            </button>
          </form>
        </div>

        {/* Theme Preferences Card */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
            <div style={{ width: 36, height: 36, borderRadius: "8px", background: "var(--warning-bg)", color: "var(--warning)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sun size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)" }}>Theme Preferences</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Select your preferred interface color mode</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <button
              type="button"
              className={`btn ${theme === "light" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => dispatch(setTheme("light"))}
              style={{ gap: "0.5rem" }}
            >
              <Sun size={18} /> Light Mode
            </button>
            <button
              type="button"
              className={`btn ${theme === "dark" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => dispatch(setTheme("dark"))}
              style={{ gap: "0.5rem" }}
            >
              <Moon size={18} /> Dark Mode
            </button>
          </div>
        </div>

        {/* Danger Zone: Delete Account Card */}
        <div className="card" style={{ border: "1px solid var(--danger-border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <div style={{ width: 36, height: 36, borderRadius: "8px", background: "var(--danger-bg)", color: "var(--danger)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Trash2 size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--danger)" }}>Danger Zone</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Irreversible actions regarding your account</p>
            </div>
          </div>

          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1.25rem" }}>
            Once you delete your account, there is no going back. All of your profile data will be permanently wiped.
          </p>

          <button className="btn btn-danger" onClick={() => setIsDeleteModalOpen(true)}>
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Account Modal (Screen 13) */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Your Account?"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </button>
            <button
              className="btn btn-danger"
              disabled={deleteAccountMutation.isPending}
              onClick={() => deleteAccountMutation.mutate()}
            >
              {deleteAccountMutation.isPending ? "Deleting..." : "Delete Account"}
            </button>
          </>
        }
      >
        <div style={{ textAlign: "center", padding: "1rem 0" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "var(--danger-bg)",
              color: "var(--danger)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem auto",
            }}
          >
            <Trash2 size={28} />
          </div>
          <h4 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--danger)" }}>
            Delete Your Account?
          </h4>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.5rem" }}>
            This action cannot be undone. All your user profile details will be permanently removed.
          </p>

          <div className="form-group" style={{ marginTop: "1.5rem", textAlign: "left" }}>
            <label className="form-label">Enter your password to confirm</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
