import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Edit, Download, Send, ChevronRight } from "lucide-react";

export default function PayrollTable({
  filteredPayrolls,
  formatCurrency,
  getStatusClass,
  handlePublish,
}) {
  const [expandedRow, setExpandedRow] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="overflow-x-auto">
      {isMobile ? (
        <div className="divide-y divide-gray-200">
          {filteredPayrolls.map((record) => (
            <div key={record._id} className="p-4">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleRow(record._id)}
              >
                <div>
                  <div className="font-medium text-gray-900">
                    {`${record.employeeID.firstName} ${record.employeeID.lastName}`}
                  </div>
                  <div className="text-sm text-gray-600">
                    {record.payPeriod}
                  </div>
                </div>
                <div className="flex items-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${getStatusClass(
                      record.isPublished
                    )}`}
                  >
                    {record.isPublished ? "Published" : "Pending"}
                  </span>
                  <ChevronRight
                    size={20}
                    className={`text-gray-400 transition-transform ${
                      expandedRow === record._id ? "rotate-90" : ""
                    }`}
                  />
                </div>
              </div>

              {expandedRow === record._id && (
                <div className="mt-3 pl-2 border-l-2 border-gray-200">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Regular Hours</p>
                      <p className="font-medium">{record.regularHours}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Hourly Rate</p>
                      <p className="font-medium">
                        {formatCurrency(record.hourlyRate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Base Salary</p>
                      <p className="font-medium">
                        {formatCurrency(record.baseSalary)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Overtime</p>
                      <p className="font-medium">
                        {formatCurrency(record.overtimePay)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Earnings</p>
                      <p className="font-medium text-blue-600">
                        {formatCurrency(record.totalEarnings)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Deductions</p>
                      <p className="font-medium text-red-600">
                        {formatCurrency(record.totalDeductions)}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-500">Net Pay</p>
                      <p className="font-medium text-green-600">
                        {formatCurrency(record.netPay)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-3">
                    <Link
                      to={`/UpdateEmployeePayroll/${record._id}`}
                      state={{ record }}
                      className="flex items-center px-3 py-1 rounded-md text-white font-medium shadow-sm transition-all bg-yellow-500 hover:bg-yellow-600"
                    >
                      <Edit size={16} className="mr-1" />
                      <span>Edit</span>
                    </Link>
                    {!record.isPublished && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePublish(record._id);
                        }}
                        className="flex items-center px-3 py-1 rounded-md text-white font-medium shadow-sm transition-all bg-green-500 hover:bg-green-600"
                      >
                        <Send size={16} className="mr-1" />
                        <span>Publish</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pay Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Regular Hours
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hourly Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Base Salary
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Overtime
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Earnings
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Deductions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Net Pay
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPayrolls.map((record) => (
              <tr
                key={record._id}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">
                    {`${record.employeeID?.firstName} ${record.employeeID?.lastName}`}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {record.payPeriod}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {record.regularHours}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {formatCurrency(record.hourlyRate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {formatCurrency(record.baseSalary)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {formatCurrency(record.overtimePay)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                  {formatCurrency(record.totalEarnings)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                  {formatCurrency(record.totalDeductions)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                  {formatCurrency(record.netPay)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(
                      record.isPublished
                    )}`}
                  >
                    {record.isPublished ? "Published" : "Pending"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  <div className="flex gap-3">
                    <Link
                      to={`/UpdateEmployeePayroll/${record._id}`}
                      state={{ record }}
                      className="flex items-center px-3 py-1 rounded-md text-white font-medium shadow-sm transition-all bg-yellow-500 hover:bg-yellow-600"
                      title="Edit"
                    >
                      <Edit size={16} className="mr-1" />
                      <span>Edit</span>
                    </Link>
                    {!record.isPublished && (
                      <button
                        onClick={() => handlePublish(record._id)}
                        className="flex items-center px-3 py-1 rounded-md text-white font-medium shadow-sm transition-all bg-green-500 hover:bg-green-600"
                        title="Publish"
                      >
                        <Send size={16} className="mr-1" />
                        <span>Publish</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-sm text-gray-600">
        Showing {filteredPayrolls.length} records
      </div>
    </div>
  );
}
