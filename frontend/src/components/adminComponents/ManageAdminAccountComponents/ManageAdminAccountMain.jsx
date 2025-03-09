import { useState, useEffect } from "react";
import useAdmins from "./fetchAdmins";
import handleAdminDelete from "./handleAdminDelete";
import { Link } from "react-router-dom";
import { Edit, Trash2, AlertTriangle, ChevronRight } from "lucide-react";

export default function ManageAdminAccountMain({ searchTerm }) {
  const fetchedAdmins = useAdmins();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (fetchedAdmins.length > 0) {
      setAdmins(fetchedAdmins);
      setLoading(false);
    }
  }, [fetchedAdmins]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filteredAdmins = admins.filter((admin) => {
    if (!searchTerm) return true;

    const lowerQuery = searchTerm.toLowerCase();
    return (
      admin.firstName.toLowerCase().includes(lowerQuery) ||
      admin.lastName.toLowerCase().includes(lowerQuery) ||
      admin.email.toLowerCase().includes(lowerQuery) ||
      admin.address.toLowerCase().includes(lowerQuery) ||
      admin.gender.toLowerCase().includes(lowerQuery) ||
      admin.dateOfBirth.toLowerCase().includes(lowerQuery) ||
      admin.position.toLowerCase().includes(lowerQuery) ||
      admin.hiredDate.toLowerCase().includes(lowerQuery) ||
      admin.ratePerHour.toString().includes(lowerQuery) ||
      admin.shift.toLowerCase().includes(lowerQuery)
    );
  });

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="flex flex-col space-y-6">
      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin accounts...</p>
        </div>
      ) : filteredAdmins.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center flex flex-col items-center">
          <AlertTriangle size={48} className="text-yellow-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-800">
            No Accounts Found
          </h3>
          <p className="text-gray-600 mt-2">
            {searchTerm
              ? "No admin accounts match your search criteria."
              : "No admin accounts available yet."}
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
          {/* Mobile View */}
          {isMobile ? (
            <div className="divide-y divide-gray-200">
              {filteredAdmins.map((admin) => (
                <div key={admin._id} className="p-4">
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => toggleRow(admin._id)}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={`/admin-profile-pics/${admin.profilePicture}`}
                        alt="Employee Profile"
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-medium text-gray-900">
                          {admin.firstName} {admin.lastName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {admin.position}
                        </div>
                      </div>
                    </div>
                    <ChevronRight
                      size={20}
                      className={`text-gray-400 transition-transform ${
                        expandedRow === admin._id ? "rotate-90" : ""
                      }`}
                    />
                  </div>

                  {expandedRow === admin._id && (
                    <div className="mt-3 pl-2 border-l-2 border-gray-200">
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500">Email</p>
                          <p className="font-medium">{admin.email}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Address</p>
                          <p className="font-medium">{admin.address}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Gender</p>
                          <p className="font-medium">{admin.gender}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Date of Birth</p>
                          <p className="font-medium">{admin.dateOfBirth}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Hired Date</p>
                          <p className="font-medium">{admin.hiredDate}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Rate per Hour</p>
                          <p className="font-medium">{admin.ratePerHour}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Shift</p>
                          <p className="font-medium">{admin.shift}</p>
                        </div>
                      </div>

                      <div className="mt-3 flex gap-3">
                        <Link
                          to={`/ModifyAdminAccount/${admin._id}`}
                          state={{ admin }}
                          className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <Edit size={16} className="mr-1" />
                          <span>Edit</span>
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAdminDelete(admin._id);
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
                  {filteredAdmins.map((admin) => (
                    <tr
                      key={admin._id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={`/admin-profile-pics/${admin.profilePicture}`}
                          alt="Employee Profile"
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {admin.firstName} {admin.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {admin.address}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {admin.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {admin.gender}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {admin.dateOfBirth}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {admin.position}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {admin.hiredDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {admin.ratePerHour}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {admin.shift}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div className="flex gap-3">
                          <Link
                            to={`/ModifyAdminAccount/${admin._id}`}
                            state={{ admin }}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            onClick={() => handleAdminDelete(admin._id)}
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
            Showing {filteredAdmins.length} of {admins.length} accounts
          </div>
        </div>
      )}
    </div>
  );
}
