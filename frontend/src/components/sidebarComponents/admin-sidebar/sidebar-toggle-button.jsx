import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function SidebarToggleButton({ isSidebarVisible, toggleSidebar }) {
  return (
    <button
      onClick={toggleSidebar}
      aria-label={isSidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
      className="h-10 w-10 flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-white rounded-full shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 z-50"
    >
      {isSidebarVisible ? (
        <ChevronLeft size={20} />
      ) : (
        <ChevronRight size={20} />
      )}
    </button>
  );
}