import React, { useState, useEffect } from "react";
import ManageAttendanceMain from "./ManageAttendanceMain";
import AdminSidebar from "../../sidebarComponents/admin-sidebar/adminSidebar";
import Background from "../../images/background.png";
import { Search, Calendar, Plus, Menu, X, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

export default function ManageAttendance() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [sortOption, setSortOption] = useState("recent"); // Default sort: most recent date
  const [isFilterOpen, setIsFilterOpen] = useState(false);
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

  const toggleFilterDropdown = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleSortChange = (option) => {
    setSortOption(option);
    setIsFilterOpen(false);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDateChange = (e) => {
    setFilterDate(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterDate("");
    setSortOption("recent");
  };

  // Get label for the current sort option
  const getSortLabel = () => {
    switch (sortOption) {
      case "recent":
        return "Most Recent";
      case "oldest":
        return "Oldest First";
      case "name-asc":
        return "Name (A-Z)";
      case "name-desc":
        return "Name (Z-A)";
      case "early-in":
        return "Early Arrival First";
      case "late-in":
        return "Late Arrival First";
      case "long-hours":
        return "Longest Hours First";
      default:
        return "Most Recent";
    }
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
      {isMobile && !sidebarState.isVisible && (
        <button
          onClick={toggleSidebarVisibility}
          className="fixed top-4 left-0 z-50 bg-yellow-500 text-white p-2 rounded-r-md shadow-md transition-all duration-300"
          aria-label="Open sidebar"
        >
          <Menu size={24} />
        </button>
      )}

      {isMobile && sidebarState.isVisible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebarVisibility}
        />
      )}

      <div
        className={`transition-all duration-300 ease-in-out ${
          !sidebarState.isVisible
            ? "w-0 min-w-0 opacity-0 pointer-events-none"
            : isMobile
            ? "w-[250px] min-w-[250px]"
            : "w-[250px] min-w-[250px]"
        } ${isMobile ? "fixed h-full z-40" : "fixed h-screen z-30"}`}
      >
        {sidebarState.isVisible && (
          <AdminSidebar
            isExpanded={true}
            isMobile={isMobile}
            toggleVisibility={toggleSidebarVisibility}
          />
        )}
      </div>

      <main
        className={`flex-1 transition-all duration-300 ease-in-out overflow-y-auto ${
          isMobile ? "w-full" : sidebarState.isVisible ? "pl-[250px]" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center">
            <div className="ml-8 lg:ml-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Employee Attendance
              </h1>
              <p className="text-gray-600 mt-1">
                View and manage all employee attendance records
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search employee name"
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
                  onChange={handleDateChange}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              {/* Filter Dropdown */}
              <div className="relative">
                <button
                  onClick={toggleFilterDropdown}
                  className="flex items-center justify-between gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-md transition-colors duration-200 shadow-sm w-full sm:w-auto"
                >
                  <span className="text-gray-700">{getSortLabel()}</span>
                  <ChevronDown
                    size={16}
                    className={`text-gray-500 transition-transform ${
                      isFilterOpen ? "transform rotate-180" : ""
                    }`}
                  />
                </button>

                {isFilterOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    <div className="py-1">
                      <button
                        onClick={() => handleSortChange("recent")}
                        className={`block px-4 py-2 text-sm w-full text-left ${
                          sortOption === "recent"
                            ? "bg-yellow-50 text-yellow-700"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        Most Recent
                      </button>
                      <button
                        onClick={() => handleSortChange("oldest")}
                        className={`block px-4 py-2 text-sm w-full text-left ${
                          sortOption === "oldest"
                            ? "bg-yellow-50 text-yellow-700"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        Oldest First
                      </button>
                      <button
                        onClick={() => handleSortChange("name-asc")}
                        className={`block px-4 py-2 text-sm w-full text-left ${
                          sortOption === "name-asc"
                            ? "bg-yellow-50 text-yellow-700"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        Name (A-Z)
                      </button>
                      <button
                        onClick={() => handleSortChange("name-desc")}
                        className={`block px-4 py-2 text-sm w-full text-left ${
                          sortOption === "name-desc"
                            ? "bg-yellow-50 text-yellow-700"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        Name (Z-A)
                      </button>
                      <button
                        onClick={() => handleSortChange("early-in")}
                        className={`block px-4 py-2 text-sm w-full text-left ${
                          sortOption === "early-in"
                            ? "bg-yellow-50 text-yellow-700"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        Early Arrival First
                      </button>
                      <button
                        onClick={() => handleSortChange("late-in")}
                        className={`block px-4 py-2 text-sm w-full text-left ${
                          sortOption === "late-in"
                            ? "bg-yellow-50 text-yellow-700"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        Late Arrival First
                      </button>
                      <button
                        onClick={() => handleSortChange("long-hours")}
                        className={`block px-4 py-2 text-sm w-full text-left ${
                          sortOption === "long-hours"
                            ? "bg-yellow-50 text-yellow-700"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        Longest Hours First
                      </button>
                    </div>
                  </div>
                )}
              </div>

              
<Link
  to="/CreateEmployeeAttendance"
  className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition-colors duration-200 shadow-sm"
>
  <Plus size={18} />
  <span>New Record</span>
</Link>
            </div>
          </div>

          <div className="flex items-center my-4">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li aria-current="page">
                  <div className="flex items-center">
                    <span className="text-gray-500 text-sm font-medium">
                      Attendance
                    </span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>
          <ManageAttendanceMain
            searchTerm={searchTerm}
            filterDate={filterDate}
            sortOption={sortOption}
            setSearchTerm={setSearchTerm}
            setFilterDate={setFilterDate}
          />
        </div>
      </main>
    </div>
  );
}
