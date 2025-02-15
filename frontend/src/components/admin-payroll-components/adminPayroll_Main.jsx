import { useState } from "react";
import useEmployees from "../admin-manage-account-components/fetchEmployees";
import { Link } from "react-router-dom";

export default function AdminPayrollMain() {
  const employees = useEmployees();
  const [searchQuery, setSearchQuery] = useState("");

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
          <div>
            <h5 className="block font-sans text-md md:text-xl antialiased font-semibold leading-snug tracking-normal text-blue-gray-900">
              Admin Payroll
            </h5>
          </div>
          <div className="flex w-full gap-2 shrink-0 md:w-max">
            <div className="w-full md:w-72">
              <div className="relative h-10 w-full min-w-[200px]">
                <div className="absolute grid w-5 h-5 top-2/4 right-3 -translate-y-2/4 place-items-center text-blue-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    ></path>
                  </svg>
                </div>
                <input
                  className="peer h-full w-full rounded-[7px] border border-blue-gray-200 border-t-transparent bg-transparent px-3 py-2.5 !pr-9 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 focus:border-2 focus:border-gray-900 focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50"
                  placeholder="Search Employee"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div> 
          </div>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[500px]">
        <table className="w-full text-left table-auto min-w-max">
          <thead>
            <tr>
              <th className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50">First Name</th>
              <th className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50">Last Name</th>
              <th className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50">Position</th>
              <th className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50">Rate per Hour</th>
              <th className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50">Shift</th>
              <th className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((employee) => (
              <tr key={employee._id}>
                <td className="p-4 border-b border-blue-gray-50">{employee.firstName}</td>
                <td className="p-4 border-b border-blue-gray-50">{employee.lastName}</td>
                <td className="p-4 border-b border-blue-gray-50">{employee.position}</td>
                <td className="p-4 border-b border-blue-gray-50">{employee.ratePerHour}</td>
                <td className="p-4 border-b border-blue-gray-50">{employee.shift}</td>
                <td className="p-4 border-b border-blue-gray-50">
                  <div className="flex gap-2">
                    <Link to={`/PayrollDetails/${employee._id}`} className="px-3 py-1 text-sm font-semibold text-white bg-yellow-500 rounded hover:bg-yellow-700">View Payroll</Link>
                    <button className="px-3 py-1 text-sm font-semibold text-white bg-yellow-500 rounded hover:bg-yellow-700" title="Edit">Publish Payroll</button>
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