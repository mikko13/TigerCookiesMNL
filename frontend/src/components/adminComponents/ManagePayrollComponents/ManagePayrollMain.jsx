import { useState, useEffect } from "react";
import Header from "./ManagePayrollHeader";
import { Link } from "react-router-dom";

export default function ManagePayroll() {
  return (
    <div className="relative flex flex-col w-full h-full text-gray-700 shadow-md bg-clip-border">
      <Header />
      <div className="overflow-x-auto max-h-[500px]">
        <table className="w-full text-left table-auto min-w-max">
          <thead>
            <tr>
              <th className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50">
                Employee Name
              </th>
              <th className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50">
                Salary
              </th>
              <th className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50">
                Holiday Pay
              </th>
              <th className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50">
                Total Deduction
              </th>
              <th className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50">
                Overtime Pay
              </th>
              <th className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50">
                Incentives
              </th>
              <th className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50">
                Total Earnings
              </th>
              <th className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="overflow-y-auto">
            <tr>
              <td className="p-4 border-b border-blue-gray-50">e </td>
              <td className="p-4 border-b border-blue-gray-50">₱4</td>
              <td className="p-4 border-b border-blue-gray-50">₱4</td>
              <td className="p-4 border-b border-blue-gray-50">₱4</td>
              <td className="p-4 border-b border-blue-gray-50">₱4</td>
              <td className="p-4 border-b border-blue-gray-50">₱4</td>
              <td className="p-4 border-b border-blue-gray-50 font-bold">₱4</td>
              <td className="p-4 border-b border-blue-gray-50">
                <div className="flex gap-2">
                  <Link
                    to={`/UpdatePayroll`}
                    className="text-blue-500 hover:underline"
                  >
                    Edit
                  </Link>
                  <button className="text-red-500 hover:underline">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
