import React from "react";

export function LoadingSpinner({ text = "Loading..." }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem 1rem", gap: "1rem" }}>
      <div
        style={{
          width: 36,
          height: 36,
          border: "3px solid var(--border-subtle)",
          borderTopColor: "var(--accent-primary)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>{text}</span>
    </div>
  );
}

export function SkeletonRow({ columns = 5 }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i}>
          <div
            style={{
              height: 18,
              background: "var(--bg-surface-secondary)",
              borderRadius: "4px",
              width: i === 0 ? "70%" : "50%",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
        </td>
      ))}
    </tr>
  );
}
