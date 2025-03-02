import { useState } from "react";
import Form from "./UpdateAccountForm";
import Sidebar from "../../sidebarComponents/admin-sidebar/adminSidebar";
import Background from "../../images/background.png";

export default function CreateAccount() {
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
        className={`flex-grow flex justify-center overflow-auto transition-all duration-300 ${
          isSidebarVisible ? "ml-[200px]" : "ml-0"
        }`}
      >
        <Form />
      </div>
    </div>
  );
}
