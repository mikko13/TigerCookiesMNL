import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/login-components/loginPage";
import ForgotPassword from "./components/forgot-password-components/forgotpasswordPage";
import ForgotPasswordOtp from "./components/forgot-password-components/forgotpasswordOTP";
import EmployeeAttendance from "./components/employee_attendance_components/empAttendance";


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/forgotpasswordotp" element={<ForgotPasswordOtp />} />
        <Route path="/attendance" element={<EmployeeAttendance />} />
      </Routes>
    </Router>
  );
}
