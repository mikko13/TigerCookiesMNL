import { useState, useEffect } from "react";
import useOvertime from "./fetchOvertime";
import useEmployees from "./fetchEmployees";
import { getStatusClass } from "./getStatusClass";
import { AlertTriangle, ChevronRight } from "lucide-react";

export default function EmployeeManageAttendanceOT({ searchTerm, setSearchTerm }) {
  const overtimeRecords = useOvertime();
  const employeeRecords = useEmployees();
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (overtimeRecords.length > 0) {
      setLoading(false);
    } else {
      // If no records exist, set loading to false after a short delay
      const timer = setTimeout(() => setLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [overtimeRecords]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    }).replace(/\//g, "-");
  };

  const getEmployeeName = (employeeID) => {
    const employee = employeeRecords.find((record) => record._id === employeeID);
    return employee ? `${employee.firstName} ${employee.lastName}` : "Unknown";
  };

  const filteredRecords = overtimeRecords
    .filter(record => formatDate(record.dateRequested).includes(searchTerm || ""))
    .sort((a, b) => new Date(b.dateRequested) - new Date(a.dateRequested));

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  // Check if there are no records (not just filtered ones)
  const noRecords = overtimeRecords.length === 0;

  return (
    <div className="flex flex-col space-y-6">
      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading overtime records...</p>
        </div>
      ) : noRecords ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center flex flex-col items-center">
          <AlertTriangle size={48} className="text-yellow-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-800">No Records Yet</h3>
          <p className="text-gray-600 mt-2">
            There are no overtime records available yet.
          </p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center flex flex-col items-center">
          <AlertTriangle size={48} className="text-yellow-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-800">No Records Found</h3>
          <p className="text-gray-600 mt-2">
            {searchTerm ? "No overtime records match your search criteria." : "No overtime records available yet."}
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
              {filteredRecords.map((record) => (
                <div key={record._id} className="p-4">
                  <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleRow(record._id)}>
                    <div>
                      <div className="font-medium text-gray-900">{getEmployeeName(record.employeeID)}</div>
                      <div className="text-sm text-gray-600">{formatDate(record.dateRequested)}</div>
                    </div>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${getStatusClass(record.status || "Pending")}`}>
                        {record.status || "Pending"}
                      </span>
                      <ChevronRight size={20} className={`text-gray-400 transition-transform ${expandedRow === record._id ? "rotate-90" : ""}`} />
                    </div>
                  </div>
                  {expandedRow === record._id && (
                    <div className="mt-3 pl-2 border-l-2 border-gray-200 text-sm text-gray-700">
                      <p><strong>Overtime Hours:</strong> {record.overtimeTime} hrs</p>
                      <p><strong>Note:</strong> {record.overtimeNote || "No note provided"}</p>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Overtime Hours</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Note</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecords.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 text-gray-900 font-medium">{getEmployeeName(record.employeeID)}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{formatDate(record.dateRequested)}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{record.overtimeTime} hrs</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{record.overtimeNote || "No note provided"}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(record.status || "Pending")}`}>
                          {record.status || "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-sm text-gray-600">
            Showing {filteredRecords.length} of {overtimeRecords.length} records
          </div>
        </div>
      )}
    </div>
  );
}