import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  User,
  Clock,
  ClockAlert,
  PhilippinePeso,
  LogOut,
  X,
  UserCircle,
} from "lucide-react";
import axios from "axios";
import { backendURL } from "../../../urls/URL";

export default function AdminSidebar({
  isExpanded = true,
  toggleExpand,
  isMobile = false,
  toggleVisibility,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState(null);

  useEffect(() => {
    const storedAdmin = localStorage.getItem("user");
    if (storedAdmin) {
      const parsedAdmin = JSON.parse(storedAdmin);
      setAdmin(parsedAdmin);

      // Check if admin profile picture exists
      checkProfilePicture(parsedAdmin.id);
    }
  }, []);

  // Function to check and set profile picture URL
  const checkProfilePicture = async (adminId) => {
    // List of common image extensions to try
    const fileExtensions = ["png", "jpg", "jpeg", "gif", "webp", "bmp"];

    for (const ext of fileExtensions) {
      const imgUrl = `/admin-profile-pics/${adminId}_profilepic.${ext}`;

      try {
        // Create a temporary image element to check if the file exists
        const img = new Image();
        img.src = imgUrl;

        // Wait for the image to load or fail
        await new Promise((resolve, reject) => {
          img.onload = () => {
            setProfilePicUrl(imgUrl);
            resolve();
          };
          img.onerror = () => reject();

          // Add a timeout to prevent hanging if the image takes too long
          setTimeout(reject, 1000);
        });

        // If we found a valid image, break the loop
        break;
      } catch (error) {
        // Continue to the next extension if this one fails
        continue;
      }
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        `${backendURL}/api/admins/logout`,
        {},
        { withCredentials: true }
      );

      localStorage.removeItem("admin");
      setAdmin(null);
      navigate("/");
    } catch (error) {
      console.error(
        "Logout failed:",
        error.response?.data?.message || error.message
      );
    }
  };

  const isActiveRoute = (route) => {
    return location.pathname === route;
  };

  const sidebarLinks = [
    {
      path: "/ManageEmployeeAccounts",
      name: "Manage Employee Accounts",
      icon: <User size={20} />,
    },
    {
      path: "/ManageAdminAccounts",
      name: "Manage Admin Accounts",
      icon: <User size={20} />,
    },
    {
      path: "/ManageEmployeeAttendance",
      name: "Manage Attendance",
      icon: <Clock size={20} />,
    },
    {
      path: "/ManageOvertime",
      name: "Manage Overtime Requests",
      icon: <ClockAlert size={20} />,
    },
    {
      path: "/ManageEmployeePayroll",
      name: "Manage Payrolls",
      icon: <PhilippinePeso size={20} />,
    },
  ];

  return (
    <div className="h-full overflow-hidden relative">
      {isMobile && (
        <button
          onClick={toggleVisibility}
          className="absolute top-2 right-2 z-50 bg-yellow-600 text-white p-1 rounded-full"
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      )}

      <aside
        className={`bg-gradient-to-b from-yellow-500 via-yellow-400 to-yellow-300 h-full py-6 px-4 flex flex-col shadow-xl transition-all duration-300 no-scrollbar ${
          isExpanded ? "w-[250px]" : "w-[70px]"
        }`}
      >
        <div
          className={`flex items-center gap-3 px-2 py-3 bg-yellow-200/50 rounded-lg mb-6 ${
            !isExpanded && "justify-center"
          }`}
        >
          {profilePicUrl ? (
            <img
              src={profilePicUrl}
              alt="Admin Profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-yellow-600"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
          ) : (
            <div className="w-10 h-10 flex items-center justify-center bg-yellow-600 text-white rounded-full border-2 border-yellow-600">
              <UserCircle size={24} />
            </div>
          )}
          {isExpanded && (
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-800 truncate">
                {admin?.firstName} {admin?.lastName}
              </p>
              <p className="text-xs text-gray-600 truncate mt-0.5">
                {admin?.email}
              </p>
            </div>
          )}
        </div>

        <div className="h-px bg-yellow-600/30 w-full my-4" />

        <nav className="flex-1 mt-2 overflow-y-auto no-scrollbar">
          <ul className="space-y-1">
            {sidebarLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActiveRoute(link.path)
                      ? "bg-yellow-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-yellow-200"
                  } ${!isExpanded && "justify-center px-2"}`}
                  title={!isExpanded ? link.name : ""}
                  onClick={isMobile ? toggleVisibility : undefined}
                >
                  <span className="flex items-center justify-center w-6">
                    {link.icon}
                  </span>
                  {isExpanded && <span>{link.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto">
          <a
            onClick={handleLogout}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-yellow-200 rounded-lg transition-all cursor-pointer ${
              !isExpanded && "justify-center px-2"
            }`}
            title={!isExpanded ? "Logout" : ""}
          >
            <span className="flex items-center justify-center w-6">
              <LogOut size={20} />
            </span>
            {isExpanded && <span>Logout</span>}
          </a>
        </div>
      </aside>
    </div>
  );
}
