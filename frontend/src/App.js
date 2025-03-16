import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/loginComponents/loginPage";
import ForgotPassword from "./components/forgotpasswordComponents/forgotpasswordPage";
import ForgotPasswordOtp from "./components/forgotpasswordComponents/forgotpasswordOTP";
import ForgotPasswordConfirm from "./components/forgotpasswordComponents/forgotpasswordConfirm";

import EmployeeAttendanceOpenCam from "./components/employeeComponents/employee-attendance-components/empAttendanceOpenCam";
import EmployeeAttendanceOpenCamCheckOut from "./components/employeeComponents/employee-attendance-components/empAttendanceOpenCamCheckOut";
import EmployeeAttendanceChkIn from "./components/employeeComponents/employee-attendance-components/empAttendanceChkIn";
import EmployeeAttendanceChkOut from "./components/employeeComponents/employee-attendance-components/empAttendanceChkOut";
import EmployeeAttendanceReqOT from "./components/employeeComponents/employee-attendance-components/empAttendanceReqOT";
import EmployeeManageAttendance from "./components/employeeComponents/employee-manage-attendance-components/employeeManageAttendance";
import EmployeePayroll from "./components/employeeComponents/employee-payroll-components/EmployeePayroll";
import EmployeeManageAccount from "./components/employeeComponents/employee-manage-account-components/employeeUpdateAccount";
import EmployeeManageAttendanceOT from "./components/employeeComponents/employee-manage-attendance-components/employeeManageAttendanceOt";

import AdminManageAccount from "./components/adminComponents/ManageAccountComponents/ManageAccount";
import AdminManageAdminAccount from "./components/adminComponents/ManageAdminAccountComponents/ManageAdminAccount";
import AdminCreateAccount from "./components/adminComponents/CreateAccountComponents/CreateAccount";
import AdminUpdateAccount from "./components/adminComponents/UpdateAccountComponents/UpdateAccount";
import AdminUpdateAdminAccount from "./components/adminComponents/UpdateAdminAccountComponents/UpdateAdminAccount";
import AdminManageAttendance from "./components/adminComponents/ManageAttendanceComponents/ManageAttendance";
import AdminCreateAttendance from "./components/adminComponents/CreateAttendanceComponents/CreateAttendance";
import AdminUpdateAttendance from "./components/adminComponents/UpdateAttendanceComponents/UpdateAttendance";
import AdminManagePayroll from "./components/adminComponents/ManagePayrollComponents/ManagePayroll";
import AdminCreatePayroll from "./components/adminComponents/CreatePayrollComponents/CreatePayroll";
import AdminUpdatePayroll from "./components/adminComponents/UpdatePayrollComponents/UpdatePayroll";
import AdminManageOvertime from "./components/adminComponents/ManageAttendanceComponents/ManageAttendanceOT";

import AdminProtectedRoute from "./components/AdminProtectedRoute";
import EmployeeProtectedRoute from "./components/EmployeeProtectedRoute";

import NotFound from "./components/NotFound";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/ForgotPassword" element={<ForgotPassword />} />
        <Route path="/ForgotPasswordOtp" element={<ForgotPasswordOtp />} />
        <Route
          path="/ForgotPasswordConfirm"
          element={<ForgotPasswordConfirm />}
        />

        {/* Employee Side */}
        <Route element={<EmployeeProtectedRoute />}>
          <Route path="/Opencam" element={<EmployeeAttendanceOpenCam />} />
          <Route
            path="/Opencamcheckout"
            element={<EmployeeAttendanceOpenCamCheckOut />}
          />
          <Route path="/Checkin" element={<EmployeeAttendanceChkIn />} />
          <Route path="/Checkout" element={<EmployeeAttendanceChkOut />} />
          <Route
            path="/Requestovertime"
            element={<EmployeeAttendanceReqOT />}
          />
          <Route
            path="/Overtimerecords"
            element={<EmployeeManageAttendanceOT />}
          />
          <Route
            path="/ManageAttendance"
            element={<EmployeeManageAttendance />}
          />
          <Route path="/ManageAccount" element={<EmployeeManageAccount />} />
          <Route path="/Payroll" element={<EmployeePayroll />} />
        </Route>

        {/* Admin Side */}
        <Route element={<AdminProtectedRoute />}>
          <Route
            path="/ManageEmployeeAccounts"
            element={<AdminManageAccount />}
          />
          <Route
            path="/ManageAdminAccounts"
            element={<AdminManageAdminAccount />}
          />
          <Route
            path="/CreateEmployeeAccount"
            element={<AdminCreateAccount />}
          />
          <Route
            path="/ModifyEmployeeAccount/:employeeId"
            element={<AdminUpdateAccount />}
          />
          <Route
            path="/ModifyAdminAccount/:adminId"
            element={<AdminUpdateAdminAccount />}
          />
          <Route
            path="/ManageEmployeeAttendance"
            element={<AdminManageAttendance />}
          />
          <Route path="/ManageOvertime" element={<AdminManageOvertime />} />
          <Route
            path="/CreateEmployeeAttendance"
            element={<AdminCreateAttendance />}
          />
          <Route
            path="/UpdateEmployeeAttendance/:employeeId"
            element={<AdminUpdateAttendance />}
          />
          <Route
            path="/ManageEmployeePayroll"
            element={<AdminManagePayroll />}
          />
          <Route
            path="/CreateEmployeePayroll"
            element={<AdminCreatePayroll />}
          />
          <Route
            path="/UpdateEmployeePayroll/:employeeId"
            element={<AdminUpdatePayroll />}
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
