import React from "react";
import { Link } from "react-router-dom";
import { HelpCircle, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div style={{ textAlign: "center", padding: "5rem 1rem", minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: "var(--accent-light)",
          color: "var(--accent-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1.5rem",
        }}
      >
        <HelpCircle size={40} />
      </div>

      <h1 style={{ fontSize: "3rem", fontWeight: 800, color: "var(--text-primary)" }}>404</h1>
      <h2 style={{ fontSize: "1.35rem", fontWeight: 600, color: "var(--text-secondary)", marginTop: "0.25rem" }}>
        Page Not Found
      </h2>
      <p style={{ color: "var(--text-muted)", maxWidth: 420, margin: "0.75rem auto 2rem auto" }}>
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>

      <Link to="/" className="btn btn-primary" style={{ padding: "0.75rem 1.5rem" }}>
        <ArrowLeft size={18} /> Return to Home
      </Link>
    </div>
  );
}
