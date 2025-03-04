import React, { useState } from "react";
import Request from "./empAttendance_requestOt";
import Sidebar from "../../sidebarComponents/employee-sidebar/employeeSidebar";
import { Menu } from "lucide-react";

export default function EmpAttendanceReqOT() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileSidebarVisible, setIsMobileSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarVisible(!isMobileSidebarVisible);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="hidden md:block h-full">
        <Sidebar isExpanded={isSidebarExpanded} toggleExpand={toggleSidebar} />
      </div>

      {isMobileSidebarVisible && (
        <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="w-[250px] h-full">
            <Sidebar
              isExpanded={true}
              isMobile={true}
              toggleVisibility={toggleMobileSidebar}
            />
          </div>
        </div>
      )}

      <div
        className={`flex-grow transition-all duration-300 ${
          isSidebarExpanded ? "md:pl-[0px]" : "md:pl-[70px]"
        }`}
      >
        <div className="md:hidden bg-yellow-400 p-4 flex items-center">
          <button
            onClick={toggleMobileSidebar}
            className="text-white p-1 rounded-md hover:bg-yellow-500"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-white text-xl font-semibold ml-4">
            Request Overtime
          </h1>
        </div>

        <div className="p-6 max-w-4xl mx-auto">
          <Request />
        </div>
      </div>
    </div>
  );
}
