import React from "react";
import Sidebar from "./empAttendance_sidebar";
import Main from "./empAttendance_main"

export default function EmpAttendance() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-col min-h-screen bg-[#fefee6]">
        <div className="flex h-screen">
          <Sidebar />

          <div className="ml-[250px] flex-grow flex items-center justify-center">
            <Main />
          </div>
        </div>
      </div>
    </div>
  );
}
