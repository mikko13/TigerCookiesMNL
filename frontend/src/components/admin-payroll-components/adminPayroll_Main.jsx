import { useState, useEffect } from "react";
import PayrollDetailsModal from "./PayrollDetailsModal"; // Import the modal component

export default function AdminPayrollMain() {
  const [payrollData, setPayrollData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPayroll, setSelectedPayroll] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/payroll")
      .then((response) => response.json())
      .then((data) => setPayrollData(data))
      .catch((err) => console.error("Error fetching payroll data:", err));
  }, []);

  const filteredPayrollData = payrollData.filter((payroll) =>
    payroll.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative flex flex-col w-full h-full text-gray-700 shadow-md bg-clip-border">
      {/* HEADER */}
      <div className="relative mx-4 mt-4 overflow-hidden text-gray-700 bg-white rounded-none bg-clip-border">
        <div className="flex flex-col justify-between gap-8 mb-4 md:flex-row md:items-center">
          <h5 className="block font-sans text-md md:text-xl font-semibold text-blue-gray-900">
            Payroll History
          </h5>
          <div className="w-full md:w-72">
            <input
              className="peer h-10 w-full rounded-[7px] border border-blue-gray-200 px-3 py-2.5 pr-9 font-sans text-sm"
              placeholder="Search by employee name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto max-h-[500px]">
        <table className="w-full text-left table-auto min-w-max">
          <thead>
            <tr>
              <th className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50">Employee</th>
              <th className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50">Hours Worked</th>
              <th className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50">Salary</th>
              <th className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50">Pay Period</th>
              <th className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayrollData.map((payroll) => (
              <tr key={payroll._id}>
                <td className="p-4 border-b border-blue-gray-50">{payroll.employeeName}</td>
                <td className="p-4 border-b border-blue-gray-50">{payroll.hoursWorked} hrs</td>
                <td className="p-4 border-b border-blue-gray-50">₱{payroll.salary.toFixed(2)}</td>
                <td className="p-4 border-b border-blue-gray-50">{payroll.payPeriod}</td>
                <td className="p-4 border-b border-blue-gray-50">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedPayroll(payroll)}
                      className="px-3 py-1 text-sm font-semibold text-white bg-yellow-500 rounded hover:bg-yellow-700"
                    >
                      Details
                    </button>
                    <button className="px-3 py-1 text-sm font-semibold text-white bg-yellow-500 rounded hover:bg-yellow-700">
                      Edit
                    </button>
                    <button className="px-3 py-1 text-sm font-semibold text-white bg-yellow-500 rounded hover:bg-yellow-700">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Render Payroll Details Modal */}
      <PayrollDetailsModal payroll={selectedPayroll} onClose={() => setSelectedPayroll(null)} />
    </div>
  );
}
