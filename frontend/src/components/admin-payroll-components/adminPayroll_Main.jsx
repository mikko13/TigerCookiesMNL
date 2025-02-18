import { useState } from "react";
import useEmployees from "../admin-manage-account-components/fetchEmployees";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

export default function AdminPayrollMain() {
  const employees = useEmployees();
  const [searchQuery, setSearchQuery] = useState("");

  const handlePublishPayroll = async (employee) => {
    const { isConfirmed } = await Swal.fire({
      title: "Confirm Payroll Publishing",
      text: `Do you want to publish payroll for ${employee.firstName} ${employee.lastName}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, publish it!",
    });

    if (!isConfirmed) return;

    try {
      const currentDate = new Date();
      const payPeriod = currentDate.getDate() <= 15 ? "1-15" : "16-30";
      const monthYear = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`;
      const finalPayPeriod = `${monthYear} ${payPeriod}`;

      // Fetch employee attendance records
      const attendanceRes = await axios.get(`/api/empAttendance/${employee._id}`);
      const attendanceRecords = attendanceRes.data;
      
      if (!attendanceRecords.length) {
        Swal.fire("Error!", "No attendance records found for this employee.", "error");
        return;
      }

      let totalHours = 0;
      let startTime = null, endTime = null;

      attendanceRecords.forEach(({ checkInTime, checkOutTime }) => {
        if (!checkInTime || !checkOutTime) return;
        const checkIn = new Date(`1970-01-01T${checkInTime}`);
        const checkOut = new Date(`1970-01-01T${checkOutTime}`);
        totalHours += (checkOut - checkIn) / 3600000; // Convert ms to hours

        // Store first and last recorded times
        if (!startTime || checkIn < new Date(`1970-01-01T${startTime}`)) startTime = checkInTime;
        if (!endTime || checkOut > new Date(`1970-01-01T${endTime}`)) endTime = checkOutTime;
      });

      const salary = totalHours * employee.ratePerHour;

      const payrollData = {
        employeeId: employee._id, // Backend requires employeeId
        employeeName: `${employee.firstName} ${employee.lastName}`,
        payPeriod: finalPayPeriod,
        startTime: startTime || "00:00",
        endTime: endTime || "00:00",
        salary,
        holidayPay: 0,
        incentives: 0,
        totalDeduction: 0,
      };

      // Send payroll data to backend
      const response = await axios.post("/api/empPayrolls", payrollData);
      console.log("Payroll Response:", response.data);
      
      Swal.fire("Success!", "Payroll has been published.", "success");
    } catch (error) {
      console.error("Payroll Error:", error.response?.data || error.message);
      Swal.fire("Error!", "Failed to publish payroll.", "error");
    }
  };

  const filteredEmployees = employees.filter((employee) => {
    const lowerQuery = searchQuery.toLowerCase();
    return (
      employee.firstName.toLowerCase().includes(lowerQuery) ||
      employee.lastName.toLowerCase().includes(lowerQuery) ||
      employee.position.toLowerCase().includes(lowerQuery)
    );
  });

  return (
    <div className="relative flex flex-col w-full h-full text-gray-700 shadow-md bg-clip-border">
      <div className="relative mx-4 mt-4 overflow-hidden text-gray-700 bg-white rounded-none bg-clip-border">
        <div className="flex flex-col justify-between gap-8 mb-4 md:flex-row md:items-center">
          <h5 className="block font-sans text-md md:text-xl font-semibold text-blue-gray-900">
            Admin Payroll
          </h5>
          <input
            className="peer h-10 w-72 rounded border px-3 text-sm"
            placeholder="Search Employee"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto max-h-[500px]">
        <table className="w-full text-left table-auto">
          <thead>
            <tr>
              <th className="p-4 border-y bg-gray-100">First Name</th>
              <th className="p-4 border-y bg-gray-100">Last Name</th>
              <th className="p-4 border-y bg-gray-100">Position</th>
              <th className="p-4 border-y bg-gray-100">Rate per Hour</th>
              <th className="p-4 border-y bg-gray-100">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((employee) => (
              <tr key={employee._id}>
                <td className="p-4 border-b">{employee.firstName}</td>
                <td className="p-4 border-b">{employee.lastName}</td>
                <td className="p-4 border-b">{employee.position}</td>
                <td className="p-4 border-b">{employee.ratePerHour}</td>
                <td className="p-4 border-b">
                  <div className="flex gap-2">
                    <Link to={`/PayrollDetails/${employee._id}`} className="px-3 py-1 text-sm font-semibold text-white bg-blue-500 rounded hover:bg-blue-700">
                      View Payroll
                    </Link>
                    <button onClick={() => handlePublishPayroll(employee)} className="px-3 py-1 text-sm font-semibold text-white bg-green-500 rounded hover:bg-green-700">
                      Publish Payroll
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
