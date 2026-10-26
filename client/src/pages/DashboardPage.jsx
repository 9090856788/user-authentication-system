import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { updateUser, logout } from "../features/auth/authSlice.js";
import { showToast } from "../features/ui/uiSlice.js";
import { userApi } from "../services/userApi.js";
import { queryClient } from "../app/queryClient.js";
import Modal from "../components/common/Modal.jsx";
import {
  User,
  Mail,
  Shield,
  Smartphone,
  Calendar,
  Edit,
  Key,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";

export default function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    fullName: user?.fullName || "",
    phoneNumber: user?.phoneNumber || "",
    bio: user?.bio || "",
    address: user?.address?.city || "",
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  // Delete account state
  const [deletePassword, setDeletePassword] = useState("");

  const editProfileMutation = useMutation({
    mutationFn: (data) => userApi.updateProfile(data),
    onSuccess: (res) => {
      dispatch(updateUser(res.user));
      dispatch(showToast({ type: "success", message: "Profile updated successfully!" }));
      setIsEditModalOpen(false);
    },
    onError: (err) => {
      dispatch(showToast({ type: "error", message: err.message || "Failed to update profile." }));
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data) => userApi.changePassword(data),
    onSuccess: () => {
      dispatch(showToast({ type: "success", message: "Password updated successfully!" }));
      setIsPasswordModalOpen(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    },
    onError: (err) => {
      dispatch(showToast({ type: "error", message: err.message || "Failed to change password." }));
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

  const sendOtpMutation = useMutation({
    mutationFn: () => userApi.sendVerificationOTP(),
    onSuccess: () => {
      dispatch(showToast({ type: "success", message: "Verification OTP sent to your email!" }));
      navigate("/verify-otp");
    },
    onError: (err) => {
      dispatch(showToast({ type: "error", message: err.message || "Failed to send verification OTP." }));
    },
  });

  const formatDate = (dateString) => {
    if (!dateString) return "Oct 26, 2026";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Oct 26, 2026";
    }
  };

  return (
    <div>
      {/* Welcome Section matching Screen 9 */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--text-primary)" }}>
          Welcome back, {user?.fullName || "User"} 👋
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginTop: "0.25rem" }}>
          Here is a summary of your account and security status
        </p>
      </div>

      {/* 3 Status Cards */}
      <div className="stats-grid">
        <div className="stats-card">
          <div className="stats-icon-wrap" style={{ background: "var(--success-bg)", color: "var(--success)" }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="stats-info">
            <h4>Profile Status</h4>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.3rem" }}>
              <span className="badge badge-success">Active</span>
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div
            className="stats-icon-wrap"
            style={{
              background: user?.accountVerified ? "var(--success-bg)" : "var(--warning-bg)",
              color: user?.accountVerified ? "var(--success)" : "var(--warning)",
            }}
          >
            <Mail size={24} />
          </div>
          <div className="stats-info">
            <h4>Email Status</h4>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.3rem" }}>
              <span className={`badge ${user?.accountVerified ? "badge-success" : "badge-warning"}`}>
                {user?.accountVerified ? "Verified" : "Unverified"}
              </span>
              {!user?.accountVerified && (
                <button
                  onClick={() => sendOtpMutation.mutate()}
                  disabled={sendOtpMutation.isPending}
                  style={{ background: "none", border: "none", color: "var(--accent-primary)", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}
                >
                  Verify Now
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-icon-wrap" style={{ background: "var(--accent-light)", color: "var(--accent-primary)" }}>
            <Shield size={24} />
          </div>
          <div className="stats-info">
            <h4>Account Security</h4>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.3rem" }}>
              <span className="badge badge-info">Secure (JWT 15m)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Section: Account Overview & Quick Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
        {/* Account Overview Card */}
        <div className="card">
          <h3 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "1.25rem", color: "var(--text-primary)" }}>
            Account Overview
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.9rem" }}>
              <User size={18} style={{ color: "var(--text-muted)" }} />
              <span style={{ color: "var(--text-muted)", width: 110 }}>Full Name:</span>
              <strong style={{ color: "var(--text-primary)" }}>{user?.fullName || "Not provided"}</strong>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.9rem" }}>
              <Mail size={18} style={{ color: "var(--text-muted)" }} />
              <span style={{ color: "var(--text-muted)", width: 110 }}>Email:</span>
              <strong style={{ color: "var(--text-primary)" }}>{user?.email}</strong>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.9rem" }}>
              <User size={18} style={{ color: "var(--text-muted)" }} />
              <span style={{ color: "var(--text-muted)", width: 110 }}>Username:</span>
              <strong style={{ color: "var(--text-primary)" }}>@{user?.username}</strong>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.9rem" }}>
              <Smartphone size={18} style={{ color: "var(--text-muted)" }} />
              <span style={{ color: "var(--text-muted)", width: 110 }}>Phone:</span>
              <strong style={{ color: "var(--text-primary)" }}>{user?.phoneNumber || "Not provided"}</strong>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.9rem" }}>
              <Calendar size={18} style={{ color: "var(--text-muted)" }} />
              <span style={{ color: "var(--text-muted)", width: 110 }}>Member Since:</span>
              <strong style={{ color: "var(--text-primary)" }}>{formatDate(user?.createdAt)}</strong>
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="card">
          <h3 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "1.25rem", color: "var(--text-primary)" }}>
            Quick Actions
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            <button
              className="btn btn-secondary"
              style={{ justifyContent: "flex-start", padding: "0.85rem 1rem" }}
              onClick={() => {
                setEditForm({
                  fullName: user?.fullName || "",
                  phoneNumber: user?.phoneNumber || "",
                  bio: user?.bio || "",
                  address: user?.address?.city || "",
                });
                setIsEditModalOpen(true);
              }}
            >
              <Edit size={18} style={{ color: "var(--accent-primary)" }} />
              <span>Edit Profile</span>
            </button>

            <button
              className="btn btn-secondary"
              style={{ justifyContent: "flex-start", padding: "0.85rem 1rem" }}
              onClick={() => setIsPasswordModalOpen(true)}
            >
              <Key size={18} style={{ color: "var(--warning)" }} />
              <span>Change Password</span>
            </button>

            <button
              className="btn btn-secondary"
              style={{ justifyContent: "flex-start", padding: "0.85rem 1rem", color: "var(--danger)" }}
              onClick={() => setIsDeleteModalOpen(true)}
            >
              <Trash2 size={18} />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal (Screen 11) */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              disabled={editProfileMutation.isPending}
              onClick={() => {
                editProfileMutation.mutate({
                  fullName: editForm.fullName,
                  phoneNumber: editForm.phoneNumber,
                  bio: editForm.bio,
                  address: { city: editForm.address },
                });
              }}
            >
              {editProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            className="input-field"
            value={editForm.fullName}
            onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <input
            type="text"
            className="input-field"
            value={editForm.phoneNumber}
            onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Bio</label>
          <textarea
            rows={3}
            className="input-field"
            placeholder="Tell us about yourself..."
            value={editForm.bio}
            onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">City / Address</label>
          <input
            type="text"
            className="input-field"
            value={editForm.address}
            onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
          />
        </div>
      </Modal>

      {/* Change Password Modal (Screen 12) */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Change Password"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsPasswordModalOpen(false)}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              disabled={changePasswordMutation.isPending}
              onClick={() => {
                if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
                  dispatch(showToast({ type: "error", message: "New passwords do not match." }));
                  return;
                }
                changePasswordMutation.mutate({
                  currentPassword: passwordForm.currentPassword,
                  newPassword: passwordForm.newPassword,
                });
              }}
            >
              {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Current Password</label>
          <input
            type="password"
            className="input-field"
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
            placeholder="••••••••"
            value={passwordForm.confirmNewPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
          />
        </div>

        <div style={{ background: "var(--bg-surface-secondary)", padding: "0.85rem", borderRadius: "8px", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.25rem" }}>
            <CheckCircle2 size={14} color={passwordForm.newPassword.length >= 8 ? "var(--success)" : "var(--text-muted)"} />
            <span>At least 8 characters long</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <CheckCircle2 size={14} color={/\d/.test(passwordForm.newPassword) ? "var(--success)" : "var(--text-muted)"} />
            <span>Includes at least one number</span>
          </div>
        </div>
      </Modal>

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
            <label className="form-label">Confirm with your password</label>
            <input
              type="password"
              className="input-field"
              placeholder="Enter your current password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
