/* eslint-disable no-unused-expressions */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Edit,
  Trash2,
  Download,
  AlertTriangle,
  ChevronRight,
  Send,
} from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";
import { backendURL } from "../../../urls/URL";

export default function ManagePayrollMain({
  searchTerm,
  filterPeriod,
  filterStatus,
}) {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const fetchPayrolls = async () => {
      try {
        const response = await axios.get(`${backendURL}/api/payroll`);
        setPayrolls(response.data);
      } catch (error) {
        console.error("Error fetching payrolls:", error);
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
      (record.employeeID?.firstName?.toLowerCase() || "").includes(
        (searchTerm || "").toLowerCase()
      ) ||
      ((record.employeeID?.lastName?.toLowerCase() || "").includes(
        (searchTerm || "").toLowerCase()
      ) &&
        (filterPeriod ? record.payPeriod === filterPeriod : true) &&
        (filterStatus
          ? filterStatus === "Published"
            ? record.isPublished
            : !record.isPublished
          : true))
  );

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${backendURL}/api/payroll/${id}`);
        setPayrolls(payrolls.filter((record) => record._id !== id));
        Swal.fire(
          "Deleted!",
          "Your payroll record has been deleted.",
          "success"
        );
      } catch (error) {
        console.error("Error deleting payroll:", error);
        Swal.fire(
          "Error!",
          "There was an error deleting the payroll record.",
          "error"
        );
      }
    }
  };

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const getStatusClass = (isPublished) => {
    return isPublished
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const handlePublish = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You are about to publish this payroll record. This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, publish it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.patch(`${backendURL}/api/payroll/${id}`, {
          isPublished: true,
        });
        setPayrolls(
          payrolls.map((record) => (record._id === id ? response.data : record))
        );
        Swal.fire(
          "Published!",
          "The payroll record has been published.",
          "success"
        );
      } catch (error) {
        console.error("Error publishing payroll:", error);
        Swal.fire(
          "Error!",
          "There was an error publishing the payroll record.",
          "error"
        );
      }
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payroll records...</p>
        </div>
      ) : filteredPayrolls.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center flex flex-col items-center">
          <AlertTriangle size={48} className="text-yellow-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-800">
            No Records Found
          </h3>
          <p className="text-gray-600 mt-2">
            {searchTerm || filterPeriod || filterStatus
              ? "No payroll records match your search criteria."
              : "No payroll records available yet."}
          </p>
          {searchTerm || filterPeriod || filterStatus ? (
            <button
              onClick={() => {
                searchTerm;
                filterPeriod;
                filterStatus;
              }}
              className="mt-4 text-yellow-600 hover:text-yellow-700 font-medium"
            >
              Clear filters
            </button>
          ) : (
            <Link
              to="/CreateEmployeePayroll"
              className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
            >
              Create First Record
            </Link>
          )}
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
                        <Link
                          to={`/DownloadPayslip/${record._id}`}
                          className="flex items-center text-purple-600 hover:text-purple-800"
                        >
                          <Download size={16} className="mr-1" />
                          <span>Download</span>
                        </Link>
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
