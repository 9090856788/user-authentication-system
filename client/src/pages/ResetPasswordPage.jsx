import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { showToast } from "../features/ui/uiSlice.js";
import { authApi } from "../services/authApi.js";
import InputField from "../components/common/InputField.jsx";
import { Shield, Lock, CheckCircle2 } from "lucide-react";

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmNewPassword: z.string().min(8, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

export default function ResetPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const email = location.state?.email || "";
  const otp = location.state?.otp || "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const resetMutation = useMutation({
    mutationFn: (data) => authApi.resetPassword(email, otp, data.newPassword),
    onSuccess: () => {
      setIsSuccess(true);
      dispatch(showToast({ type: "success", message: "Password updated successfully!" }));
    },
    onError: (error) => {
      dispatch(showToast({ type: "error", message: error.message || "Failed to reset password." }));
    },
  });

  const onSubmit = (data) => {
    if (!email || !otp) {
      dispatch(showToast({ type: "error", message: "Missing reset context. Please request a new code." }));
      navigate("/forgot-password");
      return;
    }
    resetMutation.mutate(data);
  };

  if (isSuccess) {
    return (
      <div style={{ padding: "3rem 1rem", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <div className="auth-card" style={{ textAlign: "center" }}>
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: "50%",
              background: "var(--success-bg)",
              color: "var(--success)",
              border: "3px solid var(--success-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem auto",
            }}
          >
            <CheckCircle2 size={42} />
          </div>

          <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--text-primary)" }}>
            Password Reset Successful!
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", margin: "0.75rem 0 2rem 0", lineHeight: 1.5 }}>
            Your password has been updated. You can now login with your new password.
          </p>

          <Link to="/login" className="btn btn-primary" style={{ width: "100%", padding: "0.75rem", fontSize: "0.95rem" }}>
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "3rem 1rem", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
      <div className="auth-card">
        <div className="auth-header">
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, fontSize: "1.25rem" }}>
            <div className="brand-icon-box" style={{ width: 34, height: 34 }}>
              <Shield size={18} />
            </div>
            <span>AuthApp</span>
          </div>
          <h2 className="auth-title">Reset Your Password</h2>
          <p className="auth-subtitle">Enter your new password</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <InputField
            icon={Lock}
            type="password"
            placeholder="New Password"
            error={errors.newPassword?.message}
            {...register("newPassword")}
          />

          <InputField
            icon={Lock}
            type="password"
            placeholder="Confirm New Password"
            error={errors.confirmNewPassword?.message}
            {...register("confirmNewPassword")}
          />

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", padding: "0.75rem", marginTop: "0.75rem" }}
            disabled={resetMutation.isPending}
          >
            {resetMutation.isPending ? "Resetting..." : "Reset Password"}
          </button>

          <div style={{ textAlign: "center", marginTop: "1.75rem" }}>
            <Link to="/login" style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
