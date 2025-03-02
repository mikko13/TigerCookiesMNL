import { useState } from "react";
import CreatePayrollForm from "./CreatePayrollForm";
import Sidebar from "../../sidebarComponents/admin-sidebar/adminSidebar";
import SidebarToggleButton from "../../sidebarComponents/admin-sidebar/adminSidebar";
import Background from "../../images/background.png";

export default function CreatePayroll() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`transform ${
          isSidebarVisible ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 fixed h-full z-30 shadow-lg`}
      >
        <Sidebar />
      </div>

      {/* Toggle Button */}
      <div
        className={`fixed z-40 top-6 ${
          isSidebarVisible ? "left-[250px]" : "left-4"
        } transition-all duration-300`}
      >
        <SidebarToggleButton
          isSidebarVisible={isSidebarVisible}
          toggleSidebar={toggleSidebar}
        />
      </div>

      {/* Main Content */}
      <div
        className={`flex-grow transition-all duration-300 ${
          isSidebarVisible ? "ml-[250px]" : "ml-0"
        } p-6 overflow-auto bg-pattern`}
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url(${Background})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="container mx-auto">
          <div className="flex items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Employee Management
            </h1>
            <span className="mx-4 text-gray-300">|</span>
            <div className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
              Add New Payroll
            </div>
          </div>

          <CreatePayrollForm />
        </div>
      </div>
    </div>
  );
}
