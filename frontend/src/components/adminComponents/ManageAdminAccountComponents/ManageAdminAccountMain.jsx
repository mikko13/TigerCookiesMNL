import { useState, useEffect } from "react";
import useAdmins from "./fetchAdmins";
import { Link } from "react-router-dom";
import {
  Edit,
  Trash2,
  AlertTriangle,
  ChevronRight,
  UserCircle,
} from "lucide-react";

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
      (admin.firstName?.toLowerCase() || "").includes(lowerQuery) ||
      (admin.lastName?.toLowerCase() || "").includes(lowerQuery) ||
      (admin.email?.toLowerCase() || "").includes(lowerQuery)
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
          src={`/admin-profile-pics/${profilePicture}`}
          alt="Admin Profile"
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
              to="/CreateAdminAccount"
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
              {filteredAdmins.map((admin) => (
                <div key={admin._id} className="p-4">
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => toggleRow(admin._id)}
                  >
                    <div className="flex items-center gap-3">
                      {renderProfileImage(admin.profilePicture)}
                      <div className="hidden">
                        <UserCircle className="h-10 w-10 text-gray-500" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {admin.firstName} {admin.lastName}
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
                      </div>

                      <div className="mt-3 flex gap-3">
                        <Link
                          to={`/ModifyAdminAccount/${admin._id}`}
                          state={{ admin }}
                          className="flex items-center px-3 py-1 rounded-md text-white font-medium shadow-sm transition-all bg-yellow-500 hover:bg-yellow-600"
                        >
                          <Edit size={16} className="mr-1" />
                          <span>Edit</span>
                        </Link>
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
                        <div className="flex items-center">
                          {renderProfileImage(admin.profilePicture)}
                          <div className="hidden">
                            <UserCircle className="h-10 w-10 text-gray-500" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {admin.firstName} {admin.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {admin.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div className="flex gap-3 items-center">
                          <Link
                            to={`/ModifyAdminAccount/${admin._id}`}
                            state={{ admin }}
                            className="flex items-center px-3 py-1 rounded-md text-white font-medium shadow-sm transition-all bg-yellow-500 hover:bg-yellow-600"
                            title="Edit"
                          >
                            <Edit size={16} className="mr-1" />
                            <span>Edit</span>
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
            Showing {filteredAdmins.length} of {admins.length} accounts
          </div>
        </div>
      )}
    </div>
  );
}
