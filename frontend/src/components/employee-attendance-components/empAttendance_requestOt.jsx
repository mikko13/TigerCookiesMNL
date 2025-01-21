import React from "react";

export default function EmpAttendanceRequestOt() {
  return (
    <div className="text-center">
      <h1 className="text-2xl font-semibold mb-6">Request Overtime</h1>
      <div className="max-w-md mx-auto">
        <div className="mb-4">
          <label
            htmlFor="overtime-hour"
            className="block text-gray-700 font-medium mb-2"
          >
            Input Overtime Hour
          </label>
          <input
            id="overtime-hour"
            type="number"
            placeholder="Enter hours"
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:outline-none"
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="overtime-note"
            className="block text-gray-700 font-medium mb-2"
          >
            Input Overtime Note
          </label>
          <textarea
            id="overtime-note"
            rows="4"
            placeholder="Enter your note"
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:outline-none"
          ></textarea>
        </div>
        <div className="flex space-x-4">
          <a href="./requestovertime">
            <button
              type="button"
              class="px-6 py-3 w-full text-sm bg-gray-700 hover:bg-gray-800 text-white rounded-md active:bg-gray-900 focus:ring-2 focus:ring-gray-900 transition-all"
            >
              Back
            </button>
          </a>
          <a href="./testing">
            <button
              type="button"
              className="px-6 py-3 w-full text-sm bg-yellow-400 hover:bg-yellow-500 text-white rounded-md active:bg-yellow-600 focus:ring-2 focus:ring-yellow-500 transition-all"
            >
              Request Overtime
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}
