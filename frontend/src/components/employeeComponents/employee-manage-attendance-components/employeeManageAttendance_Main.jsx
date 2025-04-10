import { useState, useEffect } from "react";
import useAttendance from "./fetchAttendance";
import { Link } from "react-router-dom";
import { Image, AlertTriangle, ChevronRight, ChevronLeft, ChevronRight as RightIcon, Clock } from "lucide-react";
import { getStatusClass } from "./getStatusClass";
import PhotoModal from "./PhotoModal";

export default function EmployeeManageAttendanceMain({
  searchTerm,
  setSearchTerm,
  filterDate,
  setFilterDate,
}) {
  const fetchedAttendance = useAttendance();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [photoModal, setPhotoModal] = useState({
    isOpen: false,
    imageUrl: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(5); // Fewer records per page for employee view

  // Sorting function - newest first
  const sortByNewestFirst = (records) => {
    return [...records].sort((a, b) => {
      const dateA = new Date(a.attendanceDate);
      const dateB = new Date(b.attendanceDate);
      return dateB - dateA; // For descending order (newest first)
    });
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError("Loading timed out. Please try again.");
      }
    }, 10000);

    if (fetchedAttendance.length > 0) {
      const user = JSON.parse(localStorage.getItem("user"));
      const loggedInEmployeeID = user ? user.id : null;
      const loggedInEmployeeName = user ? `${user.firstName} ${user.lastName}` : "Employee";

      // Add employee name to each attendance record
      const filteredAttendance = fetchedAttendance
        .filter((record) => record.employeeID === loggedInEmployeeID)
        .map(record => ({
          ...record,
          employeeName: loggedInEmployeeName
        }));

      setAttendance(filteredAttendance);
      setLoading(false);
      setError(null);
    } else if (fetchedAttendance.length === 0 && !loading) {
      setAttendance([]);
    }

    return () => clearTimeout(timeoutId);
  }, [fetchedAttendance, loading]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calculate overtime hours
  const calculateOvertimeHours = (startOT, endOT) => {
    if (!startOT || !endOT) return 0;
    
    try {
      const start = new Date(`2000-01-01T${startOT}`);
      const end = new Date(`2000-01-01T${endOT}`);
      
      let diff = (end - start) / (1000 * 60 * 60); // Convert to hours
      if (diff < 0) diff += 24; // Handle overnight overtime
      
      return Math.round(diff * 100) / 100; // Round to 2 decimal places
    } catch (error) {
      return 0;
    }
  };

  const filteredAttendance = attendance.filter(
    (record) =>
      record.attendanceDate
        .toLowerCase()
        .includes((searchTerm || "").toLowerCase()) &&
      (filterDate ? record.attendanceDate === filterDate : true)
  );

  // Sort attendance by date (newest first)
  const sortedAttendance = sortByNewestFirst(filteredAttendance);

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = sortedAttendance.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(sortedAttendance.length / recordsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const openPhotoModal = (photoId, type) => {
    if (!photoId) return;
    
    const url = photoId.startsWith('http') || photoId.startsWith('/')
      ? photoId
      : type === "checkin"
        ? `/employee-checkin-photos/${photoId}`
        : `/employee-checkout-photos/${photoId}`;

    setPhotoModal({
      isOpen: true,
      imageUrl: url,
    });
  };

  const closePhotoModal = () => {
    setPhotoModal({
      isOpen: false,
      imageUrl: "",
    });
  };

  const clearFilters = () => {
    if (setSearchTerm) setSearchTerm("");
    if (setFilterDate) setFilterDate("");
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col space-y-6">
      <PhotoModal
        isOpen={photoModal.isOpen}
        imageUrl={photoModal.imageUrl}
        onClose={closePhotoModal}
      />

      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading attendance records...</p>
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
      ) : filteredAttendance.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center flex flex-col items-center">
          <AlertTriangle size={48} className="text-yellow-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-800">
            No Records Found
          </h3>
          <p className="text-gray-600 mt-2">
            {searchTerm || filterDate
              ? "No attendance records match your search criteria."
              : "No attendance records available yet."}
          </p>
          {searchTerm || filterDate ? (
            <button
              onClick={clearFilters}
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
              {currentRecords.map((record) => {
                const overtimeHours = calculateOvertimeHours(record.startOT, record.endOT);
                
                return (
                  <div key={record._id} className="p-4">
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => toggleRow(record._id)}
                    >
                      <div>
                        <div className="font-medium text-gray-900">
                          {record.employeeName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {record.attendanceDate}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Status: <span className={`${getStatusClass(record.attendanceStatus)} px-2 py-0.5 rounded-full`}>
                            {record.attendanceStatus}
                          </span>
                        </div>
                      </div>
                      <ChevronRight
                        size={20}
                        className={`text-gray-400 transition-transform ${
                          expandedRow === record._id ? "rotate-90" : ""
                        }`}
                      />
                    </div>

                    {expandedRow === record._id && (
                      <div className="mt-3 pl-2 border-l-2 border-gray-200">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-gray-500">Check In</p>
                            <p className="font-medium">{record.checkInTime || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Check Out</p>
                            <p className="font-medium">
                              {record.checkOutTime || "Not checked out"}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Total Hours</p>
                            <p className="font-medium">
                              {record.totalHours
                                ? `${record.totalHours} hrs`
                                : "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Overtime Hours</p>
                            <p className="font-medium">
                              {overtimeHours > 0 ? `${overtimeHours} hrs` : "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Check In Photo</p>
                            {record.checkInPhoto ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openPhotoModal(record.checkInPhoto, "checkin");
                                }}
                                className="inline-flex items-center text-blue-600"
                              >
                                <Image size={16} className="mr-1" />
                                <span>View</span>
                              </button>
                            ) : (
                              <span className="text-gray-500">No photo</span>
                            )}
                          </div>
                          <div>
                            <p className="text-gray-500">Check Out Photo</p>
                            {record.checkOutPhoto ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openPhotoModal(record.checkOutPhoto, "checkout");
                                }}
                                className="inline-flex items-center text-blue-600"
                              >
                                <Image size={16} className="mr-1" />
                                <span>View</span>
                              </button>
                            ) : (
                              <span className="text-gray-500">No photo</span>
                            )}
                          </div>
                          {record.startOT && (
                            <div>
                              <p className="text-gray-500">Overtime Start</p>
                              <p className="font-medium">{record.startOT}</p>
                            </div>
                          )}
                          {record.endOT && (
                            <div>
                              <p className="text-gray-500">Overtime End</p>
                              <p className="font-medium">{record.endOT}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check In
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check Out
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Hours
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Overtime Hours
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check In Photo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check Out Photo
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentRecords.map((record) => {
                      const overtimeHours = calculateOvertimeHours(record.startOT, record.endOT);
                      
                      return (
                        <tr
                          key={record._id}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {record.employeeName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {record.attendanceDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {record.checkInTime || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {record.checkOutTime || "Not checked out"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            <div className="flex items-center">
                              <Clock size={16} className="mr-1 text-gray-500" />
                              {record.totalHours
                                ? `${record.totalHours} hrs`
                                : "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            <div className="flex items-center">
                              <Clock size={16} className="mr-1 text-gray-500" />
                              {overtimeHours > 0 ? `${overtimeHours} hrs` : "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(
                                record.attendanceStatus
                              )}`}
                            >
                              {record.attendanceStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {record.checkInPhoto ? (
                              <button
                                onClick={() =>
                                  openPhotoModal(record.checkInPhoto, "checkin")
                                }
                                className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                <Image size={16} className="mr-1" />
                                <span>View</span>
                              </button>
                            ) : (
                              <span className="text-gray-500">No photo</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {record.checkOutPhoto ? (
                              <button
                                onClick={() =>
                                  openPhotoModal(record.checkOutPhoto, "checkout")
                                }
                                className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                <Image size={16} className="mr-1" />
                                <span>View</span>
                              </button>
                            ) : (
                              <span className="text-gray-500">No photo</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, sortedAttendance.length)} of {sortedAttendance.length} records
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`px-3 py-1 rounded-md ${currentPage === number ? 'bg-yellow-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      {number}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    <RightIcon size={20} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}