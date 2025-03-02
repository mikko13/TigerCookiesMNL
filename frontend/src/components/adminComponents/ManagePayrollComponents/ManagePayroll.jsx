import React, { useState } from "react";
import Main from "./ManagePayrollMain";
import Sidebar from "../../sidebarComponents/admin-sidebar/adminSidebar";

export default function ManagePayroll() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  return (
    <div className="flex h-screen">
      <div
        className={`transform ${
          isSidebarVisible ? "translate-x-0" : "-translate-x-[250px]"
        } transition-transform duration-300 fixed h-full`}
      >
        <Sidebar />
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
