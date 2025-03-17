import { useState, useEffect } from "react";
import useEmployees from "./fetchEmployees";
import handleDelete from "./handleDelete";
import { Link } from "react-router-dom";
import {
  Edit,
  Trash2,
  AlertTriangle,
  ChevronRight,
  UserCircle,
} from "lucide-react";

export default function ManageAccountMain({ searchTerm }) {
  const fetchedEmployees = useEmployees();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (fetchedEmployees.length > 0) {
      fetchedEmployees.forEach((employee, index) => {
        if (!employee.firstName || !employee.lastName) {
          console.warn(`Employee at index ${index} is missing required fields:`, employee);
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
      (employee.shift?.toLowerCase() || "").includes(lowerQuery)
    );
  });

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  // Function to render profile image with fallback
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

  return (
    <div className="flex flex-col space-y-6">
      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading employee accounts...</p>
        </div>
      ) : filteredEmployees.length === 0 ? (
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
              {filteredEmployees.map((employee) => (
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
                    <ChevronRight
                      size={20}
                      className={`text-gray-400 transition-transform ${
                        expandedRow === employee._id ? "rotate-90" : ""
                      }`}
                    />
                  </div>

                  {expandedRow === employee._id && (
                    <div className="mt-3 pl-2 border-l-2 border-gray-200">
                      <div className="grid grid-cols-1 gap-3 text-sm">
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
                          <p className="text-gray-500">Shift</p>
                          <p className="font-medium">{employee.shift}</p>
                        </div>
                      </div>

                      <div className="mt-3 flex gap-3">
                        <Link
                          to={`/ModifyEmployeeAccount/${employee._id}`}
                          state={{ employee }}
                          className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <Edit size={16} className="mr-1" />
                          <span>Edit</span>
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(employee._id);
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
                      Profile
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
                      Shift
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEmployees.map((employee) => (
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
                        {employee.shift}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div className="flex gap-3">
                          <Link
                            to={`/ModifyEmployeeAccount/${employee._id}`}
                            state={{ employee }}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            onClick={() => handleDelete(employee._id)}
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
            Showing {filteredEmployees.length} of {employees.length} accounts
          </div>
        </div>
      )}
    </div>
  );
}
