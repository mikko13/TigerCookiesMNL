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

  const getFilteredPeriods = () => {
    const today = new Date();
    const year = today.getFullYear();
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    return [
      `${monthNames[today.getMonth()]} 5, ${year}`,
      `${monthNames[today.getMonth()]} 20, ${year}`,
      `${monthNames[today.getMonth() - 1]} 5, ${year}`,
      `${monthNames[today.getMonth() - 1]} 20, ${year}`,
    ];
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);

      if (mobile) {
        setSidebarState({
          isVisible: false,
          isExpanded: true,
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
            : "w-[250px] min-w-[250px]"
        } ${isMobile ? "fixed h-full z-40" : "relative h-screen"}`}
      >
        {sidebarState.isVisible && (
          <EmployeeSidebar
            isExpanded={true}
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
                  <option value="">All Pay Periods</option>
                  {getFilteredPeriods().map((period) => (
                    <option key={period} value={period}>
                      {period}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-md shadow-md mb-4">
            <p className="text-gray-600 text-sm">
              Next payroll processing: <strong>{getNextPayrollDate()}</strong>
            </p>
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
