import { useState } from "react";
import Form from "./adminUpdateAttendance_form";
import Sidebar from "../sidebar-components/admin-sidebar/adminSidebar";
import SidebarToggleButton from "../sidebar-components/admin-sidebar/sidebar-toggle-button";
import Background from "../images/background.png";

export default function AdminUpdateAttendance() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };
  return (
    <div
      className="flex h-screen"
      style={{
        backgroundImage: `url(${Background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className={`transform ${
          isSidebarVisible ? "translate-x-0" : "-translate-x-[250px]"
        } transition-transform duration-300 fixed h-full z-50`}
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
        className={`flex-grow flex justify-center overflow-auto transition-all duration-300 ${
          isSidebarVisible ? "ml-[200px]" : "ml-0"
        }`}
      >
        <Form />
      </div>
    </div>
  );
}
