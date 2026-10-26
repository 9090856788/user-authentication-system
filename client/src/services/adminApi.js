import { apiClient } from "./apiClient.js";

export const adminApi = {
  getDashboardStats: () =>
    apiClient("/api/admin/dashboard/stats", {
      method: "GET",
    }),

  getUsers: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        query.append(key, val);
      }
    });
    return apiClient(`/api/admin/users?${query.toString()}`, {
      method: "GET",
    });
  },

  getUserById: (id) =>
    apiClient(`/api/admin/users/${id}`, {
      method: "GET",
    }),

  updateUser: (id, data) =>
    apiClient(`/api/admin/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  changeUserRole: (id, role) =>
    apiClient(`/api/admin/users/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),

  changeUserStatus: (id, status) =>
    apiClient(`/api/admin/users/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  deleteUser: (id) =>
    apiClient(`/api/admin/users/${id}`, {
      method: "DELETE",
    }),
};
