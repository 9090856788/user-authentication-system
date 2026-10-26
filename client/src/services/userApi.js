import { apiClient } from "./apiClient.js";

export const userApi = {
  getMe: () =>
    apiClient("/api/user/me", {
      method: "GET",
    }),

  updateProfile: (data) =>
    apiClient("/api/user/update", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  changePassword: (data) =>
    apiClient("/api/user/change-password", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteAccount: (password) =>
    apiClient("/api/user/delete", {
      method: "DELETE",
      body: JSON.stringify({ password }),
    }),

  sendVerificationOTP: () =>
    apiClient("/api/user/send-otp", {
      method: "GET",
    }),

  verifyAccountOTP: (otp) =>
    apiClient("/api/user/verify-otp", {
      method: "POST",
      body: JSON.stringify({ otp }),
    }),
};
