import { useState, useEffect } from "react";
import axios from "axios";
import { backendURL } from "../../../urls/URL";
import useEmployees from "./fetchEmployees";
import { getStatusClass } from "./getStatusClass";
import { AlertTriangle, Check, X, Trash2, ChevronRight } from "lucide-react";
import Swal from "sweetalert2";
import OvertimeSummaryCards from "./OvertimeSummaryCards";

const useEmployeeOvertime = () => {
  const [overtime, setOvertime] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllOvertime = async () => {
      try {
        const response = await axios.get(`${backendURL}/api/overtime/all`);
        setOvertime(response.data);
      } catch (error) {
        console.error("Error fetching overtime records:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllOvertime();
  }, []);

  return { overtime, loading, setOvertime };
};

export default function EmployeeManageAttendanceOT({
  searchTerm,
  setSearchTerm,
}) {
  const {
    overtime: overtimeRecords,
    loading,
    setOvertime,
  } = useEmployeeOvertime();
  const employeeRecords = useEmployees();
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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return dateString
      .split("/")
      .map((part) => part.padStart(2, "0"))
      .join("-");
  };

  const getEmployeeName = (employeeID) => {
    const employee = employeeRecords.find(
      (record) => record._id === employeeID
    );
    return employee ? `${employee.firstName} ${employee.lastName}` : "Unknown";
  };

  const updateOvertimeStatus = async (id, status, e) => {
    if (e) {
      e.stopPropagation();
    }

    const confirmResult = await Swal.fire({
      title: `Confirm ${status}?`,
      text: `Are you sure you want to mark this overtime request as ${status}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: status === "Approved" ? "#28a745" : "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: `Mark as ${status}`,
    });

    if (confirmResult.isConfirmed) {
      try {
        await axios.put(
          `${backendURL}/api/overtime/update/${id}`,
          { status },
          { withCredentials: true }
        );

        setOvertime((prev) =>
          prev.map((record) =>
            record._id === id ? { ...record, status } : record
          )
        );

        Swal.fire(
          "Updated!",
          `Overtime request has been marked as ${status} and employee has been notified.`,
          "success"
        );
      } catch (error) {
        Swal.fire("Error", error.response?.data || error.message, "error");
      }
    }
  };

  const filteredRecords = overtimeRecords.filter((record) =>
    formatDate(record.dateRequested).includes(searchTerm || "")
  );

  const sortedRecords = [...filteredRecords].sort((a, b) => {
    const aIsPending = !a.status || a.status === "Pending";
    const bIsPending = !b.status || b.status === "Pending";

    if (aIsPending && !bIsPending) return -1;
    if (!aIsPending && bIsPending) return 1;

    return new Date(b.dateRequested) - new Date(a.dateRequested);
  });

  const isPending = (status) => {
    return !status || status === "Pending";
  };

  return (
    <div className="flex flex-col space-y-6">
      <OvertimeSummaryCards overtime={overtimeRecords} />

      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading overtime records...</p>
        </div>
      ) : sortedRecords.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center flex flex-col items-center">
          <AlertTriangle size={48} className="text-yellow-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-800">
            No Records Found
          </h3>
          <p className="text-gray-600 mt-2">
            {searchTerm
              ? "No overtime records match your search criteria."
              : "No overtime records available yet."}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="mt-4 text-yellow-600 hover:text-yellow-700 font-medium"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {isMobile ? (
            <div className="divide-y divide-gray-200">
              {sortedRecords.map((record) => (
                <div key={record._id} className="p-4">
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => toggleRow(record._id)}
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {getEmployeeName(record.employeeID)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatDate(record.dateRequested)}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${getStatusClass(
                          record.status || "Pending"
                        )}`}
                      >
                        {record.status || "Pending"}
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
                        <div className="col-span-2">
                          <p className="text-gray-500">Overtime Hours</p>
                          <p className="font-medium">
                            {record.overtimeTime} hrs
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-gray-500">Note</p>
                          <p className="font-medium">
                            {record.overtimeNote || "No note provided"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex gap-3">
                        {isPending(record.status) && (
                          <>
                            <button
                              onClick={(e) =>
                                updateOvertimeStatus(record._id, "Approved", e)
                              }
                              className="flex items-center text-green-600 hover:text-green-700"
                            >
                              <Check size={16} className="mr-1" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={(e) =>
                                updateOvertimeStatus(record._id, "Rejected", e)
                              }
                              className="flex items-center text-red-600 hover:text-red-700"
                            >
                              <X size={16} className="mr-1" />
                              <span>Reject</span>
                            </button>
                          </>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Overtime Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Note
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedRecords.map((record) => (
                    <tr
                      key={record._id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 text-gray-900 font-medium">
                        {getEmployeeName(record.employeeID)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {formatDate(record.dateRequested)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {record.overtimeTime} hrs
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {record.overtimeNote || "No note provided"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(
                            record.status || "Pending"
                          )}`}
                        >
                          {record.status || "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm flex space-x-2">
                        {isPending(record.status) && (
                          <>
                            <button
                              onClick={() =>
                                updateOvertimeStatus(record._id, "Approved")
                              }
                              className="text-green-600 hover:text-green-700"
                              title="Approve"
                            >
                              <Check size={18} />
                            </button>
                            <button
                              onClick={() =>
                                updateOvertimeStatus(record._id, "Rejected")
                              }
                              className="text-red-600 hover:text-red-700"
                              title="Reject"
                            >
                              <X size={18} />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-sm text-gray-600">
            Showing {sortedRecords.length} of {overtimeRecords.length} records
          </div>
        </div>
      )}
    </div>
  );
}
