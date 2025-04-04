import React, { useState, useEffect } from "react";
import Sidebar from "../../sidebarComponents/employee-sidebar/employeeSidebar";
import CheckIn from "./empAttendance_checkIn";
import Background from "../../images/background.png";
import { Menu } from "lucide-react";

export default function EmpAttendanceCheckInPage() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);

      if (mobile) {
        setIsSidebarVisible(false);
      } else {
        setIsSidebarVisible(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  return (
    <div
      className="flex min-h-screen bg-gray-50 relative"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.92)), url(${Background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {isMobile && !isSidebarVisible && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-0 z-50 bg-yellow-500 text-white p-2 rounded-r-md shadow-md transition-all duration-300"
          aria-label="Open sidebar"
        >
          <Menu size={24} />
        </button>
      )}

      {isMobile && isSidebarVisible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        />
      )}

      <div
        className={`transition-all duration-300 ease-in-out h-screen ${
          !isSidebarVisible
            ? "w-0 min-w-0 opacity-0 pointer-events-none"
            : "w-[250px] min-w-[250px]"
        } ${isMobile ? "fixed z-40" : "sticky top-0 left-0"}`}
      >
        {isSidebarVisible && (
          <Sidebar
            isExpanded={true}
            isMobile={isMobile}
            toggleVisibility={toggleSidebar}
          />
        )}
      </div>

      <main
        className={`flex-1 transition-all duration-300 ease-in-out flex items-center justify-center p-4 overflow-y-auto ${
          isMobile ? "w-full" : ""
        }`}
      >
        <CheckIn />
      </main>
    </div>
  );
}
