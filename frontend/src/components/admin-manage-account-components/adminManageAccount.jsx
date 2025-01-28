import React, { useState } from "react";
import Main from "./adminManageAccount_Main";
import Sidebar from "../sidebar-components/admin-sidebar/adminSidebar";
import SidebarToggleButton from "../sidebar-components/admin-sidebar/sidebar-toggle-button";

export default function AdminManageAccount() {
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
        <Main />
      </div>
    </div>
  );
}
