import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../features/auth/authSlice.js";
import { showToast } from "../features/ui/uiSlice.js";
import { userApi } from "../services/userApi.js";
import { authApi } from "../services/authApi.js";
import { Shield } from "lucide-react";

export default function VerifyOtpPage() {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const currentUser = useSelector((state) => state.auth.user);
  const isResetFlow = location.state?.isResetFlow || false;
  const targetEmail = location.state?.email || currentUser?.email || "your email";

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleDigitChange = (index, value) => {
    // Only accept numeric inputs
    const char = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);

    // Auto-advance to next input if filled
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || "";
    }
    setDigits(newDigits);
    const nextFocus = Math.min(pasted.length, 5);
    inputRefs.current[nextFocus]?.focus();
  };

  const otpCode = digits.join("");

  // Verification Mutation
  const verifyMutation = useMutation({
    mutationFn: () => {
      if (isResetFlow) {
        return authApi.verifyResetOTP(targetEmail, otpCode);
      }
      return userApi.verifyAccountOTP(otpCode);
    },
    onSuccess: (data) => {
      if (isResetFlow) {
        dispatch(showToast({ type: "success", message: "OTP code verified! Please set your new password." }));
        navigate("/reset-password", { state: { email: targetEmail, otp: otpCode } });
      } else {
        dispatch(updateUser({ accountVerified: true }));
        dispatch(showToast({ type: "success", message: "Account verified successfully!" }));
        navigate("/dashboard");
      }
    },
    onError: (error) => {
      dispatch(showToast({ type: "error", message: error.message || "Invalid or expired OTP code." }));
    },
  });

  // Resend Mutation
  const resendMutation = useMutation({
    mutationFn: () => {
      if (isResetFlow) {
        return authApi.requestPasswordReset(targetEmail);
      }
      return userApi.sendVerificationOTP();
    },
    onSuccess: () => {
      setTimer(45);
      dispatch(showToast({ type: "success", message: "A new 6-digit verification code has been dispatched." }));
    },
    onError: (error) => {
      dispatch(showToast({ type: "error", message: error.message || "Failed to resend code." }));
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (otpCode.length < 6) {
      dispatch(showToast({ type: "error", message: "Please enter all 6 digits of the code." }));
      return;
    }
    verifyMutation.mutate();
  };

  return (
    <div style={{ padding: "3rem 1rem", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
      <div className="auth-card" style={{ maxWidth: 460 }}>
        <div className="auth-header">
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, fontSize: "1.25rem" }}>
            <div className="brand-icon-box" style={{ width: 34, height: 34 }}>
              <Shield size={18} />
            </div>
            <span>AuthApp</span>
          </div>
          <h2 className="auth-title">{isResetFlow ? "Verify OTP" : "Verify Your Email"}</h2>
          <p className="auth-subtitle">
            We have sent a 6-digit code to <br />
            <strong style={{ color: "var(--text-primary)" }}>{targetEmail}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="otp-container" onPaste={handlePaste}>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className="otp-box"
                value={digit}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                autoFocus={i === 0}
              />
            ))}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", padding: "0.75rem", marginTop: "1rem" }}
            disabled={verifyMutation.isPending || otpCode.length < 6}
          >
            {verifyMutation.isPending ? "Verifying..." : "Verify OTP"}
          </button>

          <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
            Didn't receive the code?{" "}
            {timer > 0 ? (
              <span style={{ color: "var(--accent-primary)", fontWeight: 600 }}>
                Resend ({timer < 10 ? `00:0${timer}` : `00:${timer}`})
              </span>
            ) : (
              <button
                type="button"
                onClick={() => resendMutation.mutate()}
                disabled={resendMutation.isPending}
                style={{ background: "none", border: "none", color: "var(--accent-primary)", fontWeight: 600, cursor: "pointer" }}
              >
                {resendMutation.isPending ? "Sending..." : "Resend Now"}
              </button>
            )}
          </div>

          <div style={{ textAlign: "center", marginTop: "1.25rem" }}>
            <Link to={isResetFlow ? "/login" : "/dashboard"} style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              {isResetFlow ? "Back to Login" : "Skip to Dashboard"}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
