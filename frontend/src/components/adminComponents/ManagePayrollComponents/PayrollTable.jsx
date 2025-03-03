import { Link } from "react-router-dom";
import { Edit, Trash2, Download, Send } from "lucide-react";

export default function PayrollTable({ 
  filteredPayrolls, 
  formatCurrency, 
  getStatusClass, 
  handleDelete, 
  handlePublish 
}) {
  return (
    <div className="overflow-x-auto">
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
                  {`${record.employeeID.firstName} ${record.employeeID.lastName}`}
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
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {formatCurrency(record.totalEarnings)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {formatCurrency(record.totalDeductions)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                {formatCurrency(record.netPay)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(
                    record.isPublished
                  )}`}
                >
                  {record.isPublished ? "Published" : "Unpublished"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                <div className="flex gap-3">
                  <Link
                    to={`/UpdateEmployeePayroll/${record._id}`}
                    state={{ record }}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </Link>
                  <button
                    onClick={() => handleDelete(record._id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                  {!record.isPublished && (
                    <button
                      onClick={() => handlePublish(record._id)}
                      className="text-green-600 hover:text-green-800 transition-colors"
                      title="Publish"
                    >
                      <Send size={18} />
                    </button>
                  )}
                  <Link
                    to={`/DownloadPayslip/${record._id}`}
                    className="text-purple-600 hover:text-purple-800 transition-colors"
                    title="Download Payslip"
                  >
                    <Download size={18} />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-sm text-gray-600">
        Showing {filteredPayrolls.length} records
      </div>
    </div>
  );
}