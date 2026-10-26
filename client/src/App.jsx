import React, { useState, useEffect } from "react";
import "./App.css";

const API_BASE = "";

export default function App() {
  const [activeTab, setActiveTab] = useState("login");
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("auth_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [accessToken, setAccessToken] = useState(() => {
    return localStorage.getItem("auth_token") || "";
  });

  const [alert, setAlert] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  // Form states
  const [loginForm, setLoginForm] = useState({ emailOrUsername: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
  });
  const [otpVerifyForm, setOtpVerifyForm] = useState({ otp: "" });
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotForm, setForgotForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Profile Edit State
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    phoneNumber: "",
    bio: "",
    gender: "other",
  });

  // API Tester State
  const [apiEndpoint, setApiEndpoint] = useState("/api/health");
  const [apiMethod, setApiMethod] = useState("GET");
  const [apiPayload, setApiPayload] = useState("{}");
  const [apiResponse, setApiResponse] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || "",
        phoneNumber: user.phoneNumber || "",
        bio: user.bio || "",
        gender: user.gender || "other",
      });
      if (activeTab === "login" || activeTab === "register") {
        setActiveTab("dashboard");
      }
    }
  }, [user]);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert({ type: "", message: "" });
    }, 6000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ type: "", message: "" });
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to login");
      }
      setUser(data.user);
      setAccessToken(data.accessToken);
      localStorage.setItem("auth_user", JSON.stringify(data.user));
      localStorage.setItem("auth_token", data.accessToken);
      showAlert("success", "Logged in successfully!");
      setActiveTab("dashboard");
    } catch (err) {
      showAlert("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ type: "", message: "" });
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(registerForm),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }
      setUser(data.user);
      setAccessToken(data.accessToken);
      localStorage.setItem("auth_user", JSON.stringify(data.user));
      localStorage.setItem("auth_token", data.accessToken);
      showAlert("success", data.message || "Registered successfully!");
      setActiveTab("verify");
    } catch (err) {
      showAlert("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.warn("Logout request failed:", err);
    } finally {
      setUser(null);
      setAccessToken("");
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_token");
      showAlert("info", "Logged out successfully.");
      setActiveTab("login");
    }
  };

  const handleRefreshToken = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/refresh-token`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Refresh token failed or expired");
      }
      setAccessToken(data.accessToken);
      localStorage.setItem("auth_token", data.accessToken);
      if (data.user) {
        setUser((prev) => ({ ...prev, ...data.user }));
      }
      showAlert("success", "Access token successfully refreshed!");
    } catch (err) {
      showAlert("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendVerificationOTP = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/user/send-otp`, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP");
      showAlert("success", "Verification code sent to your registered email!");
      setActiveTab("verify");
    } catch (err) {
      showAlert("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/user/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify({ otp: otpVerifyForm.otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Verification failed");
      const updatedUser = { ...user, accountVerified: true };
      setUser(updatedUser);
      localStorage.setItem("auth_user", JSON.stringify(updatedUser));
      showAlert("success", "Account verified successfully!");
      setActiveTab("dashboard");
    } catch (err) {
      showAlert("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/request-password-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotForm.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Request failed");
      showAlert("success", data.message);
      setForgotStep(2);
    } catch (err) {
      showAlert("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-reset-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotForm.email,
          otp: forgotForm.otp,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid OTP code");
      showAlert("success", data.message);
      setForgotStep(3);
    } catch (err) {
      showAlert("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotReset = async (e) => {
    e.preventDefault();
    if (forgotForm.newPassword !== forgotForm.confirmPassword) {
      showAlert("error", "Passwords do not match!");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotForm.email,
          otp: forgotForm.otp,
          newPassword: forgotForm.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reset failed");
      showAlert("success", data.message);
      setForgotStep(1);
      setForgotForm({ email: "", otp: "", newPassword: "", confirmPassword: "" });
      setActiveTab("login");
    } catch (err) {
      showAlert("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/user/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
      const updated = { ...user, ...data.user };
      setUser(updated);
      localStorage.setItem("auth_user", JSON.stringify(updated));
      showAlert("success", "Profile updated successfully!");
    } catch (err) {
      showAlert("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Permanently delete your account? This action cannot be undone.")) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/user/delete`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete account");
      setUser(null);
      setAccessToken("");
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_token");
      showAlert("info", "Your account has been deleted.");
      setActiveTab("register");
    } catch (err) {
      showAlert("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const runApiTest = async () => {
    setLoading(true);
    setApiResponse(null);
    try {
      const options = {
        method: apiMethod,
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        credentials: "include",
      };
      if (apiMethod !== "GET") {
        options.body = apiPayload;
      }
      const start = performance.now();
      const res = await fetch(apiEndpoint, options);
      const timeMs = Math.round(performance.now() - start);
      let bodyData;
      try {
        bodyData = await res.json();
      } catch {
        bodyData = await res.text();
      }
      setApiResponse({
        status: res.status,
        statusText: res.statusText,
        time: `${timeMs}ms`,
        body: bodyData,
      });
    } catch (err) {
      setApiResponse({
        error: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-brand">
          <div className="logo-badge">🛡️</div>
          <div className="brand-text">
            <h1>User Authentication System</h1>
            <p>JWT Auth • Nodemailer OTP • Rate Limiting • Swagger Docs</p>
          </div>
        </div>

        <nav className="nav-tabs">
          {user ? (
            <>
              <button
                className={`nav-tab ${activeTab === "dashboard" ? "active" : ""}`}
                onClick={() => setActiveTab("dashboard")}
              >
                Profile & Dashboard
              </button>
              <button
                className={`nav-tab ${activeTab === "verify" ? "active" : ""}`}
                onClick={() => setActiveTab("verify")}
              >
                OTP Verification
              </button>
            </>
          ) : (
            <>
              <button
                className={`nav-tab ${activeTab === "login" ? "active" : ""}`}
                onClick={() => setActiveTab("login")}
              >
                Sign In
              </button>
              <button
                className={`nav-tab ${activeTab === "register" ? "active" : ""}`}
                onClick={() => setActiveTab("register")}
              >
                Create Account
              </button>
              <button
                className={`nav-tab ${activeTab === "forgot" ? "active" : ""}`}
                onClick={() => setActiveTab("forgot")}
              >
                Forgot Password
              </button>
            </>
          )}
          <button
            className={`nav-tab ${activeTab === "tester" ? "active" : ""}`}
            onClick={() => setActiveTab("tester")}
          >
            API Console
          </button>
          <a
            href="/api/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-tab"
            style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}
          >
            Swagger Docs ↗
          </a>
          {user && (
            <button className="nav-tab" style={{ color: "#ef4444" }} onClick={handleLogout}>
              Logout
            </button>
          )}
        </nav>
      </header>

      {alert.message && (
        <div className={`alert alert-${alert.type}`}>
          <span>{alert.type === "success" ? "✅" : alert.type === "error" ? "⚠️" : "ℹ️"}</span>
          <span>{alert.message}</span>
        </div>
      )}

      <main className="main-content">
        {activeTab === "login" && (
          <div className="card" style={{ maxWidth: 480, margin: "0 auto" }}>
            <h2 className="card-title">Sign In to Your Account</h2>
            <p className="card-desc">Enter your email or username to access your profile</p>

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Email or Username</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="alice or alice@example.com"
                  value={loginForm.emailOrUsername}
                  onChange={(e) => setLoginForm({ ...loginForm, emailOrUsername: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  required
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "1rem 0" }}>
                <button
                  type="button"
                  style={{ background: "none", border: "none", color: "#38bdf8", fontSize: "0.825rem", cursor: "pointer" }}
                  onClick={() => setActiveTab("forgot")}
                >
                  Forgot your password?
                </button>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
                {loading ? "Authenticating..." : "Sign In"}
              </button>

              <div style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.85rem", color: "#94a3b8" }}>
                Don't have an account?{" "}
                <button
                  type="button"
                  style={{ background: "none", border: "none", color: "#38bdf8", cursor: "pointer", fontWeight: 600 }}
                  onClick={() => setActiveTab("register")}
                >
                  Create one now
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "register" && (
          <div className="card" style={{ maxWidth: 540, margin: "0 auto" }}>
            <h2 className="card-title">Create New Account</h2>
            <p className="card-desc">Register with your email, username, and password</p>

            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="Alice Johnson"
                  value={registerForm.fullName}
                  onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="alice_dev"
                    value={registerForm.username}
                    onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number (optional)</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+1234567890"
                    value={registerForm.phoneNumber}
                    onChange={(e) => setRegisterForm({ ...registerForm, phoneNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address (for verification OTP)</label>
                <input
                  type="email"
                  className="form-input"
                  required
                  placeholder="alice@example.com"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password (min. 8 characters)</label>
                <input
                  type="password"
                  className="form-input"
                  required
                  minLength={8}
                  placeholder="••••••••"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }} disabled={loading}>
                {loading ? "Registering..." : "Create Account & Get Email OTP"}
              </button>

              <div style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.85rem", color: "#94a3b8" }}>
                Already registered?{" "}
                <button
                  type="button"
                  style={{ background: "none", border: "none", color: "#38bdf8", cursor: "pointer", fontWeight: 600 }}
                  onClick={() => setActiveTab("login")}
                >
                  Sign In
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "verify" && (
          <div className="card" style={{ maxWidth: 480, margin: "0 auto" }}>
            <h2 className="card-title">Email OTP Verification</h2>
            <p className="card-desc">
              Enter the 6-digit verification code delivered to your registered email.
            </p>

            {user?.accountVerified ? (
              <div className="alert alert-success">
                <span>✅</span>
                <span>Your account is fully verified.</span>
              </div>
            ) : (
              <form onSubmit={handleVerifyOTP}>
                <div className="form-group">
                  <label className="form-label">6-Digit Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    className="form-input"
                    style={{ fontSize: "1.25rem", letterSpacing: "4px", textAlign: "center" }}
                    placeholder="123456"
                    required
                    value={otpVerifyForm.otp}
                    onChange={(e) => setOtpVerifyForm({ otp: e.target.value })}
                  />
                </div>

                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                    {loading ? "Verifying..." : "Verify Code"}
                  </button>
                  {accessToken && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleSendVerificationOTP}
                      disabled={loading}
                    >
                      Resend Email Code
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        )}

        {activeTab === "forgot" && (
          <div className="card" style={{ maxWidth: 500, margin: "0 auto" }}>
            <h2 className="card-title">Reset Your Password</h2>
            <p className="card-desc">Email-based verification for account recovery</p>

            <div className="step-indicator">
              <div className={`step-pill ${forgotStep === 1 ? "active" : ""}`}>1. Send Code</div>
              <div className={`step-pill ${forgotStep === 2 ? "active" : ""}`}>2. Verify Code</div>
              <div className={`step-pill ${forgotStep === 3 ? "active" : ""}`}>3. New Password</div>
            </div>

            {forgotStep === 1 && (
              <form onSubmit={handleForgotRequest}>
                <div className="form-group">
                  <label className="form-label">Registered Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    required
                    placeholder="alice@example.com"
                    value={forgotForm.email}
                    onChange={(e) => setForgotForm({ ...forgotForm, email: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Code"}
                </button>
              </form>
            )}

            {forgotStep === 2 && (
              <form onSubmit={handleForgotVerify}>
                <div className="form-group">
                  <label className="form-label">Enter 6-Digit Email Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    className="form-input"
                    style={{ fontSize: "1.25rem", letterSpacing: "4px", textAlign: "center" }}
                    required
                    placeholder="123456"
                    value={forgotForm.otp}
                    onChange={(e) => setForgotForm({ ...forgotForm, otp: e.target.value })}
                  />
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setForgotStep(1)}>
                    Back
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                    {loading ? "Verifying..." : "Confirm Code"}
                  </button>
                </div>
              </form>
            )}

            {forgotStep === 3 && (
              <form onSubmit={handleForgotReset}>
                <div className="form-group">
                  <label className="form-label">New Password (min. 8 characters)</label>
                  <input
                    type="password"
                    className="form-input"
                    required
                    minLength={8}
                    placeholder="••••••••"
                    value={forgotForm.newPassword}
                    onChange={(e) => setForgotForm({ ...forgotForm, newPassword: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    required
                    minLength={8}
                    placeholder="••••••••"
                    value={forgotForm.confirmPassword}
                    onChange={(e) => setForgotForm({ ...forgotForm, confirmPassword: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn btn-success" style={{ width: "100%" }} disabled={loading}>
                  {loading ? "Updating..." : "Set New Password"}
                </button>
              </form>
            )}
          </div>
        )}

        {activeTab === "dashboard" && user && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div className="card">
              <div className="profile-header">
                <div className="profile-user-info">
                  <div className="avatar-placeholder">{user.fullName ? user.fullName[0].toUpperCase() : "U"}</div>
                  <div>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>{user.fullName}</h2>
                    <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>@{user.username} • {user.email}</p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                  <span className={`badge ${user.accountVerified ? "badge-success" : "badge-warning"}`}>
                    {user.accountVerified ? "Verified Account" : "Unverified"}
                  </span>
                  <span className="badge badge-primary">
                    Role: {user.role || "user"}
                  </span>
                  {!user.accountVerified && (
                    <button className="btn btn-secondary" style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem" }} onClick={handleSendVerificationOTP}>
                      Verify via Email
                    </button>
                  )}
                </div>
              </div>

              <div style={{ background: "#0f172a", padding: "1rem", borderRadius: "8px", border: "1px solid #334155", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.825rem", fontWeight: 600, color: "#cbd5e1" }}>
                    Active JWT Access Token (Expires in 15m)
                  </span>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: "0.25rem 0.65rem", fontSize: "0.75rem" }}
                    onClick={handleRefreshToken}
                    disabled={loading}
                  >
                    Refresh Token (HttpOnly Cookie)
                  </button>
                </div>
                <div style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#38bdf8", wordBreak: "break-all" }}>
                  {accessToken || "No access token currently in memory"}
                </div>
              </div>

              <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>Edit Profile Information</h3>
              <form onSubmit={handleUpdateProfile}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profileForm.phoneNumber}
                      onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select
                      className="form-select"
                      value={profileForm.gender}
                      onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Bio</label>
                  <textarea
                    rows={3}
                    className="form-textarea"
                    placeholder="Tell us about yourself..."
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.5rem" }}>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Saving..." : "Save Profile Changes"}
                  </button>

                  <button
                    type="button"
                    className="btn btn-danger"
                    style={{ fontSize: "0.8rem", padding: "0.45rem 0.85rem" }}
                    onClick={handleDeleteAccount}
                    disabled={loading}
                  >
                    Delete Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === "tester" && (
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <h2 className="card-title" style={{ margin: 0 }}>Live API Console</h2>
              <a href="/api/docs" target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ fontSize: "0.8rem", padding: "0.4rem 0.75rem" }}>
                Open Swagger UI ↗
              </a>
            </div>
            <p className="card-desc">
              Test and inspect responses for all backend authentication and user management endpoints.
            </p>

            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
              <select
                className="form-select"
                style={{ width: "110px" }}
                value={apiMethod}
                onChange={(e) => setApiMethod(e.target.value)}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>

              <input
                type="text"
                className="form-input"
                style={{ flex: 1, minWidth: "240px" }}
                value={apiEndpoint}
                onChange={(e) => setApiEndpoint(e.target.value)}
              />

              <button className="btn btn-primary" onClick={runApiTest} disabled={loading}>
                {loading ? "Running..." : "Send Request"}
              </button>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
              <span style={{ fontSize: "0.75rem", color: "#64748b", alignSelf: "center" }}>Presets:</span>
              <button
                className="btn btn-secondary"
                style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                onClick={() => {
                  setApiMethod("GET");
                  setApiEndpoint("/api/health");
                  setApiPayload("{}");
                }}
              >
                GET /api/health
              </button>
              <button
                className="btn btn-secondary"
                style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                onClick={() => {
                  setApiMethod("POST");
                  setApiEndpoint("/api/auth/login");
                  setApiPayload(JSON.stringify({ emailOrUsername: "testuser", password: "password123" }, null, 2));
                }}
              >
                POST /api/auth/login
              </button>
              <button
                className="btn btn-secondary"
                style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                onClick={() => {
                  setApiMethod("GET");
                  setApiEndpoint("/api/auth/refresh-token");
                  setApiPayload("{}");
                }}
              >
                GET /api/auth/refresh-token
              </button>
              <button
                className="btn btn-secondary"
                style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                onClick={() => {
                  setApiMethod("GET");
                  setApiEndpoint("/api/user/send-otp");
                  setApiPayload("{}");
                }}
              >
                GET /api/user/send-otp
              </button>
            </div>

            {apiMethod !== "GET" && (
              <div className="form-group">
                <label className="form-label">Request Body (JSON)</label>
                <textarea
                  rows={4}
                  className="form-textarea"
                  style={{ fontFamily: "monospace", fontSize: "0.85rem" }}
                  value={apiPayload}
                  onChange={(e) => setApiPayload(e.target.value)}
                />
              </div>
            )}

            {apiResponse && (
              <div style={{ marginTop: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Response</span>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {apiResponse.status && (
                      <span className={`badge ${apiResponse.status >= 200 && apiResponse.status < 300 ? "badge-success" : "badge-warning"}`}>
                        HTTP {apiResponse.status} {apiResponse.statusText}
                      </span>
                    )}
                    {apiResponse.time && <span className="badge badge-primary">{apiResponse.time}</span>}
                  </div>
                </div>
                <pre className="json-display">
                  {JSON.stringify(apiResponse.body || apiResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}