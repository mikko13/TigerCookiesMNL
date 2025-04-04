import { useState, useEffect } from "react";
import useAttendance from "./fetchAttendance";
import { Link } from "react-router-dom";
import { Image, AlertTriangle, ChevronRight } from "lucide-react";
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

  useEffect(() => {
    // Set a timeout to stop loading after a reasonable time
    const timeoutId = setTimeout(() => {
      if (loading) {
        setLoading(false);
      }
    }, 10000); // 10 seconds timeout

    if (fetchedAttendance.length > 0) {
      const user = JSON.parse(localStorage.getItem("user"));
      const loggedInEmployeeID = user ? user.id : null;

      const filteredAttendance = fetchedAttendance.filter(
        (record) => record.employeeID === loggedInEmployeeID
      );

      setAttendance(filteredAttendance);
      setLoading(false);
    } else if (fetchedAttendance.length === 0 && !loading) {
      // If no attendance was fetched and loading is done
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

  const filteredAttendance = attendance.filter(
    (record) =>
      record.attendanceDate
        .toLowerCase()
        .includes((searchTerm || "").toLowerCase()) &&
      (filterDate ? record.attendanceDate === filterDate : true)
  );

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const openPhotoModal = (photoId, type) => {
    const url =
      type === "checkin"
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
              onClick={() => {
                setSearchTerm("");
                setFilterDate("");
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
              {filteredAttendance.map((record) => (
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
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${getStatusClass(
                          record.attendanceStatus
                        )}`}
                      >
                        {record.attendanceStatus}
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
                          <p className="text-gray-500">Check In</p>
                          <p className="font-medium">{record.checkinTime}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Check Out</p>
                          <p className="font-medium">
                            {record.checkoutTime || "Not checked out"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Check In Photo</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openPhotoModal(record.checkinPhoto, "checkin");
                            }}
                            className="inline-flex items-center text-blue-600"
                          >
                            <Image size={16} className="mr-1" />
                            <span>View</span>
                          </button>
                        </div>
                        <div>
                          <p className="text-gray-500">Check Out Photo</p>
                          {record.checkoutPhoto ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openPhotoModal(
                                  record.checkoutPhoto,
                                  "checkout"
                                );
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
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* Desktop View */
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
                      Check In Photo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check Out
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check Out Photo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAttendance.map((record) => (
                    <tr
                      key={record._id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {record.employeeName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {record.attendanceDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {record.checkinTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() =>
                            openPhotoModal(record.checkinPhoto, "checkin")
                          }
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Image size={16} className="mr-1" />
                          <span>View</span>
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {record.checkoutTime || "Not checked out"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {record.checkoutPhoto ? (
                          <button
                            onClick={() =>
                              openPhotoModal(record.checkoutPhoto, "checkout")
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(
                            record.attendanceStatus
                          )}`}
                        >
                          {record.attendanceStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-sm text-gray-600">
            Showing {filteredAttendance.length} of {attendance.length} records
          </div>
        </div>
      )}
    </div>
  );
}