import React from "react";
import { Shield, ShieldAlert, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

export default function StatusBadge({ type, value }) {
  if (type === "role") {
    const isAdmin = value === "admin";
    return (
      <span className={`badge ${isAdmin ? "badge-info" : "badge-neutral"}`}>
        {isAdmin ? <Shield size={12} /> : <ShieldAlert size={12} />}
        {isAdmin ? "Admin" : "User"}
      </span>
    );
  }

  if (type === "verified") {
    const isVerified = Boolean(value);
    return (
      <span className={`badge ${isVerified ? "badge-success" : "badge-warning"}`}>
        {isVerified ? <CheckCircle2 size={12} /> : <Clock size={12} />}
        {isVerified ? "Verified" : "Pending"}
      </span>
    );
  }

  if (type === "status") {
    const isSuspended = value === "suspended";
    const isActive = value === "active";
    return (
      <span className={`badge ${isSuspended ? "badge-danger" : isActive ? "badge-success" : "badge-neutral"}`}>
        {isSuspended && <AlertTriangle size={12} />}
        {value ? value.charAt(0).toUpperCase() + value.slice(1) : "Unknown"}
      </span>
    );
  }

  return <span className="badge badge-neutral">{value}</span>;
}
