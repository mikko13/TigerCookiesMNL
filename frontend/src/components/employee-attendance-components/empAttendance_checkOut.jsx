import React from "react";

export default function EmpAttendanceCheckOut() {
  return (
    <div className="text-center">
      {/* Submit Button */}
      <a href="./testing">
        <button
          type="button"
          className="px-6 py-3 mt-6 w-full text-sm bg-yellow-400 hover:bg-yellow-500 text-white rounded-md active:bg-yellow-600 focus:ring-2 focus:ring-yellow-500 transition-all"
        >
          Check Out
        </button>
      </a>

      {/* Back Button */}
      <a href="./forgotpasswordotp">
        <button
          type="button"
          className="px-6 py-3 mt-2 w-full text-sm bg-gray-700 hover:bg-gray-800 text-white rounded-md active:bg-gray-900 focus:ring-2 focus:ring-gray-900 transition-all"
        >
          Request Overtime
        </button>
      </a>
    </div>
  );
}
