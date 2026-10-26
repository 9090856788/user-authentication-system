import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { setCredentials } from "../features/auth/authSlice.js";
import { showToast } from "../features/ui/uiSlice.js";
import { authApi } from "../services/authApi.js";
import InputField from "../components/common/InputField.jsx";
import { Shield, User, Lock } from "lucide-react";

const loginSchema = z.object({
  emailOrUsername: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const redirectPath = location.state?.from?.pathname || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrUsername: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data) => authApi.login(data),
    onSuccess: (data) => {
      dispatch(
        setCredentials({
          user: data.user,
          accessToken: data.accessToken,
        })
      );
      dispatch(showToast({ type: "success", message: "Login successful." }));
      navigate(redirectPath, { replace: true });
    },
    onError: (error) => {
      dispatch(showToast({ type: "error", message: error.message || "Invalid credentials." }));
    },
  });

  const onSubmit = (data) => {
    loginMutation.mutate(data);
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
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Login to your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <InputField
            icon={User}
            placeholder="Enter your email or username"
            error={errors.emailOrUsername?.message}
            {...register("emailOrUsername")}
          />

          <InputField
            icon={Lock}
            type="password"
            placeholder="Enter your password"
            error={errors.password?.message}
            {...register("password")}
          />

          <div style={{ textAlign: "right", margin: "0.5rem 0 1.25rem 0" }}>
            <Link to="/forgot-password" style={{ fontSize: "0.85rem", color: "var(--accent-primary)" }}>
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", padding: "0.75rem" }}
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Logging in..." : "Login"}
          </button>

          <div style={{ textAlign: "center", marginTop: "1.75rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ fontWeight: 600, color: "var(--accent-primary)" }}>
              Sign Up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
