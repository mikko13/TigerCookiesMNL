import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EmployeeManageAttendanceMain from "./employeeManageAttendance_Main";
import EmployeeSidebar from "../../sidebarComponents/employee-sidebar/employeeSidebar";
import Background from "../../images/background.png";
import { Search, Calendar, Menu, X, LogIn, LogOut } from "lucide-react";

export default function EmployeeManageAttendance() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [sidebarState, setSidebarState] = useState({
    isVisible: true,
    isExpanded: true,
  });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);

      if (mobile) {
        setSidebarState({
          isVisible: false,
          isExpanded: true, // Keep it fully expanded when it is opened on mobile
        });
      } else {
        setSidebarState({
          isVisible: true,
          isExpanded: true,
        });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebarVisibility = () => {
    setSidebarState((prev) => ({
      ...prev,
      isVisible: !prev.isVisible,
    }));
  };

  const handleCheckIn = () => {
    navigate("/checkin");
  };

  const handleCheckOut = () => {
    navigate("/checkout");
  };

  return (
    <div
      className="flex min-h-screen bg-gray-50 overflow-hidden relative"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.92)), url(${Background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Mobile sidebar toggle button that peeks from the left */}
      {isMobile && !sidebarState.isVisible && (
        <button
          onClick={toggleSidebarVisibility}
          className="fixed top-4 left-0 z-50 bg-yellow-500 text-white p-2 rounded-r-md shadow-md transition-all duration-300"
          aria-label="Open sidebar"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Overlay for mobile when sidebar is open */}
      {isMobile && sidebarState.isVisible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebarVisibility}
        />
      )}

      {/* Sidebar */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          !sidebarState.isVisible
            ? "w-0 min-w-0 opacity-0 pointer-events-none"
            : "w-[250px] min-w-[250px]"
        } ${isMobile ? "fixed h-full z-40" : "relative h-screen"}`}
      >
        {sidebarState.isVisible && (
          <EmployeeSidebar
            isExpanded={true} // Always keep it expanded when visible
            isMobile={isMobile}
            toggleVisibility={toggleSidebarVisibility}
          />
        )}
      </div>

      <main
        className={`flex-1 transition-all duration-300 ease-in-out overflow-y-auto ${
          isMobile ? "w-full" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center">
            <div className="ml-8 lg:ml-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                My Attendance
              </h1>
              <p className="text-gray-600 mt-1">
                View your attendance records and history
              </p>
            </div>

            {/* Check In and Check Out buttons */}
            <div className="flex gap-3 justify-center md:justify-end ml-8 lg:ml-0">
              <button
                onClick={handleCheckIn}
                className="flex items-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-colors duration-200"
              >
                <LogIn size={18} className="mr-2" />
                Check In
              </button>
              <button
                onClick={handleCheckOut}
                className="flex items-center bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-colors duration-200"
              >
                <LogOut size={18} className="mr-2" />
                Check Out
              </button>
            </div>

            {/* Search and filter controls - responsive layout */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search records"
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar size={18} className="text-gray-400" />
                </div>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center my-4">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li aria-current="page">
                  <div className="flex items-center">
                    <span className="text-gray-500 text-sm font-medium">
                      My Attendance
                    </span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>

          <EmployeeManageAttendanceMain
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterDate={filterDate}
            setFilterDate={setFilterDate}
          />
        </div>
      </main>
    </div>
  );
}