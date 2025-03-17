import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EmployeePayrollMain from "./EmployeePayrollMain";
import EmployeeSidebar from "../../sidebarComponents/employee-sidebar/employeeSidebar";
import Background from "../../images/background.png";
import { Search, Calendar, Menu, Download } from "lucide-react";

export default function EmployeePayroll() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("");
  const [sidebarState, setSidebarState] = useState({
    isVisible: true,
    isExpanded: true,
  });
  const [isMobile, setIsMobile] = useState(false);

  // Generate periods for current and future years
  const generatePayPeriods = () => {
    const periods = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Generate periods for the current year and next 2 years
    for (let year = currentYear; year <= currentYear + 2; year++) {
      // For each month of the year
      // If it's the current year, start from the current month
      const startMonth = year === currentYear ? currentMonth : 0;
      for (let month = startMonth; month <= 11; month++) {
        const monthName = new Date(year, month, 1).toLocaleString("default", {
          month: "long",
        });

        // First half of the month (1-15)
        periods.push(`${monthName} 1-15, ${year}`);

        // Second half of the month (16-end)
        periods.push(
          `${monthName} 16-${new Date(year, month + 1, 0).getDate()}, ${year}`
        );

      }
    }

    return periods;
  };

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

  const handleViewAllPayslips = () => {
    navigate("/all-payslips");
  };

  const payPeriods = generatePayPeriods();

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
                My Payroll
              </h1>
              <p className="text-gray-600 mt-1">
                View future payroll schedules and download payslips
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar size={18} className="text-gray-400" />
                </div>
                <select
                  value={filterPeriod}
                  onChange={(e) => setFilterPeriod(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
                >
                  <option value="">All Future Periods</option>
                  {payPeriods.map((period, index) => (
                    <option key={index} value={period}>
                      {period}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center my-4">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li aria-current="page">
                  <div className="flex items-center">
                    <span className="text-gray-500 text-sm font-medium">
                      My Payroll
                    </span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>

          <EmployeePayrollMain
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterPeriod={filterPeriod}
            setFilterPeriod={setFilterPeriod}
          />
        </div>
      </main>
    </div>
  );
}
