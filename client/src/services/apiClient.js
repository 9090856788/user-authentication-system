import { store } from "../app/store.js";
import { setCredentials, logout } from "../features/auth/authSlice.js";

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const apiClient = async (endpoint, options = {}) => {
  const state = store.getState();
  const token = state.auth?.accessToken;

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
    credentials: "include",
  };

  let response;
  try {
    response = await fetch(endpoint, config);
  } catch (networkError) {
    throw new Error(networkError.message || "Network connection failure");
  }

  // Handle 401 Unauthorized for token refresh (avoid infinite loops for auth routes)
  if (response.status === 401 && !endpoint.includes("/api/auth/login") && !endpoint.includes("/api/auth/refresh-token")) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          config.headers["Authorization"] = `Bearer ${newToken}`;
          return fetch(endpoint, config).then(handleResponse);
        })
        .catch((err) => Promise.reject(err));
    }

    isRefreshing = true;

    try {
      const refreshRes = await fetch("/api/auth/refresh-token", {
        method: "GET",
        credentials: "include",
      });

      if (!refreshRes.ok) {
        throw new Error("Session expired. Please log in again.");
      }

      const refreshData = await refreshRes.json();
      const newAccessToken = refreshData.accessToken;

      store.dispatch(setCredentials({ accessToken: newAccessToken, user: refreshData.user }));
      processQueue(null, newAccessToken);

      config.headers["Authorization"] = `Bearer ${newAccessToken}`;
      return fetch(endpoint, config).then(handleResponse);
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      store.dispatch(logout());
      throw refreshErr;
    } finally {
      isRefreshing = false;
    }
  }

  return handleResponse(response);
};

const handleResponse = async (response) => {
  let data;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const error = new Error(data?.message || (typeof data === "string" ? data : "Request failed"));
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};
