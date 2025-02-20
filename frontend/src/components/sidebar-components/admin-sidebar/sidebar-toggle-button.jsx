import React from "react";

export default function SidebarToggleButton({
  isSidebarVisible,
  toggleSidebar,
}) {
  return (
    <button
      onClick={toggleSidebar}
      className="left-4 w-6 h-16 flex items-center justify-center bg-[#ecb609] rounded-[5px] transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className={`w-5 h-5 transform transition-transform ${
          isSidebarVisible ? "rotate-180" : "rotate-0"
        }`}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 19.5L8.25 12l7.5-7.5"
        />
      </svg>
    </button>
  );
}
