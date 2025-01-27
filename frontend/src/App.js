import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/login-components/loginPage";
import ForgotPassword from "./components/forgot-password-components/forgotpasswordPage";
import ForgotPasswordOtp from "./components/forgot-password-components/forgotpasswordOTP";
import ForgotPasswordConfirm from "./components/forgot-password-components/forgotpasswordConfirm";
import EmployeeAttendanceOpenCam from "./components/employee-attendance-components/empAttendanceOpenCam";
import EmployeeAttendanceChkIn from "./components/employee-attendance-components/empAttendanceChkIn";
import EmployeeAttendanceSelShift from "./components/employee-attendance-components/empAttendanceSelShift";
import EmployeeAttendanceChkOut from "./components/employee-attendance-components/empAttendanceChkOut";
import EmployeeAttendanceReqOT from "./components/employee-attendance-components/empAttendanceReqOT";
import AdminManageAccount from "./components/admin-manage-account-components/adminManageAccount";
import CreateAccount from "./components/admin-create-account-components/adminCreateAccount";
import EmployeePayroll from "./components/employee-payroll-components/empPayroll";
import AdminPayroll from "./components/admin-payroll-components/adminPayroll";


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Employee Side */}
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/forgotpasswordotp" element={<ForgotPasswordOtp />} />
        <Route
          path="/forgotpasswordconfirm"
          element={<ForgotPasswordConfirm />}
        />
        <Route path="/opencam" element={<EmployeeAttendanceOpenCam />} />
        <Route path="/checkin" element={<EmployeeAttendanceChkIn />} />
        <Route path="/shift" element={<EmployeeAttendanceSelShift />} />
        <Route path="/checkout" element={<EmployeeAttendanceChkOut />} />
        <Route path="/requestovertime" element={<EmployeeAttendanceReqOT />} />
        <Route path="/payroll" element={<EmployeePayroll />} />

        {/* Admin Side */}
        <Route path="/manageemployeeaccounts" element={<AdminManageAccount />} />
        <Route path="/createaccount" element={<CreateAccount />} />
        <Route path="/adminpayroll" element={<AdminPayroll />} />
      </Routes>
    </Router>
  );
}
