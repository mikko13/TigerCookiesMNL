import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/login-components/loginPage";
import ForgotPassword from "./components/forgot-password-components/forgotpasswordPage";
import ForgotPasswordOtp from "./components/forgot-password-components/forgotpasswordOTP";
import ForgotPasswordConfirm from "./components/forgot-password-components/forgotpasswordConfirm";
import EmployeeAttendanceOpenCam from "./components/employee-attendance-components/empAttendanceOpenCam";
import EmployeeAttendanceOpenCamCheckOut from "./components/employee-attendance-components/empAttendanceOpenCamCheckOut";
import EmployeeAttendanceChkIn from "./components/employee-attendance-components/empAttendanceChkIn";
import EmployeeAttendanceChkOut from "./components/employee-attendance-components/empAttendanceChkOut";
import EmployeeAttendanceReqOT from "./components/employee-attendance-components/empAttendanceReqOT";
import AdminManageAccount from "./components/admin-manage-account-components/adminManageAccount";
import CreateAccount from "./components/admin-create-account-components/adminCreateAccount";
import UpdateAccount from "./components/admin-update-account-components/adminUpdateAccount";
import EmployeePayroll from "./components/employee-payroll-components/empPayroll";
import AdminPayrollHistory from "./components/admin-payroll-history-components/adminPayroll";
import AdminPayroll from "./components/admin-payroll-components/adminPayrollMain";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Employee Side */}
        <Route path="/ForgotPassword" element={<ForgotPassword />} />
        <Route path="/ForgotPasswordOtp" element={<ForgotPasswordOtp />} />
        <Route
          path="/ForgotPasswordConfirm"
          element={<ForgotPasswordConfirm />}
        />
        <Route path="/Opencam" element={<EmployeeAttendanceOpenCam />} />
        <Route
          path="/Opencamcheckout"
          element={<EmployeeAttendanceOpenCamCheckOut />}
        />
        <Route path="/Checkin" element={<EmployeeAttendanceChkIn />} />
        <Route path="/Checkout" element={<EmployeeAttendanceChkOut />} />
        <Route path="/Requestovertime" element={<EmployeeAttendanceReqOT />} />
        <Route path="/Payroll" element={<EmployeePayroll />} />

        {/* Admin Side */}
        <Route
          path="/ManageEmployeeAccounts"
          element={<AdminManageAccount />}
        />
        <Route path="/CreateAccount" element={<CreateAccount />} />
        <Route path="/AdminPayroll" element={<AdminPayroll />} />
        <Route path="/AdminPayrollHistory" element={<AdminPayrollHistory />} />
        <Route path="/ModifyAccount/:employeeId" element={<UpdateAccount />} />
      </Routes>
    </Router>
  );
}
