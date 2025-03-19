import React, { useState, useEffect } from "react";
import AdminSidebar from "../../sidebarComponents/admin-sidebar/adminSidebar";
import Background from "../../images/background.png";
import { Search, Calendar, Plus, Menu, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import ManagePayrollMain from "./ManagePayrollMain";

export default function ManagePayroll() {
  const [sidebarState, setSidebarState] = useState({
    isVisible: true,
    isExpanded: true,
  });
  const [isMobile, setIsMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);

      setSidebarState((prev) => ({
        ...prev,
        isVisible: !mobile,
      }));
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

  const getNextPayrollDate = () => {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth();
    const year = today.getFullYear();

    let nextPayroll = new Date(year, month, day < 5 ? 5 : 20);
    if (day >= 20) {
      nextPayroll = new Date(year, month + 1, 5);
    }

    return nextPayroll.toDateString();
  };

  // Function to generate only payroll periods on the 5th and 20th
  const getFilteredPeriods = () => {
    const today = new Date();
    const year = today.getFullYear();
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    return [
      `${monthNames[today.getMonth()]} 5, ${year}`,
      `${monthNames[today.getMonth()]} 20, ${year}`,
      `${monthNames[today.getMonth() - 1]} 5, ${year}`,
      `${monthNames[today.getMonth() - 1]} 20, ${year}`
    ];
  };

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-hidden relative">
      {/* Background */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.92)), url(${Background})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      />

      {/* Mobile Sidebar Toggle */}
      {isMobile && !sidebarState.isVisible && (
        <button
          onClick={toggleSidebarVisibility}
          className="fixed top-4 left-0 z-50 bg-yellow-500 text-white p-2 rounded-r-md shadow-md"
          aria-label="Open sidebar"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen z-40 transition-all duration-300 ease-in-out ${
          sidebarState.isVisible ? "w-[250px]" : "w-0 opacity-0 pointer-events-none"
        }`}
      >
        {sidebarState.isVisible && (
          <AdminSidebar isExpanded={true} isMobile={isMobile} toggleVisibility={toggleSidebarVisibility} />
        )}
      </div>

      {/* Main Content */}
      <main className={`relative z-10 min-h-screen w-full transition-all duration-300 ${!isMobile && sidebarState.isVisible ? "ml-[250px]" : "ml-0"}`}>
        <div className="max-w-7xl mx-auto p-4">
          {/* Page Title */}
          <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center">
            <div className="ml-8 lg:ml-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Employee Payroll</h1>
              <p className="text-gray-600 mt-1">View and manage all employee payroll records</p>
            </div>

            {/* Filters & Controls */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search employee name"
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              {/* Pay Period Filter */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar size={18} className="text-gray-400" />
                </div>
                <select
                  value={filterPeriod}
                  onChange={(e) => setFilterPeriod(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
                >
                  <option value="">All Pay Periods</option>
                  {getFilteredPeriods().map((period) => (
                    <option key={period} value={period}>
                      {period}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payroll Status Filter */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter size={18} className="text-gray-400" />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
                >
                  <option value="">All Statuses</option>
                  <option value="Published">Published</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              {/* New Payroll Button */}
              <Link
                to="/CreateEmployeePayroll"
                className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md shadow-sm"
              >
                <Plus size={18} />
                <span>New Payroll</span>
              </Link>
            </div>
          </div>

          {/* Next Payroll Date Display */}
          <div className="bg-white p-3 rounded-md shadow-md mb-4">
            <p className="text-gray-600 text-sm">
              Next payroll processing: <strong>{getNextPayrollDate()}</strong>
            </p>
          </div>

          {/* Payroll Management Main Component */}
          <ManagePayrollMain searchTerm={searchTerm} filterPeriod={filterPeriod} filterStatus={filterStatus} />
        </div>
      </main>
    </div>
  );
}
