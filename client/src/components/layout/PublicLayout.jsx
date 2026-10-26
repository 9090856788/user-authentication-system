import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../common/Header.jsx";
import Toast from "../common/Toast.jsx";

export default function PublicLayout() {
  return (
    <div className="app-layout">
      <Header />
      <Toast />
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Outlet />
      </main>
    </div>
  );
}
