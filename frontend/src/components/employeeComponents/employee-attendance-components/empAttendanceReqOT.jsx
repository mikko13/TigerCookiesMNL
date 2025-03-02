import React, { useState } from "react";
import Request from "./empAttendance_requestOt";
import Sidebar from "../../sidebarComponents/employee-sidebar/employeeSidebar";

export default function EmpAttendanceReqOT() {
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
        className={`flex-grow flex items-center justify-center overflow-auto transition-all duration-300 ${
          isSidebarVisible ? "ml-[250px]" : "ml-0"
        }`}
      >
        <Request />
      </div>
    </div>
  );
}
