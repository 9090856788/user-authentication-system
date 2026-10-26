import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { adminApi } from "../../services/adminApi.js";
import { showToast } from "../../features/ui/uiSlice.js";
import { LoadingSpinner, SkeletonRow } from "../../components/common/LoadingSpinner.jsx";
import Modal from "../../components/common/Modal.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import {
  Search,
  ShieldCheck,
  UserX,
  UserCheck,
  Trash2,
  Edit,
  Eye,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

export default function AdminUsersPage() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const currentAdmin = useSelector((state) => state.auth.user);

  // Filter & Pagination states
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [accountVerified, setAccountVerified] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Selected user for modals
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Edit form
  const [editForm, setEditForm] = useState({
    fullName: "",
    phoneNumber: "",
    bio: "",
    accountVerified: false,
  });

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["admin", "users", { page, limit, search, role, status, accountVerified, sortBy, sortOrder }],
    queryFn: () =>
      adminApi.getUsers({
        page,
        limit,
        search,
        role,
        status,
        accountVerified,
        sortBy,
        sortOrder,
      }),
  });

  // Mutations
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      dispatch(showToast({ type: "success", message: "User updated successfully." }));
      setIsEditModalOpen(false);
    },
    onError: (err) => {
      dispatch(showToast({ type: "error", message: err.message || "Failed to update user." }));
    },
  });

  const changeRoleMutation = useMutation({
    mutationFn: ({ id, role }) => adminApi.changeUserRole(id, role),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      dispatch(showToast({ type: "success", message: res.message || "Role updated successfully." }));
      setIsRoleModalOpen(false);
    },
    onError: (err) => {
      dispatch(showToast({ type: "error", message: err.message || "Failed to change role." }));
    },
  });

  const changeStatusMutation = useMutation({
    mutationFn: ({ id, status }) => adminApi.changeUserStatus(id, status),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      dispatch(showToast({ type: "success", message: res.message || "Status updated successfully." }));
      setIsStatusModalOpen(false);
    },
    onError: (err) => {
      dispatch(showToast({ type: "error", message: err.message || "Failed to update status." }));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      dispatch(showToast({ type: "success", message: "User deleted successfully." }));
      setIsDeleteModalOpen(false);
    },
    onError: (err) => {
      dispatch(showToast({ type: "error", message: err.message || "Failed to delete user." }));
    },
  });

  const users = data?.users || [];
  const pagination = data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div>
      {/* Title & Actions Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--text-primary)" }}>
            Users Management
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginTop: "0.25rem" }}>
            Search, filter, edit roles, and manage accounts
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <span className="badge badge-info" style={{ padding: "0.45rem 0.85rem", fontSize: "0.85rem" }}>
            Total Users: {pagination.total}
          </span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="card" style={{ marginBottom: "1.5rem", padding: "1.25rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", alignItems: "center" }}>
          {/* Search Box */}
          <div style={{ position: "relative", gridColumn: "span 2" }}>
            <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
              <Search size={18} />
            </span>
            <input
              type="text"
              className="input-field"
              style={{ paddingLeft: "2.4rem" }}
              placeholder="Search by name, email, or username..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Role Filter */}
          <div>
            <select
              className="input-field"
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          {/* Account Status Filter */}
          <div>
            <select
              className="input-field"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Email Verification Filter */}
          <div>
            <select
              className="input-field"
              value={accountVerified}
              onChange={(e) => {
                setAccountVerified(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Verifications</option>
              <option value="true">Verified</option>
              <option value="false">Unverified</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table matching Screen 14 */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Verification</th>
              <th>Account Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <>
                <SkeletonRow columns={6} />
                <SkeletonRow columns={6} />
                <SkeletonRow columns={6} />
              </>
            ) : isError ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--danger)" }}>
                  {error?.message || "Error loading users."}
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-muted)" }}>
                  No users found matching your filters.
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isSelf = String(u._id) === String(currentAdmin?._id);
                return (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #4f46e5, #06b6d4)",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.85rem",
                            fontWeight: 700,
                          }}
                        >
                          {getInitials(u.fullName)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                            {u.fullName} {isSelf && <span style={{ fontSize: "0.75rem", color: "var(--accent-primary)" }}>(You)</span>}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>@{u.username}</div>
                        </div>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <StatusBadge type="role" value={u.role} />
                    </td>
                    <td>
                      <StatusBadge type="verified" value={u.accountVerified} />
                    </td>
                    <td>
                      <StatusBadge type="status" value={u.accountStatus} />
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.4rem" }}>
                        {/* View Details */}
                        <Link
                          to={`/admin/users/${u._id}`}
                          className="btn-icon"
                          title="View Details"
                          style={{ width: 32, height: 32 }}
                        >
                          <Eye size={15} />
                        </Link>

                        {/* Edit User */}
                        <button
                          className="btn-icon"
                          title="Edit User"
                          style={{ width: 32, height: 32 }}
                          onClick={() => {
                            setSelectedUser(u);
                            setEditForm({
                              fullName: u.fullName || "",
                              phoneNumber: u.phoneNumber || "",
                              bio: u.bio || "",
                              accountVerified: !!u.accountVerified,
                            });
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Edit size={15} />
                        </button>

                        {/* Change Role */}
                        <button
                          className="btn-icon"
                          title={`Change Role (Current: ${u.role})`}
                          style={{ width: 32, height: 32, color: u.role === "admin" ? "var(--accent-primary)" : "var(--text-muted)" }}
                          onClick={() => {
                            setSelectedUser(u);
                            setIsRoleModalOpen(true);
                          }}
                        >
                          <ShieldCheck size={15} />
                        </button>

                        {/* Suspend / Reactivate */}
                        <button
                          className="btn-icon"
                          title={u.accountStatus === "active" ? "Suspend Account" : "Reactivate Account"}
                          style={{ width: 32, height: 32, color: u.accountStatus === "active" ? "var(--warning)" : "var(--success)" }}
                          onClick={() => {
                            setSelectedUser(u);
                            setIsStatusModalOpen(true);
                          }}
                          disabled={isSelf}
                        >
                          {u.accountStatus === "active" ? <UserX size={15} /> : <UserCheck size={15} />}
                        </button>

                        {/* Delete User */}
                        <button
                          className="btn-icon"
                          title="Delete User"
                          style={{ width: 32, height: 32, color: "var(--danger)" }}
                          onClick={() => {
                            setSelectedUser(u);
                            setIsDeleteModalOpen(true);
                          }}
                          disabled={isSelf}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        <div className="table-pagination">
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total records)
          </span>

          <div style={{ display: "flex", gap: "0.4rem" }}>
            <button
              className="btn btn-secondary"
              style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem" }}
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={16} /> Previous
            </button>

            <button
              className="btn btn-secondary"
              style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem" }}
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit User: ${selectedUser?.fullName || ""}`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              disabled={updateMutation.isPending}
              onClick={() => {
                updateMutation.mutate({
                  id: selectedUser?._id,
                  data: editForm,
                });
              }}
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
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
            value={editForm.bio}
            onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
          <input
            type="checkbox"
            id="modalVerified"
            checked={editForm.accountVerified}
            onChange={(e) => setEditForm({ ...editForm, accountVerified: e.target.checked })}
          />
          <label htmlFor="modalVerified" style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>
            Mark account as verified
          </label>
        </div>
      </Modal>

      {/* Change Role Modal */}
      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        title="Change User Role"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsRoleModalOpen(false)}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              disabled={changeRoleMutation.isPending}
              onClick={() => {
                const nextRole = selectedUser?.role === "admin" ? "user" : "admin";
                changeRoleMutation.mutate({ id: selectedUser?._id, role: nextRole });
              }}
            >
              {changeRoleMutation.isPending ? "Updating..." : "Confirm Role Change"}
            </button>
          </>
        }
      >
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Are you sure you want to change the role for{" "}
          <strong style={{ color: "var(--text-primary)" }}>{selectedUser?.fullName}</strong> from{" "}
          <strong style={{ color: "var(--accent-primary)" }}>{selectedUser?.role}</strong> to{" "}
          <strong style={{ color: "var(--accent-primary)" }}>
            {selectedUser?.role === "admin" ? "user" : "admin"}
          </strong>
          ?
        </p>
      </Modal>

      {/* Change Status Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Change Account Status"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsStatusModalOpen(false)}>
              Cancel
            </button>
            <button
              className={selectedUser?.accountStatus === "active" ? "btn btn-danger" : "btn btn-success"}
              disabled={changeStatusMutation.isPending}
              onClick={() => {
                const nextStatus = selectedUser?.accountStatus === "active" ? "suspended" : "active";
                changeStatusMutation.mutate({ id: selectedUser?._id, status: nextStatus });
              }}
            >
              {changeStatusMutation.isPending
                ? "Processing..."
                : selectedUser?.accountStatus === "active"
                ? "Suspend Account"
                : "Reactivate Account"}
            </button>
          </>
        }
      >
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          {selectedUser?.accountStatus === "active"
            ? `Suspend ${selectedUser?.fullName}'s access? The user will be immediately barred from logging in or using authenticated endpoints.`
            : `Reactivate ${selectedUser?.fullName}'s account access? The user will be permitted to authenticate normally.`}
        </p>
      </Modal>

      {/* Delete User Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Permanently Delete User?"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </button>
            <button
              className="btn btn-danger"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(selectedUser?._id)}
            >
              {deleteMutation.isPending ? "Deleting..." : "Permanently Delete"}
            </button>
          </>
        }
      >
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          This will permanently delete the account of{" "}
          <strong style={{ color: "var(--text-primary)" }}>{selectedUser?.fullName}</strong> (@{selectedUser?.username}).
          This action is destructive and irreversible.
        </p>
      </Modal>
    </div>
  );
}
