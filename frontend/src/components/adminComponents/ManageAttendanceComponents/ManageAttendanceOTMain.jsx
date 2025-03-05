import { useState, useEffect } from "react";
import axios from "axios";
import { backendURL } from "../../../urls/URL";
import useAttendance from "./fetchAttendance";
import { getStatusClass } from "./getStatusClass";
import { AlertTriangle, Check, X, Trash2 } from "lucide-react";
import Swal from "sweetalert2";

const useEmployeeOvertime = () => {
  const [overtime, setOvertime] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllOvertime = async () => {
      try {
        console.log("📡 Fetching all overtime records...");
        const response = await axios.get(`${backendURL}/api/overtime/all`);
        console.log(`✅ Total Overtime Records Fetched: ${response.data.length}`);
        setOvertime(response.data);
      } catch (error) {
        console.error("❌ Error fetching overtime records:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllOvertime();
  }, []);

  return { overtime, loading, setOvertime };
};

export default function EmployeeManageAttendanceOT({ searchTerm, setSearchTerm }) {
  const { overtime: overtimeRecords, loading, setOvertime } = useEmployeeOvertime();
  const attendanceRecords = useAttendance();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    }).replace(/\//g, "-");
  };

  const getEmployeeName = (employeeID) => {
    const attendance = attendanceRecords.find(record => record.employeeID === employeeID);
    return attendance ? attendance.employeeName : "Unknown";
  };

  const updateOvertimeStatus = async (id, status) => {
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
        await axios.put(`${backendURL}/api/overtime/update/${id}`, { status });
        setOvertime(prev => prev.map(record => record._id === id ? { ...record, status } : record));
        Swal.fire("Updated!", `Overtime request has been marked as ${status}.`, "success");
      } catch (error) {
        Swal.fire("Error", error.response?.data || error.message, "error");
      }
    }
  };

  const deleteOvertimeRecord = async (id) => {
    const confirmResult = await Swal.fire({
      title: "Confirm Deletion?",
      text: "Are you sure you want to delete this overtime request record? This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Delete",
    });

    if (confirmResult.isConfirmed) {
      try {
        await axios.delete(`${backendURL}/api/overtime/delete/${id}`);
        setOvertime(prev => prev.filter(record => record._id !== id));
        Swal.fire("Deleted!", "The overtime record has been deleted.", "success");
      } catch (error) {
        Swal.fire("Error", error.response?.data || error.message, "error");
      }
    }
  };

  const filteredRecords = overtimeRecords.filter(record => 
    formatDate(record.createdAt).includes(searchTerm || "")
  );

  return (
    <div className="flex flex-col space-y-6">
      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading overtime records...</p>
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
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Overtime Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Note</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">{getEmployeeName(record.employeeID)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{formatDate(record.createdAt)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{record.overtimeTime} hrs</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{record.overtimeNote || "No note provided"}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(record.status || "Pending")}`}>{record.status || "Pending"}</span>
                    </td>
                    <td className="px-6 py-4 text-sm flex space-x-2">
                      <button onClick={() => updateOvertimeStatus(record._id, "Approved")} className="text-green-600 hover:text-green-700"><Check size={18} /></button>
                      <button onClick={() => updateOvertimeStatus(record._id, "Rejected")} className="text-red-600 hover:text-red-700"><X size={18} /></button>
                      <button onClick={() => deleteOvertimeRecord(record._id)} className="text-blue-600 hover:text-blue-700"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
