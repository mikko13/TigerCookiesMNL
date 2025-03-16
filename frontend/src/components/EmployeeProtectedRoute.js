import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function EmployeeProtectedRoute() {
  // Retrieve the logged-in user from localStorage
  const userData = JSON.parse(localStorage.getItem("user"));

  // If no user is logged in or the user isn't an employee, redirect to login page
  if (!userData || userData.role !== "employee") {
    return <Navigate to="/" replace />;
  }

  // Otherwise, render the nested routes
  return <Outlet />;
}