import React from "react";
import { createBrowserRouter } from "react-router-dom";
import PublicLayout from "../components/layout/PublicLayout.jsx";
import DashboardLayout from "../components/layout/DashboardLayout.jsx";
import { ProtectedRoute, AdminRoute, PublicOnlyRoute } from "../components/layout/RouteGuards.jsx";

import LandingPage from "../pages/LandingPage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import RegisterPage from "../pages/RegisterPage.jsx";
import VerifyOtpPage from "../pages/VerifyOtpPage.jsx";
import ForgotPasswordPage from "../pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "../pages/ResetPasswordPage.jsx";

import DashboardPage from "../pages/DashboardPage.jsx";
import ProfilePage from "../pages/ProfilePage.jsx";
import SettingsPage from "../pages/SettingsPage.jsx";

import AdminDashboardPage from "../pages/admin/AdminDashboardPage.jsx";
import AdminUsersPage from "../pages/admin/AdminUsersPage.jsx";
import AdminUserDetailPage from "../pages/admin/AdminUserDetailPage.jsx";

import NotFoundPage from "../pages/NotFoundPage.jsx";

export const router = createBrowserRouter([
  // Public Area
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/verify-otp", element: <VerifyOtpPage /> },

      // Public Only (redirects to dashboard if already authenticated)
      {
        element: <PublicOnlyRoute />,
        children: [
          { path: "/login", element: <LoginPage /> },
          { path: "/register", element: <RegisterPage /> },
          { path: "/forgot-password", element: <ForgotPasswordPage /> },
          { path: "/reset-password", element: <ResetPasswordPage /> },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },

  // Authenticated Dashboard Area
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/profile", element: <ProfilePage /> },
          { path: "/settings", element: <SettingsPage /> },

          // Admin Only Area
          {
            element: <AdminRoute />,
            children: [
              { path: "/admin", element: <AdminDashboardPage /> },
              { path: "/admin/users", element: <AdminUsersPage /> },
              { path: "/admin/users/:id", element: <AdminUserDetailPage /> },
            ],
          },
        ],
      },
    ],
  },
]);
