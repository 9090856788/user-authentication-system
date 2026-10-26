import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { showToast } from "../features/ui/uiSlice.js";
import { authApi } from "../services/authApi.js";
import InputField from "../components/common/InputField.jsx";
import { Shield, Mail, ArrowLeft } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const requestMutation = useMutation({
    mutationFn: (data) => authApi.requestPasswordReset(data.email),
    onSuccess: (_, variables) => {
      dispatch(
        showToast({
          type: "success",
          message: "Password reset OTP dispatched to your email.",
        })
      );
      navigate("/verify-otp", { state: { email: variables.email, isResetFlow: true } });
    },
    onError: (error) => {
      dispatch(showToast({ type: "error", message: error.message || "Failed to send reset code." }));
    },
  });

  const onSubmit = (data) => {
    requestMutation.mutate(data);
  };

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
          <h2 className="auth-title">Forgot Password</h2>
          <p className="auth-subtitle">Enter your email to receive a reset code</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <InputField
            icon={Mail}
            type="email"
            placeholder="Enter your email address"
            error={errors.email?.message}
            {...register("email")}
          />

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", padding: "0.75rem", marginTop: "0.75rem" }}
            disabled={requestMutation.isPending}
          >
            {requestMutation.isPending ? "Sending OTP..." : "Send OTP"}
          </button>

          <div style={{ textAlign: "center", marginTop: "1.75rem" }}>
            <Link
              to="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                fontSize: "0.875rem",
                color: "var(--text-muted)",
              }}
            >
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
