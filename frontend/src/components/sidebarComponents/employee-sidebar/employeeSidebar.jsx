import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { User, Clock, PhilippinePeso, LogOut, X } from "lucide-react";
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

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

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

  const profilePicPath = `/employee-profile-pics/${user?.id}_profilepic.jpg`;

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
      path: "/Payroll",
      name: "Payroll",
      icon: <PhilippinePeso size={20} />,
    },
  ];

  return (
    <div className="h-full overflow-hidden relative">
      {/* Close button for mobile */}
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
          <img
            src={profilePicPath}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover border-2 border-yellow-600"
          />
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