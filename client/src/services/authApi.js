import { apiClient } from "./apiClient.js";

export const authApi = {
  login: (credentials) =>
    apiClient("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  register: (userData) =>
    apiClient("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  logout: () =>
    apiClient("/api/auth/logout", {
      method: "POST",
    }),

  refreshToken: () =>
    apiClient("/api/auth/refresh-token", {
      method: "GET",
    }),

  requestPasswordReset: (email) =>
    apiClient("/api/auth/request-password-reset", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  verifyResetOTP: (email, otp) =>
    apiClient("/api/auth/verify-reset-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    }),

  resetPassword: (email, otp, newPassword) =>
    apiClient("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, otp, newPassword }),
    }),
};
