import React from "react";

export default function EmpAttendanceOpenCam() {
  return (
    <div className="text-center">
      <h1 className="text-2xl font-semibold mb-4">Facial Recognition</h1>
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
          Upload Picture
        </button>
        <a href="./shift">
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
