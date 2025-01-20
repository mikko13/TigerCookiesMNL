import React from "react";

export default function SidebarToggleButton({
  isSidebarVisible,
  toggleSidebar,
}) {
  return (
    <button
      onClick={toggleSidebar}
      className="fixed top-4 left-4 z-20 w-10 h-10 flex items-center justify-center bg-yellow-400 rounded-full shadow-md hover:bg-yellow-500 transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className={`w-5 h-5 transform transition-transform ${
          isSidebarVisible ? "rotate-0" : "rotate-180"
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
