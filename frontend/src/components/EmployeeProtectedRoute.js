import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function EmployeeProtectedRoute() {
  const userData = JSON.parse(localStorage.getItem("user"));

  if (!userData || userData.role !== "employee") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}