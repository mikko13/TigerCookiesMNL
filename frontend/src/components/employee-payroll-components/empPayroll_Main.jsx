import { useState, useEffect } from "react";
import axios from "axios";

export default function EmployeePayroll() {
  const [payrolls, setPayrolls] = useState([]);
  const token = localStorage.getItem("token"); // Get the JWT token

  useEffect(() => {
    if (!token) {
      console.error("User not authenticated. Please log in.");
      return;
    }

    fetchPayrolls();
  }, []);

  const fetchPayrolls = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/payroll/employee", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Fetched Employee Payrolls:", res.data);
      setPayrolls(res.data.filter((payroll) => payroll.isPublished));
    } catch (error) {
      console.error("Error fetching payrolls:", error.response?.data?.message || error);
    }
  };

  return (
    <div className="flex flex-col w-full h-full text-gray-700">
      <div className="overflow-x-auto max-h-[400px]">
        <table className="w-full text-left border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-4 border">Pay Period</th>
              <th className="p-4 border">Salary</th>
            </tr>
          </thead>
          <tbody>
            {payrolls.length > 0 ? (
              payrolls.map((payroll) => (
                <tr key={payroll._id} className="border-b hover:bg-gray-50">
                  <td className="p-4 border">{payroll.payPeriod || "No Pay Period"}</td>
                  <td className="p-4 border">{payroll.salary || 0}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="text-center text-gray-500 py-4">
                  No payroll records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
