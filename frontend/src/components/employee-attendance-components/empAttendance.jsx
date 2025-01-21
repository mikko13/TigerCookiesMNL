import React, { useState } from "react";
import Sidebar from "./empAttendance_sidebar";
import Main from "./empAttendance_main";
import SidebarToggleButton from "./sidebar-toggle-button";

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
        className={`absolute z-50 top-1/2 transform -translate-y-1/2 ${
          isSidebarVisible ? "left-[230px]" : "-left-5"
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
        <Main />
      </div>
    </div>
  );
}
