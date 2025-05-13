import React, { useState, useEffect } from "react";
import UpdateAccountForm from "./UpdateAccountForm";
import AdminSidebar from "../../sidebarComponents/admin-sidebar/adminSidebar";
import Background from "../../images/background.png";
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";

export default function UpdateAccount() {
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
    <div className="flex min-h-screen bg-gray-50 overflow-hidden relative">
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.92)), url(${Background})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      />

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
        className={`fixed top-0 left-0 h-screen z-40 transition-all duration-300 ease-in-out ${
          !sidebarState.isVisible
            ? "w-0 min-w-0 opacity-0 pointer-events-none"
            : isMobile
            ? "w-[250px] min-w-[250px]"
            : "w-[250px] min-w-[250px]"
        }`}
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
        className={`relative z-10 min-h-screen w-full transition-all duration-300 ease-in-out ${
          !isMobile && sidebarState.isVisible ? "ml-[250px]" : "ml-0"
        }`}
      >
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center">
            <div className="ml-8 lg:ml-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Employee Management
              </h1>
              <p className="text-gray-600 mt-1">
                Update employee account details
              </p>
            </div>
          </div>

          <div className="flex items-center my-4">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li>
                  <div className="flex items-center">
                  <Link
  to="/ManageEmployeeAccounts"
  className="text-gray-700 hover:text-yellow-600 text-sm font-medium"
>
  Employees
</Link>
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
                      Update
                    </span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>

          <UpdateAccountForm />
        </div>
      </main>
    </div>
  );
}
