import React, { useState } from "react";
import Open from "./empAttendance_openCam";
import Sidebar from "../sidebar-components/employee-sidebar/employeeSidebar";
import SidebarToggleButton from "../sidebar-components/employee-sidebar/sidebar-toggle-button";

export default function EmpAttendance() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  return (
    <div className="flex h-screen">
      <div
        className={`transform ${
          isSidebarVisible ? "translate-x-0" : "-translate-x-[250px]"
        } transition-transform duration-300 fixed h-full z-10`}
      >
        <Sidebar />
      </div>

      <div
        className={`absolute z-50 top-10 transform -translate-y-1/2 ${
          isSidebarVisible ? "left-[240px]" : "-left-3"
        } transition-all duration-300`}
      >
        <SidebarToggleButton
          isSidebarVisible={isSidebarVisible}
          toggleSidebar={toggleSidebar}
        />
      </div>

      <div
        className={`flex-grow flex items-center justify-center overflow-auto transition-all duration-300 ${
          isSidebarVisible ? "ml-[250px]" : "ml-0"
        }`}
      >
        <Open />
      </div>
    </div>
  );
}
