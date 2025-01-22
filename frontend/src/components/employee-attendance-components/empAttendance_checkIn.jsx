import React from "react";

export default function EmpAttendanceCheckIn() {
  return (
    <div className="text-center">
      <h1 className="text-2xl font-semibold mb-6">Attendance</h1>
      <a href="./testing">
        <button
          type="button"
          className="px-6 py-3 mt-6 w-full text-sm bg-yellow-400 hover:bg-yellow-500 text-white rounded-md active:bg-yellow-600 focus:ring-2 focus:ring-yellow-500 transition-all"
        >
          Check Out
        </button>
      </a>
    </div>
  );
}
