import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { updateUser } from "../features/auth/authSlice.js";
import { showToast } from "../features/ui/uiSlice.js";
import { userApi } from "../services/userApi.js";
import Modal from "../components/common/Modal.jsx";
import StatusBadge from "../components/common/StatusBadge.jsx";
import { User, Mail, Smartphone, MapPin, AlignLeft, Calendar, Edit, ShieldCheck } from "lucide-react";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [editForm, setEditForm] = useState({
    fullName: user?.fullName || "",
    phoneNumber: user?.phoneNumber || "",
    bio: user?.bio || "",
    address: user?.address?.city || "",
  });

  const editProfileMutation = useMutation({
    mutationFn: (data) => userApi.updateProfile(data),
    onSuccess: (res) => {
      dispatch(updateUser(res.user));
      dispatch(showToast({ type: "success", message: "Profile successfully updated!" }));
      setIsEditModalOpen(false);
    },
    onError: (err) => {
      dispatch(showToast({ type: "error", message: err.message || "Failed to update profile." }));
    },
  });

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--text-primary)" }}>Profile Information</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginTop: "0.25rem" }}>
            View and manage your personal authentication profile
          </p>
        </div>

        <button
          className="btn btn-primary"
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
          <Edit size={16} /> Edit Profile
        </button>
      </div>

      <div className="card" style={{ padding: "2rem" }}>
        {/* Profile Card Header matching Screen 10 */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", paddingBottom: "2rem", borderBottom: "1px solid var(--border-subtle)", marginBottom: "2rem", flexWrap: "wrap" }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #4f46e5, #06b6d4)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              fontWeight: 700,
              boxShadow: "0 6px 16px rgba(79, 70, 229, 0.3)",
            }}
          >
            {getInitials(user?.fullName)}
          </div>

          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)" }}>{user?.fullName}</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>@{user?.username}</p>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              <StatusBadge type="verified" value={user?.accountVerified} />
              <StatusBadge type="role" value={user?.role} />
            </div>
          </div>
        </div>

        {/* Detailed Fields matching Screen 10 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
            <User size={20} style={{ color: "var(--accent-primary)", marginTop: "2px" }} />
            <div>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
                Full Name
              </span>
              <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)", marginTop: "0.15rem" }}>
                {user?.fullName || "Not specified"}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
            <Mail size={20} style={{ color: "var(--accent-primary)", marginTop: "2px" }} />
            <div>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
                Email Address
              </span>
              <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)", marginTop: "0.15rem" }}>
                {user?.email}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
            <User size={20} style={{ color: "var(--accent-primary)", marginTop: "2px" }} />
            <div>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
                Username
              </span>
              <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)", marginTop: "0.15rem" }}>
                @{user?.username}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
            <Smartphone size={20} style={{ color: "var(--accent-primary)", marginTop: "2px" }} />
            <div>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
                Phone Number
              </span>
              <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)", marginTop: "0.15rem" }}>
                {user?.phoneNumber || "Not provided"}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
            <AlignLeft size={20} style={{ color: "var(--accent-primary)", marginTop: "2px" }} />
            <div>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
                Bio
              </span>
              <div style={{ fontSize: "0.95rem", color: "var(--text-secondary)", marginTop: "0.15rem" }}>
                {user?.bio || "No biography provided yet."}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
            <MapPin size={20} style={{ color: "var(--accent-primary)", marginTop: "2px" }} />
            <div>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
                Address / Location
              </span>
              <div style={{ fontSize: "0.95rem", color: "var(--text-primary)", marginTop: "0.15rem" }}>
                {user?.address?.city || user?.address?.street || "Not specified"}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
            <Calendar size={20} style={{ color: "var(--accent-primary)", marginTop: "2px" }} />
            <div>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
                Member Since
              </span>
              <div style={{ fontSize: "0.95rem", color: "var(--text-primary)", marginTop: "0.15rem" }}>
                {formatDate(user?.createdAt)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
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
    </div>
  );
}
