import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { setCredentials } from "../features/auth/authSlice.js";
import { showToast } from "../features/ui/uiSlice.js";
import { authApi } from "../services/authApi.js";
import InputField from "../components/common/InputField.jsx";
import { Shield, User, Mail, Lock, AtSign } from "lucide-react";

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please provide a valid email address"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export default function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      username: "",
      password: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data) => authApi.register(data),
    onSuccess: (data) => {
      dispatch(
        setCredentials({
          user: data.user,
          accessToken: data.accessToken,
        })
      );
      dispatch(
        showToast({
          type: "success",
          message: "Registration successful! A verification code was sent to your email.",
        })
      );
      navigate("/verify-otp", { state: { email: data.user.email, fromRegister: true } });
    },
    onError: (error) => {
      dispatch(showToast({ type: "error", message: error.message || "Registration failed." }));
    },
  });

  const onSubmit = (data) => {
    registerMutation.mutate(data);
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
          <h2 className="auth-title">Create Your Account</h2>
          <p className="auth-subtitle">Fill in the details to get started</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <InputField
            icon={User}
            placeholder="Full Name"
            error={errors.fullName?.message}
            {...register("fullName")}
          />

          <InputField
            icon={Mail}
            type="email"
            placeholder="Email Address"
            error={errors.email?.message}
            {...register("email")}
          />

          <InputField
            icon={AtSign}
            placeholder="Username"
            error={errors.username?.message}
            {...register("username")}
          />

          <InputField
            icon={Lock}
            type="password"
            placeholder="Password (min. 8 characters)"
            error={errors.password?.message}
            {...register("password")}
          />

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", padding: "0.75rem", marginTop: "0.5rem" }}
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? "Creating Account..." : "Create Account"}
          </button>

          <div style={{ textAlign: "center", marginTop: "1.75rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ fontWeight: 600, color: "var(--accent-primary)" }}>
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
