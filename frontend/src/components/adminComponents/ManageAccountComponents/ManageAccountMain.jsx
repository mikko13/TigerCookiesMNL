import { useState, useEffect } from "react";
import useEmployees from "./fetchEmployees";
import { Link } from "react-router-dom";
import {
  Edit,
  Power,
  AlertTriangle,
  ChevronRight,
  UserCircle,
  CheckCircle2,
  XCircle,
  ChevronLeft,
} from "lucide-react";
import axios from "axios";
import { backendURL } from "../../../urls/URL";
import Swal from "sweetalert2";
import EmployeeSummaryCards from "./EmployeeSummaryCards";

export default function ManageAccountMain({
  searchTerm,
  sortOption = "recent",
}) {
  const fetchedEmployees = useEmployees();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(null);
  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);

  useEffect(() => {
    if (fetchedEmployees.length > 0) {
      fetchedEmployees.forEach((employee, index) => {
        if (!employee.firstName || !employee.lastName) {
          console.warn(
            `Employee at index ${index} is missing required fields:`,
            employee
          );
        }
      });

      setEmployees(fetchedEmployees);
      setLoading(false);
    }
  }, [fetchedEmployees]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filteredEmployees = employees.filter((employee) => {
    if (!searchTerm) return true;

    const lowerQuery = searchTerm.toLowerCase();
    return (
      (employee.firstName?.toLowerCase() || "").includes(lowerQuery) ||
      (employee.lastName?.toLowerCase() || "").includes(lowerQuery) ||
      (employee.email?.toLowerCase() || "").includes(lowerQuery) ||
      (employee.phone?.toLowerCase() || "").includes(lowerQuery) ||
      (employee.address?.toLowerCase() || "").includes(lowerQuery) ||
      (employee.gender?.toLowerCase() || "").includes(lowerQuery) ||
      (employee.dateOfBirth?.toLowerCase() || "").includes(lowerQuery) ||
      (employee.position?.toLowerCase() || "").includes(lowerQuery) ||
      (employee.hiredDate?.toLowerCase() || "").includes(lowerQuery) ||
      (employee.ratePerHour?.toString() || "").includes(lowerQuery) ||
      (employee.overtimeRate?.toString() || "").includes(lowerQuery) ||
      (employee.isActive?.toString() || "").includes(lowerQuery)
    );
  });

  // Apply sorting based on sortOption
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    switch (sortOption) {
      case "recent":
        // Sort by hired date descending (most recent first)
        return new Date(b.hiredDate || 0) - new Date(a.hiredDate || 0);
      case "oldest":
        // Sort by hired date ascending (oldest first)
        return new Date(a.hiredDate || 0) - new Date(b.hiredDate || 0);
      case "name-asc":
        // Sort by name ascending (A-Z)
        return `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`
        );
      case "name-desc":
        // Sort by name descending (Z-A)
        return `${b.firstName} ${b.lastName}`.localeCompare(
          `${a.firstName} ${a.lastName}`
        );
      case "active":
        // Sort by status (active first)
        return (b.isActive || 0) - (a.isActive || 0);
      case "inactive":
        // Sort by status (inactive first)
        return (a.isActive || 0) - (b.isActive || 0);
      default:
        // Default to most recent
        return new Date(b.hiredDate || 0) - new Date(a.hiredDate || 0);
    }
  });

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = sortedEmployees.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(sortedEmployees.length / recordsPerPage);

  // Reset to first page when sort option changes
  useEffect(() => {
    setCurrentPage(1);
  }, [sortOption]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const confirmToggleStatus = (employeeId, currentStatus, employeeName) => {
    const isActivating = currentStatus === 0;
    const actionText = isActivating ? "activate" : "deactivate";
    const statusText = isActivating ? "active" : "inactive";
    const confirmButtonColor = isActivating ? "#10B981" : "#EF4444";
    const confirmButtonText = isActivating
      ? "Yes, Activate"
      : "Yes, Deactivate";
    const icon = isActivating ? "success" : "warning";

    Swal.fire({
      title: `${isActivating ? "Activate" : "Deactivate"} Account?`,
      html: `Are you sure you want to ${actionText} <strong>${employeeName}</strong>'s account?<br>
             This will change their status to <strong>${statusText}</strong>.`,
      icon: icon,
      showCancelButton: true,
      confirmButtonColor: confirmButtonColor,
      cancelButtonColor: "#6B7280",
      confirmButtonText: confirmButtonText,
      cancelButtonText: "Cancel",
      reverseButtons: true,
      focusCancel: true,
    }).then((result) => {
      if (result.isConfirmed) {
        toggleEmployeeStatus(employeeId, currentStatus, employeeName);
      }
    });
  };

  const toggleEmployeeStatus = async (
    employeeId,
    currentStatus,
    employeeName
  ) => {
    try {
      setToggleLoading(employeeId);
      const newStatus = currentStatus === 1 ? 0 : 1;
      const actionText = newStatus === 1 ? "activated" : "deactivated";

      const response = await axios.put(
        `${backendURL}/api/employees/${employeeId}`,
        {
          isActive: newStatus,
        }
      );

      if (response.status === 200) {
        setEmployees(
          employees.map((emp) =>
            emp._id === employeeId ? { ...emp, isActive: newStatus } : emp
          )
        );

        Swal.fire({
          title: "Success!",
          text: `${employeeName}'s account has been ${actionText}.`,
          icon: "success",
          confirmButtonColor: "#EAB308",
          timer: 2000,
          timerProgressBar: true,
        });
      }
    } catch (error) {
      console.error("Error toggling employee status:", error);

      Swal.fire({
        title: "Operation Failed",
        text: "Failed to update employee status. Please try again.",
        icon: "error",
        confirmButtonColor: "#EAB308",
      });
    } finally {
      setToggleLoading(null);
    }
  };

  const renderProfileImage = (profilePicture) => {
    if (profilePicture) {
      return (
        <img
          src={`/employee-profile-pics/${profilePicture}`}
          alt="Employee Profile"
          className="h-10 w-10 rounded-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "flex";
          }}
        />
      );
    }
    return (
      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
        <UserCircle className="h-8 w-8 text-gray-500" />
      </div>
    );
  };

  const renderStatusIndicator = (isActive) => {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isActive === 1
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        {isActive === 1 ? (
          <CheckCircle2 size={14} className="mr-1" />
        ) : (
          <XCircle size={14} className="mr-1" />
        )}
        {isActive === 1 ? "Active" : "Inactive"}
      </span>
    );
  };

  const getButtonColorClass = (isActive) => {
    if (isActive === 1) {
      return "bg-red-500 hover:bg-red-600";
    } else {
      return "bg-green-500 hover:bg-green-600";
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <EmployeeSummaryCards employees={employees} />

      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading employee accounts...</p>
        </div>
      ) : sortedEmployees.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center flex flex-col items-center">
          <AlertTriangle size={48} className="text-yellow-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-800">
            No Accounts Found
          </h3>
          <p className="text-gray-600 mt-2">
            {searchTerm
              ? "No employee accounts match your search criteria."
              : "No employee accounts available yet."}
          </p>
          {searchTerm ? (
            <button
              onClick={() => searchTerm("")}
              className="mt-4 text-yellow-600 hover:text-yellow-700 font-medium"
            >
              Clear search
            </button>
          ) : (
            <Link
              to="/CreateEmployeeAccount"
              className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
            >
              Create First Account
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {isMobile ? (
            <div className="divide-y divide-gray-200">
              {currentRecords.map((employee) => (
                <div key={employee._id} className="p-4">
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => toggleRow(employee._id)}
                  >
                    <div className="flex items-center gap-3">
                      {renderProfileImage(employee.profilePicture)}
                      <div className="hidden">
                        <UserCircle className="h-10 w-10 text-gray-500" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {employee.firstName} {employee.lastName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {employee.position}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {renderStatusIndicator(employee.isActive)}
                      <ChevronRight
                        size={20}
                        className={`text-gray-400 transition-transform ${
                          expandedRow === employee._id ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                  </div>

                  {expandedRow === employee._id && (
                    <div className="mt-3 pl-2 border-l-2 border-gray-200">
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500">Employee ID</p>
                          <p className="font-medium">{employee.employeeID}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Email</p>
                          <p className="font-medium">{employee.email}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Phone Number</p>
                          <p className="font-medium">{employee.phone}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Address</p>
                          <p className="font-medium">{employee.address}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Gender</p>
                          <p className="font-medium">{employee.gender}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Date of Birth</p>
                          <p className="font-medium">{employee.dateOfBirth}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Hired Date</p>
                          <p className="font-medium">{employee.hiredDate}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Rate per Hour</p>
                          <p className="font-medium">{employee.ratePerHour}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Overtime Rate</p>
                          <p className="font-medium">{employee.overtimeRate}</p>
                        </div>

                        <div>
                          <p className="text-gray-500">Status</p>
                          <p className="font-medium">
                            {employee.isActive === 1 ? "Active" : "Inactive"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex gap-3">
                        <Link
                          to={`/ModifyEmployeeAccount/${employee._id}`}
                          state={{ employee }}
                          className="flex items-center px-3 py-1 rounded-md text-white font-medium shadow-sm transition-all bg-yellow-500 hover:bg-yellow-600"
                        >
                          <Edit size={16} className="mr-1" />
                          <span>Edit</span>
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmToggleStatus(
                              employee._id,
                              employee.isActive,
                              `${employee.firstName} ${employee.lastName}`
                            );
                          }}
                          disabled={toggleLoading === employee._id}
                          className={`flex items-center px-3 py-1 rounded-md text-white font-medium shadow-sm transition-all ${
                            toggleLoading === employee._id
                              ? "bg-gray-400 cursor-not-allowed"
                              : getButtonColorClass(employee.isActive)
                          }`}
                        >
                          {toggleLoading === employee._id ? (
                            <div className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full mr-1"></div>
                          ) : (
                            <Power size={16} className="mr-1" />
                          )}
                          <span>
                            {toggleLoading === employee._id
                              ? "Updating..."
                              : employee.isActive === 1
                              ? "Deactivate"
                              : "Activate"}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Mobile Pagination */}
              <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing {indexOfFirstRecord + 1} to{" "}
                  {Math.min(indexOfLastRecord, sortedEmployees.length)} of{" "}
                  {sortedEmployees.length} accounts
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === 1
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <ChevronLeft size={20} />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((num) => {
                      // On mobile, just show a limited set of page numbers
                      if (totalPages <= 3) return true;
                      if (num === 1 || num === totalPages) return true;
                      if (Math.abs(num - currentPage) <= 1) return true;
                      return false;
                    })
                    .map((number) => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`px-3 py-1 rounded-md ${
                          currentPage === number
                            ? "bg-yellow-500 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {number}
                      </button>
                    ))}

                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === totalPages
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Desktop View */
            <>
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Profile
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gender
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date of Birth
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Position
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hired Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Overtime Rate
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
                    {currentRecords.map((employee) => (
                      <tr
                        key={employee._id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {renderProfileImage(employee.profilePicture)}
                            <div className="hidden">
                              <UserCircle className="h-10 w-10 text-gray-500" />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-bold text-sm text-gray-700">
                          {employee.employeeID}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {employee.firstName} {employee.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {employee.address}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {employee.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {employee.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {employee.gender}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {employee.dateOfBirth}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {employee.position}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {employee.hiredDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {employee.ratePerHour}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {employee.overtimeRate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {renderStatusIndicator(employee.isActive)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <div className="flex gap-3 items-center">
                            <Link
                              to={`/ModifyEmployeeAccount/${employee._id}`}
                              state={{ employee }}
                              className="flex items-center px-3 py-1 rounded-md text-white font-medium shadow-sm transition-all bg-yellow-500 hover:bg-yellow-600"
                              title="Edit"
                            >
                              <Edit size={16} className="mr-1" />
                              <span>Edit</span>
                            </Link>
                            <button
                              onClick={() =>
                                confirmToggleStatus(
                                  employee._id,
                                  employee.isActive,
                                  `${employee.firstName} ${employee.lastName}`
                                )
                              }
                              disabled={toggleLoading === employee._id}
                              className={`flex items-center px-3 py-1 rounded-md text-white font-medium shadow-sm transition-all ${
                                toggleLoading === employee._id
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : getButtonColorClass(employee.isActive)
                              }`}
                              title={
                                employee.isActive === 1
                                  ? "Deactivate"
                                  : "Activate"
                              }
                            >
                              {toggleLoading === employee._id ? (
                                <div className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full mr-1"></div>
                              ) : (
                                <Power size={16} className="mr-1" />
                              )}
                              <span>
                                {employee.isActive === 1
                                  ? "Deactivate"
                                  : "Activate"}
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Desktop Pagination */}
              <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing {indexOfFirstRecord + 1} to{" "}
                  {Math.min(indexOfLastRecord, filteredEmployees.length)} of{" "}
                  {filteredEmployees.length} accounts
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === 1
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <ChevronLeft size={20} />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (number) => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`px-3 py-1 rounded-md ${
                          currentPage === number
                            ? "bg-yellow-500 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {number}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === totalPages
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <ChevronRight size={20} />
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
