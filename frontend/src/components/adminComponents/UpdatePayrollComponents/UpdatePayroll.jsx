import React, { useState, useEffect } from "react";
import UpdatePayrollForm from "./UpdatePayrollForm";
import AdminSidebar from "../../sidebarComponents/admin-sidebar/adminSidebar";
import Background from "../../images/background.png";
import { Menu, DollarSign } from "lucide-react";

export default function UpdatePayroll() {
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
          isExpanded: false,
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

  const toggleSidebarExpand = () => {
    setSidebarState((prev) => ({
      ...prev,
      isExpanded: !prev.isExpanded,
    }));
  };

  return (
    <div
      className="flex min-h-screen bg-gray-50 overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.92)), url(${Background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div
        className={`h-screen overflow-hidden transition-all duration-300 ease-in-out ${
          !sidebarState.isVisible
            ? "w-9 min-w-0"
            : sidebarState.isExpanded
            ? "w-[250px] min-w-[250px]"
            : "w-[70px] min-w-[70px]"
        } ${isMobile ? "fixed h-full z-40" : "fixed"}`}
      >
        {sidebarState.isVisible && (
          <AdminSidebar
            isExpanded={sidebarState.isExpanded}
            toggleExpand={toggleSidebarExpand}
          />
        )}
      </div>

      <main
        className={`flex-1 transition-all duration-300 ease-in-out overflow-y-auto ${
          isMobile ? "pt-20 w-full" : "pt-6"
        } px-4 sm:px-6 lg:px-8 pb-10 ${
          sidebarState.isVisible && !isMobile
            ? sidebarState.isExpanded
              ? "ml-[250px]"
              : "ml-[70px]"
            : ""
        }`}
      >
        {isMobile && (
          <button
            onClick={toggleSidebarVisibility}
            className="mb-4 p-2 bg-yellow-500 rounded-md text-white"
            aria-label="Toggle Sidebar"
          >
            <Menu size={24} />
          </button>
        )}

        <div className="max-w-7xl mx-auto">
          {!isMobile && (
            <>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <DollarSign className="mr-2" size={28} />
                Payroll Management
              </h1>
              <p className="text-gray-600 mt-1">
                Update employee payroll information
              </p>
            </>
          )}

          <div className="flex items-center justify-between my-4">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li>
                  <div className="flex items-center">
                    <a
                      href="/ManagePayroll"
                      className="text-gray-700 hover:text-yellow-600 text-sm font-medium"
                    >
                      Payroll
                    </a>
                  </div>
                </li>
                <li aria-current="page">
                  <div className="flex items-center">
                    <svg
                      className="w-3 h-3 text-gray-400 mx-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
                    </svg>
                    <span className="text-gray-500 text-sm font-medium">
                      Update Payroll
                    </span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>

          <UpdatePayrollForm />
        </div>
      </main>
    </div>
  );
}