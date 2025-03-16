import React, { useState, useEffect } from "react";
import { Download, AlertTriangle, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import { backendURL } from "../../../urls/URL";
import { PayslipDownloadButton } from "./PayslipGenerator";

export default function EmployeePayrollMain({
  searchTerm,
  setSearchTerm,
  filterPeriod,
  setFilterPeriod,
}) {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const fetchPayrolls = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${backendURL}/api/payroll`);

        const user = JSON.parse(localStorage.getItem("user"));
        const loggedInEmployeeID = user ? user.id : null;

        const filteredPayrolls = loggedInEmployeeID
          ? response.data.filter((record) => {
              const isEmployeeMatch =
                typeof record.employeeID === "object"
                  ? record.employeeID._id === loggedInEmployeeID
                  : record.employeeID === loggedInEmployeeID;
              return isEmployeeMatch && record.isPublished;
            })
          : [];

        setPayrolls(filteredPayrolls);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch payroll data");
      } finally {
        setLoading(false);
      }
    };

    fetchPayrolls();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filteredPayrolls = payrolls.filter(
    (record) =>
      record.payPeriod
        .toLowerCase()
        .includes((searchTerm || "").toLowerCase()) &&
      (filterPeriod ? record.payPeriod === filterPeriod : true)
  );

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const getEmployeeName = (record) => {
    if (record.employeeID && typeof record.employeeID === "object") {
      return `${record.employeeID.firstName} ${record.employeeID.lastName}`;
    }
    return "N/A";
  };

  return (
    <div className="flex flex-col space-y-6">
      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payroll records...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center flex flex-col items-center">
          <AlertTriangle size={48} className="text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-800">
            Error Loading Data
          </h3>
          <p className="text-gray-600 mt-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-yellow-600 hover:text-yellow-700 font-medium"
          >
            Try Again
          </button>
        </div>
      ) : filteredPayrolls.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center flex flex-col items-center">
          <AlertTriangle size={48} className="text-yellow-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-800">
            No Records Found
          </h3>
          <p className="text-gray-600 mt-2">
            {searchTerm || filterPeriod
              ? "No payroll records match your search criteria."
              : "No payroll records available yet."}
          </p>
          {searchTerm || filterPeriod ? (
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterPeriod("");
              }}
              className="mt-4 text-yellow-600 hover:text-yellow-700 font-medium"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
                        {getEmployeeName(record)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {record.payPeriod}
                      </div>
                      <div className="text-sm text-green-600 font-medium">
                        {formatCurrency(record.netPay)}
                      </div>
                    </div>
                  </div>

                  {expandedRow === record._id && (
                    <div className="mt-3 pl-2 border-l-2 border-gray-200">
                      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                        <div>
                          <p className="text-gray-500">Hours Worked</p>
                          <p className="font-medium">{record.regularHours}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Rate</p>
                          <p className="font-medium">
                            {formatCurrency(record.hourlyRate)}/hr
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
                          <p className="text-gray-500">Holiday Pay</p>
                          <p className="font-medium">
                            {formatCurrency(record.holidayPay)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Night Differential</p>
                          <p className="font-medium">
                            {formatCurrency(record.nightDiffPay)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Total Earnings</p>
                          <p className="font-medium">
                            {formatCurrency(record.totalEarnings)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Deductions</p>
                          <p className="font-medium">
                            {formatCurrency(record.totalDeductions)}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end mt-2">
                        {expandedRow === record._id && (
                          <div className="mt-3 pl-2 border-l-2 border-gray-200">
                            <div className="grid grid-cols-2 gap-3 text-sm mb-3"></div>
                            <div className="flex justify-end mt-2">
                              <PayslipDownloadButton
                                record={record}
                                isMobile={true}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
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
                      Hours Worked
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {getEmployeeName(record)}
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div className="flex justify-center">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            <div className="flex justify-center">
                              <PayslipDownloadButton
                                record={record}
                                isMobile={false}
                              />
                            </div>
                          </td>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-sm text-gray-600">
            Showing {filteredPayrolls.length} of {payrolls.length} records
          </div>
        </div>
      )}
    </div>
  );
}
