import React, { useState, useEffect } from "react";
import Sidebar from "../../sidebarComponents/employee-sidebar/employeeSidebar";
import CheckOut from "./empAttendance_checkOut";
import Background from "../../images/background.png";
import { Menu } from "lucide-react";

export default function EmpAttendanceCheckOutPage() {
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
      className="flex min-h-screen bg-gray-50 relative overflow-hidden"
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
          className="fixed top-4 left-0 z-50 bg-blue-500 text-white p-2 rounded-r-md shadow-md transition-all duration-300"
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
        className={`transition-all duration-300 ease-in-out ${
          !isSidebarVisible
            ? "w-0 min-w-0 opacity-0 pointer-events-none"
            : "w-[250px] min-w-[250px]"
        } ${isMobile ? "fixed h-full z-40" : "relative h-screen"}`}
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
        className={`flex-1 transition-all duration-300 ease-in-out flex items-center justify-center p-4 ${
          isMobile ? "w-full" : ""
        }`}
      >
        <CheckOut />
      </main>
    </div>
  );
}