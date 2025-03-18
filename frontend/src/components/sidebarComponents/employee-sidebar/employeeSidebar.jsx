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

export default function EmpAttendanceSideBar({
  isExpanded = true,
  toggleExpand,
  isMobile = false,
  toggleVisibility,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      checkProfilePicture(parsedUser.id);
    }
  }, []);

  const checkProfilePicture = async (userId) => {
    const fileExtensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp"];

    for (const ext of fileExtensions) {
      const imgUrl = `/employee-profile-pics/${userId}_profilepic.${ext}`;

      try {
        const img = new Image();
        img.src = imgUrl;

        await new Promise((resolve, reject) => {
          img.onload = () => {
            setProfilePicUrl(imgUrl);
            resolve();
          };
          img.onerror = () => reject();

          setTimeout(reject, 1000);
        });

        break;
      } catch (error) {
        continue;
      }
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        `${backendURL}/api/employees/logout`,
        {},
        { withCredentials: true }
      );

      localStorage.removeItem("user");
      setUser(null);
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
      path: "/ManageAccount",
      name: "Manage Account",
      icon: <User size={20} />,
    },
    {
      path: "/ManageAttendance",
      name: "Attendance",
      icon: <Clock size={20} />,
    },
    {
      path: "/Overtimerecords",
      name: "Overtime Requests",
      icon: <ClockAlert size={20} />,
    },
    {
      path: "/Payroll",
      name: "Payroll",
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
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-yellow-600"
              onError={(e) => {
                // If image fails to load, replace with user icon
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
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-600 truncate mt-0.5">
                {user?.email}
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

        {/* Logout Button */}
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
