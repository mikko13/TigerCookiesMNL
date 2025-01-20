import React from "react";

export default function EmpAttendanceMain() {
  return (
    <div className="text-center">
      <h1 className="text-2xl font-semibold mb-4">
        Please Check In to Access!
      </h1>
      <div className="mb-6">
        <img
          src=""
          alt="pic ng employee"
          className="mx-auto w-auto h-80 object-cover rounded-md border-4 border-gray-300"
        />
      </div>
      <div className="max-w-md w-full">
        <button
          type="button"
          className="px-6 py-3 w-full text-sm bg-yellow-400 hover:bg-yellow-500 text-white rounded-md active:bg-yellow-600 focus:ring-2 focus:ring-yellow-500 transition-all"
        >
          Check In
        </button>
      </div>
    </div>
  );
}
