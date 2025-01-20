import React from "react";
import Logo from "../images/logo.png";

export default function EmpAttendanceSideBar() {
  return (
    <nav className="bg-gradient-to-b from-yellow-500 via-yellow-400 to-yellow-300 h-screen fixed top-0 left-0 min-w-[250px] py-6 px-4 font-[sans-serif] tracking-wide overflow-auto shadow-lg shadow-gray-500/50">
      <div className="flex justify-center mb-6">
        <img src={Logo} alt="logo" className="w-[140px]" />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <img
          src="#"
          alt="Profile"
          className="w-10 h-10 rounded-full border-2 border-gray-600"
        />
        <div>
          <p className="text-sm text-gray-800">pangalan mo!</p>
          <p className="text-xs text-gray-500 mt-0.5">email mo!</p>
        </div>
      </div>

      <hr className="my-6 border-gray-500" />

      <ul className="space-y-3">
        <li>
          <a
            href="#"
            className="text-gray-800 text-sm flex items-center hover:bg-yellow-300 rounded px-4 py-3 transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6 mr-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
            <span>Manage Accounts</span>
          </a>
        </li>
        <li>
          <a
            href="#"
            className="text-gray-800 text-sm flex items-center hover:bg-yellow-300 rounded px-4 py-3 transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6 mr-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            <span>Manage Attendance</span>
          </a>
        </li>
        <li>
          <a
            href="#"
            className="text-gray-800 text-sm flex items-center hover:bg-yellow-300 rounded px-4 py-3 transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6 mr-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            <span>Manage Payrolls</span>
          </a>
        </li>
      </ul>

      <div className="absolute bottom-6 left-4 right-4">
        <a
          href="#logout"
          className="text-gray-800 text-sm flex items-center hover:bg-yellow-200 rounded px-4 py-3 transition-all"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6 mr-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25a2.25 2.25 0 0 0-2.25-2.25h-6a2.25 2.25 0 0 0-2.25 2.25v13.5a2.25 2.25 0 0 0 2.25 2.25h6a2.25 2.25 0 0 0 2.25-2.25V15m4.5-3h-9m0 0 3-3m-3 3 3 3"
            />
          </svg>
          <span>Logout</span>
        </a>
      </div>
    </nav>
  );
}
