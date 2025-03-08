import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function AdminProtectedRoute() {
  // Retrieve the logged-in user from localStorage (or replace with your context/hook)
  const userData = JSON.parse(localStorage.getItem("user"));

  // If no user is logged in or the user isn't an admin, redirect to login page
  if (!userData || userData.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // Otherwise, render the nested routes
  return <Outlet />;
}
