import React, { useState } from "react";

export default function EmpAttendanceSelShiftt() {
  const [selectedShift, setSelectedShift] = useState("");
  const handleShiftChange = (event) => {
    setSelectedShift(event.target.value);
  };
  return (
    <div className="text-center">
      <h1 className="text-2xl font-semibold mb-6">Select Shift Time</h1>
      <select
        value={selectedShift}
        onChange={handleShiftChange}
        className="mb-6 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
      >
        <option value="" disabled>
          Select an option
        </option>
        <option value="morning">Morning Shift</option>
        <option value="afternoon">Afternoon Shift</option>
        <option value="night">Night Shift</option>
      </select>

      <div>
        <p className="text-gray-600 mb-4">
          Selected Shift: {selectedShift || "None"}
        </p>
        <a href="./opencam">
          <button
            type="button"
            className="px-6 py-3 mt-6 w-full text-sm bg-yellow-400 hover:bg-yellow-500 text-white rounded-md active:bg-yellow-600 focus:ring-2 focus:ring-yellow-500 transition-all"
          >
            Open Camera
          </button>
        </a>
        <a href="./checkin">
          <button
            type="button"
            className="px-6 py-3 mt-2 w-full text-sm bg-gray-700 hover:bg-gray-800 text-white rounded-md active:bg-gray-900 focus:ring-2 focus:ring-gray-900 transition-all"
          >
            Back
          </button>
        </a>
      </div>
    </div>
  );
}
