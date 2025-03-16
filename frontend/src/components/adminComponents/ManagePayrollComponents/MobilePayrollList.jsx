import { Link } from "react-router-dom";
import { Edit, Trash2, Download, ChevronRight, Send } from "lucide-react";
import { useState } from "react";

export default function MobilePayrollList({ 
  filteredPayrolls,
  formatCurrency,
  getStatusClass,
  handleDelete,
  handlePublish
}) {
  const [expandedRow, setExpandedRow] = useState(null);

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
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
                {record.isPublished ? "Published" : "Draft"}
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
                  <p className="text-gray-500">Total Earnings</p>
                  <p className="font-medium">
                    {formatCurrency(record.totalEarnings)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Total Deductions</p>
                  <p className="font-medium">
                    {formatCurrency(record.totalDeductions)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Net Pay</p>
                  <p className="font-medium font-bold text-green-600">
                    {formatCurrency(record.netPay)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Holiday Pay</p>
                  <p className="font-medium">
                    {formatCurrency(record.holidayPay)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Overtime Pay</p>
                  <p className="font-medium">
                    {formatCurrency(record.overtimePay)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Night Differential</p>
                  <p className="font-medium">
                    {formatCurrency(record.nightDiffPay)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Incentives</p>
                  <p className="font-medium">
                    {formatCurrency(record.incentives)}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-3">
                <Link
                  to={`/UpdateEmployeePayroll/${record._id}`}
                  state={{ record }}
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <Edit size={16} className="mr-1" />
                  <span>Edit</span>
                </Link>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(record._id);
                  }}
                  className="flex items-center text-red-600 hover:text-red-800"
                >
                  <Trash2 size={16} className="mr-1" />
                  <span>Delete</span>
                </button>
                {!record.isPublished && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePublish(record._id);
                    }}
                    className="flex items-center text-green-600 hover:text-green-800"
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
  );
}