import React, { useState, useEffect } from "react";
import ManageAccountMain from "./ManageAccountMain";
import AdminSidebar from "../../sidebarComponents/admin-sidebar/adminSidebar";
import Background from "../../images/background.png";
import { Search, Calendar, Plus, Menu, X } from "lucide-react";

export default function ManageAccount() {
  const [searchTerm, setSearchTerm] = useState("");
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
                Employee Accounts
              </h1>
              <p className="text-gray-600 mt-1">
                View and manage all employee accounts
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search employee"
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              <a
                href="/CreateEmployeeAccount"
                className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition-colors duration-200 shadow-sm"
              >
                <Plus size={18} />
                <span>New Account</span>
              </a>
            </div>
          </div>

          <div className="flex items-center my-4">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li aria-current="page">
                  <div className="flex items-center">
                    <span className="text-gray-500 text-sm font-medium">
                      Accounts
                    </span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>
          <ManageAccountMain searchTerm={searchTerm} />
        </div>
      </main>
    </div>
  );
}
