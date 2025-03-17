import { useState, useEffect } from "react";
import useAttendance from "./fetchAttendance";
import handleDelete from "./handleDelete";
import { Link } from "react-router-dom";
import { getStatusClass } from "./getStatusClass";
import { Edit, Trash2, Image, AlertTriangle, ChevronRight } from "lucide-react";
import AttendanceSummaryCards from "./AttendanceSummaryCards";
import PhotoModal from "./PhotoModal";

export default function ManageAttendanceMain({
  searchTerm,
  setSearchTerm,
  filterDate,
  setFilterDate,
}) {
  const fetchedAttendance = useAttendance();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [photoModal, setPhotoModal] = useState({
    isOpen: false,
    imageUrl: "",
  });

  useEffect(() => {
    if (fetchedAttendance.length > 0) {
      setAttendance(fetchedAttendance);
      setLoading(false);
    }
  }, [fetchedAttendance]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

const filteredAttendance = attendance.filter((record) => {
  const nameMatch = record.employeeName
    .toLowerCase()
    .includes((searchTerm || "").toLowerCase());
  
  let dateMatch = true;
  if (filterDate) {

    try {
      const recordDate = new Date(record.attendanceDate);
      const filterDateObj = new Date(filterDate);
      
      dateMatch = 
        recordDate.getFullYear() === filterDateObj.getFullYear() &&
        recordDate.getMonth() === filterDateObj.getMonth() &&
        recordDate.getDate() === filterDateObj.getDate();
    } catch (error) {
      dateMatch = record.attendanceDate === filterDate;
    }
  }
  
  return nameMatch && dateMatch;
});

  const confirmDelete = (id) => {
    handleDelete(id, setAttendance);
  };

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

  const clearFilters = () => {
    if (setSearchTerm) setSearchTerm("");
    if (setFilterDate) setFilterDate("");
  };

  return (
    <div className="flex flex-col space-y-6">
      <PhotoModal
        isOpen={photoModal.isOpen}
        imageUrl={photoModal.imageUrl}
        onClose={closePhotoModal}
      />
      
      <AttendanceSummaryCards attendance={attendance} />

      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading attendance records...</p>
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
          ) : (
            <Link
              to="/CreateEmployeeAttendance"
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

                      <div className="mt-3 flex gap-3">
                        <Link
                          to={`/UpdateEmployeeAttendance/${record._id}`}
                          state={{ record }}
                          className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <Edit size={16} className="mr-1" />
                          <span>Edit</span>
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDelete(record._id);
                          }}
                          className="flex items-center text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} className="mr-1" />
                          <span>Delete</span>
                        </button>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div className="flex gap-3">
                          <Link
                            to={`/UpdateEmployeeAttendance/${record._id}`}
                            state={{ record }}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            onClick={() => confirmDelete(record._id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
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
