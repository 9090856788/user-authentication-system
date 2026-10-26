import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../common/Header.jsx";
import Sidebar from "../common/Sidebar.jsx";
import Toast from "../common/Toast.jsx";

export default function DashboardLayout() {
  return (
    <div className="app-layout">
      <Header />
      <Toast />
      <div className="dashboard-layout">
        <Sidebar />
        <main className="main-viewport">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
