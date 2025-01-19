import React from "react";
import Sidebar from "./empAttendance_sidebar";
import Header from "./empAttendance_header";

export default function EmpAttendance() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-col min-h-screen bg-[#fefee6]">
        <Header />
        <div className="flex h-screen">
          <Sidebar />

          <div className="ml-[250px] flex-grow flex flex-col justify-center items-center px-4">
            <h1 className="text-2xl font-semibold mb-6">
              Please Check In to Access!
            </h1>
            <div className="max-w-md w-full">
              <button
                type="button"
                className="px-6 py-3 w-full text-sm bg-yellow-400 hover:bg-yellow-500 text-white rounded-md active:bg-yellow-600 focus:ring-2 focus:ring-yellow-500 transition-all"
                onClick={() => alert("Check In button clicked!")}
              >
                Check In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
