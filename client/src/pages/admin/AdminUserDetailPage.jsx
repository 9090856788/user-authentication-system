import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { adminApi } from "../../services/adminApi.js";
import { showToast } from "../../features/ui/uiSlice.js";
import { LoadingSpinner } from "../../components/common/LoadingSpinner.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import {
  ArrowLeft,
  ShieldCheck,
  User,
  Mail,
  Smartphone,
  Calendar,
  Clock,
  UserX,
  UserCheck,
  Trash2,
  MapPin,
  AlignLeft,
} from "lucide-react";

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const currentAdmin = useSelector((state) => state.auth.user);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin", "user", id],
    queryFn: () => adminApi.getUserById(id),
  });

  const changeRoleMutation = useMutation({
    mutationFn: (newRole) => adminApi.changeUserRole(id, newRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      dispatch(showToast({ type: "success", message: "Role changed successfully" }));
    },
    onError: (err) => dispatch(showToast({ type: "error", message: err.message })),
  });

  const changeStatusMutation = useMutation({
    mutationFn: (newStatus) => adminApi.changeUserStatus(id, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      dispatch(showToast({ type: "success", message: "Status updated successfully" }));
    },
    onError: (err) => dispatch(showToast({ type: "error", message: err.message })),
  });

  const deleteMutation = useMutation({
    mutationFn: () => adminApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      dispatch(showToast({ type: "success", message: "User deleted" }));
      navigate("/admin/users");
    },
    onError: (err) => dispatch(showToast({ type: "error", message: err.message })),
  });

  if (isLoading) return <LoadingSpinner text="Loading user details..." />;

  if (isError || !data?.user) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
        <h3>User not found</h3>
        <p style={{ color: "var(--text-muted)", margin: "1rem 0" }}>{error?.message || "Could not retrieve user details"}</p>
        <Link to="/admin/users" className="btn btn-secondary">
          <ArrowLeft size={16} /> Back to Users
        </Link>
      </div>
    );
  }

  const user = data.user;
  const isSelf = String(user._id) === String(currentAdmin?._id);

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <Link
          to="/admin/users"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "0.75rem" }}
        >
          <ArrowLeft size={16} /> Back to Users
        </Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--text-primary)" }}>
            {user.fullName}
          </h1>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              className="btn btn-secondary"
              onClick={() => changeRoleMutation.mutate(user.role === "admin" ? "user" : "admin")}
              disabled={changeRoleMutation.isPending}
            >
              <ShieldCheck size={16} /> Make {user.role === "admin" ? "User" : "Admin"}
            </button>

            <button
              className={user.accountStatus === "active" ? "btn btn-secondary" : "btn btn-primary"}
              onClick={() => changeStatusMutation.mutate(user.accountStatus === "active" ? "suspended" : "active")}
              disabled={isSelf || changeStatusMutation.isPending}
            >
              {user.accountStatus === "active" ? <UserX size={16} /> : <UserCheck size={16} />}
              {user.accountStatus === "active" ? "Suspend" : "Activate"}
            </button>

            <button
              className="btn btn-danger"
              onClick={() => {
                if (window.confirm(`Permanently delete user ${user.fullName}?`)) {
                  deleteMutation.mutate();
                }
              }}
              disabled={isSelf || deleteMutation.isPending}
            >
              <Trash2 size={16} /> Delete User
            </button>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: "2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem" }}>
          <div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>User ID</span>
            <div style={{ fontSize: "0.95rem", fontFamily: "monospace", color: "var(--accent-primary)", marginTop: "0.2rem" }}>
              {user._id}
            </div>
          </div>

          <div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Email Address</span>
            <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)", marginTop: "0.2rem" }}>
              {user.email}
            </div>
          </div>

          <div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Username</span>
            <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)", marginTop: "0.2rem" }}>
              @{user.username}
            </div>
          </div>

          <div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Role</span>
            <div style={{ marginTop: "0.2rem" }}>
              <StatusBadge type="role" value={user.role} />
            </div>
          </div>

          <div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Account Status</span>
            <div style={{ marginTop: "0.2rem" }}>
              <StatusBadge type="status" value={user.accountStatus} />
            </div>
          </div>

          <div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Verification Status</span>
            <div style={{ marginTop: "0.2rem" }}>
              <StatusBadge type="verified" value={user.accountVerified} />
            </div>
          </div>

          <div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Phone</span>
            <div style={{ fontSize: "0.95rem", color: "var(--text-primary)", marginTop: "0.2rem" }}>
              {user.phoneNumber || "None"}
            </div>
          </div>

          <div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Registered Date</span>
            <div style={{ fontSize: "0.95rem", color: "var(--text-primary)", marginTop: "0.2rem" }}>
              {new Date(user.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
