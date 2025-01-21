import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/login-components/loginPage";
import ForgotPassword from "./components/forgot-password-components/forgotpasswordPage";
import ForgotPasswordOtp from "./components/forgot-password-components/forgotpasswordOTP";
import ForgotPasswordConfirm from "./components/forgot-password-components/forgotpasswordConfirm";
import EmployeeAttendance from "./components/employee-attendance-components/empAttendance";
import EmpAttendanceReqOT from "./components/employee-attendance-components/empAttendanceReqOT";
import EmployeePayroll from "./components/payroll-employee-components/payrollemployeePage";
import AdminManageAccount from "./components/admin-manage-account-components/adminManageAccount";
import CreateAccount from "./components/admin-create-account-components/adminCreateAccount";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/forgotpasswordotp" element={<ForgotPasswordOtp />} />
        <Route
          path="/forgotpasswordconfirm"
          element={<ForgotPasswordConfirm />}
        />
        <Route path="/attendance" element={<EmployeeAttendance />} />
        <Route path="/requestovertime" element={<EmpAttendanceReqOT />} />
        <Route path="/payroll" element={<EmployeePayroll />} />

        {/* Admin Side */}
        <Route path="/adminmanageaccount" element={<AdminManageAccount />} />
        <Route path="/createaccount" element={<CreateAccount />} />
      </Routes>
    </Router>
  );
}
