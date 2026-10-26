import React from "react";
import { Link } from "react-router-dom";
import { Shield, Lock, Smartphone, Zap, CheckCircle2, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div style={{ padding: "3rem 1.5rem", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
      {/* Hero Section matching Screen 1 */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "3rem", alignItems: "center", padding: "2rem 0" }}>
        <div>
          <div className="badge badge-info" style={{ marginBottom: "1rem" }}>
            <Zap size={14} /> Production Ready System
          </div>
          <h1 style={{ fontSize: "2.8rem", fontWeight: 800, lineHeight: 1.15, color: "var(--text-primary)" }}>
            Secure <br />
            <span style={{ color: "var(--accent-primary)" }}>Authentication</span> <br />
            for Modern Apps
          </h1>
          <p style={{ marginTop: "1.25rem", color: "var(--text-secondary)", fontSize: "1.05rem", lineHeight: 1.6 }}>
            Sign up, login, and manage your profile with complete security. Fast, modern, and easy to use.
          </p>

          <div style={{ display: "flex", gap: "1rem", marginTop: "2rem", flexWrap: "wrap" }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: "0.85rem 1.75rem", fontSize: "1rem" }}>
              Get Started <ArrowRight size={18} />
            </Link>
            <a href="#features" className="btn btn-secondary" style={{ padding: "0.85rem 1.75rem", fontSize: "1rem" }}>
              Learn More
            </a>
          </div>

          {/* 3 badges under CTA matching Screen 1 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginTop: "3.5rem" }}>
            <div className="card" style={{ padding: "1rem", textAlign: "center" }}>
              <div style={{ display: "inline-flex", padding: "0.5rem", borderRadius: "8px", background: "var(--accent-light)", color: "var(--accent-primary)", marginBottom: "0.5rem" }}>
                <Shield size={20} />
              </div>
              <h4 style={{ fontSize: "0.9rem", fontWeight: 700 }}>Secure</h4>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>Your data is safe with us</p>
            </div>

            <div className="card" style={{ padding: "1rem", textAlign: "center" }}>
              <div style={{ display: "inline-flex", padding: "0.5rem", borderRadius: "8px", background: "var(--success-bg)", color: "var(--success)", marginBottom: "0.5rem" }}>
                <CheckCircle2 size={20} />
              </div>
              <h4 style={{ fontSize: "0.9rem", fontWeight: 700 }}>Easy to Use</h4>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>Simple and user friendly</p>
            </div>

            <div className="card" style={{ padding: "1rem", textAlign: "center" }}>
              <div style={{ display: "inline-flex", padding: "0.5rem", borderRadius: "8px", background: "var(--warning-bg)", color: "var(--warning)", marginBottom: "0.5rem" }}>
                <Smartphone size={20} />
              </div>
              <h4 style={{ fontSize: "0.9rem", fontWeight: 700 }}>Modern UI</h4>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>Beautiful & responsive</p>
            </div>
          </div>
        </div>

        {/* Hero Visual Mockup */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div
            style={{
              width: "100%",
              maxWidth: "380px",
              background: "var(--bg-surface)",
              borderRadius: "28px",
              padding: "1.75rem",
              border: "8px solid var(--border-subtle)",
              boxShadow: "var(--shadow-xl)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, fontSize: "1.1rem" }}>
                <div style={{ width: 28, height: 28, borderRadius: "6px", background: "var(--accent-primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Shield size={16} />
                </div>
                <span>AuthApp</span>
              </div>
              <span className="badge badge-success">Live API</span>
            </div>

            <div style={{ background: "var(--bg-surface-secondary)", padding: "1.25rem", borderRadius: "16px", textAlign: "center", marginBottom: "1.25rem" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #4f46e5, #06b6d4)", margin: "0 auto 0.75rem auto", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "1.5rem", fontWeight: 700 }}>
                JD
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>John Doe</h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>john@example.com</p>
              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginTop: "0.5rem" }}>
                <span className="badge badge-success">Verified</span>
                <span className="badge badge-info">Role: User</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 1rem", background: "var(--bg-surface-secondary)", borderRadius: "8px", fontSize: "0.85rem" }}>
                <span style={{ color: "var(--text-secondary)" }}>Access Token (JWT)</span>
                <span style={{ color: "var(--success)", fontWeight: 600 }}>Active (15m)</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 1rem", background: "var(--bg-surface-secondary)", borderRadius: "8px", fontSize: "0.85rem" }}>
                <span style={{ color: "var(--text-secondary)" }}>Refresh Token</span>
                <span style={{ color: "var(--accent-primary)", fontWeight: 600 }}>HttpOnly Cookie</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 1rem", background: "var(--bg-surface-secondary)", borderRadius: "8px", fontSize: "0.85rem" }}>
                <span style={{ color: "var(--text-secondary)" }}>Rate Limiting</span>
                <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>Enabled</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: "4rem 0", borderTop: "1px solid var(--border-subtle)" }}>
        <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 3rem auto" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 700 }}>Everything You Need for Secure Authentication</h2>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
            Engineered with industry-standard security principles, automated rate limiting, and an intuitive user interface.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
          <div className="card">
            <div style={{ width: 44, height: 44, borderRadius: "10px", background: "var(--accent-light)", color: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
              <Lock size={22} />
            </div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 600 }}>JWT Dual Token Architecture</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.5rem" }}>
              Short-lived 15-minute access tokens paired with secure, HttpOnly 7-day refresh cookies with rotation support.
            </p>
          </div>

          <div className="card">
            <div style={{ width: 44, height: 44, borderRadius: "10px", background: "var(--success-bg)", color: "var(--success)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
              <CheckCircle2 size={22} />
            </div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 600 }}>Email OTP Verification</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.5rem" }}>
              Cryptographically secure 6-digit codes sent via Nodemailer for account activation and password recovery.
            </p>
          </div>

          <div className="card">
            <div style={{ width: 44, height: 44, borderRadius: "10px", background: "var(--danger-bg)", color: "var(--danger)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
              <Shield size={22} />
            </div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 600 }}>Dedicated Admin Panel</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.5rem" }}>
              Comprehensive administrator tools for user management, role adjustments, account suspensions, and metrics.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
