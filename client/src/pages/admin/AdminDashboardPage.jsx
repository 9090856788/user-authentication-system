import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../services/adminApi.js";
import { LoadingSpinner } from "../../components/common/LoadingSpinner.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import {
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  UserX,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => adminApi.getDashboardStats(),
  });

  if (isLoading) {
    return <LoadingSpinner text="Computing administrator statistics..." />;
  }

  if (isError) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "3rem 1rem" }}>
        <AlertTriangle size={36} color="var(--danger)" style={{ margin: "0 auto 1rem auto" }} />
        <h3 style={{ color: "var(--danger)" }}>Failed to Load Dashboard Stats</h3>
        <p style={{ color: "var(--text-muted)", margin: "0.5rem 0 1.5rem 0" }}>{error?.message || "An error occurred"}</p>
        <button className="btn btn-secondary" onClick={() => refetch()}>
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  const { stats, recentUsers = [] } = data || {};

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--text-primary)" }}>
            Administrator Dashboard
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginTop: "0.25rem" }}>
            Real-time user statistics, authentication metrics, and administrative oversight
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button className="btn btn-secondary" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw size={16} className={isFetching ? "spin" : ""} /> Refresh
          </button>
          <Link to="/admin/users" className="btn btn-primary">
            Manage Users <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* 6 Stats Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <div className="stats-card">
          <div className="stats-icon-wrap" style={{ background: "var(--accent-light)", color: "var(--accent-primary)" }}>
            <Users size={24} />
          </div>
          <div className="stats-info">
            <h4>Total Registered</h4>
            <div className="stats-value">{stats?.totalUsers || 0}</div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-icon-wrap" style={{ background: "var(--success-bg)", color: "var(--success)" }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="stats-info">
            <h4>Verified Accounts</h4>
            <div className="stats-value">{stats?.verifiedUsers || 0}</div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-icon-wrap" style={{ background: "var(--warning-bg)", color: "var(--warning)" }}>
            <AlertTriangle size={24} />
          </div>
          <div className="stats-info">
            <h4>Unverified</h4>
            <div className="stats-value">{stats?.unverifiedUsers || 0}</div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-icon-wrap" style={{ background: "var(--success-bg)", color: "var(--success)" }}>
            <UserCheck size={24} />
          </div>
          <div className="stats-info">
            <h4>Active Users</h4>
            <div className="stats-value">{stats?.activeUsers || 0}</div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-icon-wrap" style={{ background: "var(--danger-bg)", color: "var(--danger)" }}>
            <UserX size={24} />
          </div>
          <div className="stats-info">
            <h4>Suspended</h4>
            <div className="stats-value">{stats?.suspendedUsers || 0}</div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-icon-wrap" style={{ background: "var(--accent-light)", color: "var(--accent-secondary)" }}>
            <ShieldCheck size={24} />
          </div>
          <div className="stats-info">
            <h4>Administrators</h4>
            <div className="stats-value">{stats?.adminUsers || 0}</div>
          </div>
        </div>
      </div>

      {/* Recent Registrations Table */}
      <div className="card" style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Recently Registered Users
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Latest registered accounts on the platform</p>
          </div>

          <Link to="/admin/users" style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--accent-primary)" }}>
            View All Users →
          </Link>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Email Status</th>
                <th>Account Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                    No users registered yet.
                  </td>
                </tr>
              ) : (
                recentUsers.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #4f46e5, #06b6d4)",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                          }}
                        >
                          {u.fullName ? u.fullName[0].toUpperCase() : "U"}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{u.fullName}</div>
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
                    <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
