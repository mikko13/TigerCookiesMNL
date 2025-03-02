import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminPayrollMain() {
  const [pendingPayrolls, setPendingPayrolls] = useState([]);

  // Auto-refresh payrolls every 5 seconds
  useEffect(() => {
    const fetchPayrolls = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/payroll/pending");
        setPendingPayrolls(res.data);
      } catch (error) {
        console.error("Error fetching pending payrolls:", error);
      }
    };

    fetchPayrolls();
    const interval = setInterval(fetchPayrolls, 5000);
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <div className="relative flex flex-col w-full h-full text-gray-700 shadow-md bg-clip-border">
      <h5 className="block font-sans text-md md:text-xl font-semibold text-blue-gray-900">
        Pending Payrolls
      </h5>
      <div className="overflow-x-auto max-h-[500px]">
        <table className="w-full text-left table-auto border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-4 border">Employee</th>
              <th className="p-4 border">Pay Period</th>
              <th className="p-4 border">Salary</th>
              <th className="p-4 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingPayrolls.length > 0 ? (
              pendingPayrolls.map((payroll) => (
                <tr key={payroll._id} className="border-b hover:bg-gray-50">
                  <td className="p-4 border">{payroll.employeeName || "No Name"}</td>
                  <td className="p-4 border">{payroll.payPeriod || "No Pay Period"}</td>
                  <td className="p-4 border">{payroll.salary || 0}</td>
                  <td className="p-4 border flex gap-2">
                    <button className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600">
                      Edit
                    </button>
                    <button className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600">
                      Publish
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center text-red-500 py-4">
                  No pending payrolls.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
