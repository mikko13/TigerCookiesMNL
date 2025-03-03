import React, { useState, useEffect } from "react";
import OpenCam from "./empAttendance_openCam_checkOut";
import Sidebar from "../../sidebarComponents/employee-sidebar/employeeSidebar";
import { Menu, X, ArrowLeft } from "lucide-react";

export default function EmpAttendance() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    // Check if we're on mobile on initial render
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Auto-hide sidebar on mobile
      if (window.innerWidth < 768) {
        setIsSidebarVisible(false);
      } else {
        setIsSidebarVisible(true);
      }
    };

    // Run the check immediately
    checkMobile();

    // Add resize listener
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile sidebar overlay */}
      {isMobile && isSidebarVisible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`${
          isMobile
            ? `fixed inset-y-0 left-0 z-30 ${
                isSidebarVisible ? "translate-x-0" : "-translate-x-full"
              }`
            : `relative ${
                isSidebarVisible ? "translate-x-0" : "-translate-x-full"
              }`
        } transition-transform duration-300 h-full shadow-lg`}
      >
        <Sidebar
          isExpanded={isExpanded}
          toggleExpand={toggleExpand}
          isMobile={isMobile}
          toggleVisibility={toggleSidebar}
        />
      </div>

      {/* Main content area */}
      <div className="flex flex-col flex-grow overflow-auto">
        {/* Top navigation bar */}
        <header className="bg-white md:hidden shadow-sm h-16 flex items-center justify-between px-4 sticky top-0 z-10">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-full hover:bg-yellow-100 transition-colors"
              aria-label={isSidebarVisible ? "Hide sidebar" : "Show sidebar"}
            >
              {isSidebarVisible ? (
                isMobile ? (
                  <X size={24} />
                ) : (
                  <ArrowLeft size={24} />
                )
              ) : (
                <Menu size={24} />
              )}
            </button>
          </div>
        </header>

        {/* Main content */}
        <main
          className={`flex-grow flex items-center justify-center p-4 transition-all duration-300 ${
            isMobile ? "" : isExpanded ? "ml-0" : "ml-0"
          }`}
        >
          <OpenCam />
        </main>
      </div>
    </div>
  );
}
