import React from "react";

export default function AdminManageAccountMain() {
  return (
    <div className="relative mx-4 mt-4 overflow-hidden text-gray-700 bg-white rounded-none bg-clip-border">
      <div className="flex flex-col justify-between gap-8 mb-4 md:flex-row md:items-center">
        <div>
          <h5 className="block font-sans text-md md:text-xl antialiased font-semibold leading-snug tracking-normal text-blue-gray-900">
            Your Attendance Record
          </h5>
          <p className="block mt-1 font-sans text-sm md:text-base antialiased font-normal leading-relaxed text-gray-700">
            These are details about the your attendance records
          </p>
        </div>
        <div className="flex w-full gap-2 shrink-0 md:w-max">
          <div className="w-full md:w-72"></div>
          <a
            href="/CheckIn"
            className="flex select-none items-center gap-3 rounded-lg bg-yellow-400 hover:bg-yellow-500 py-1 px-2 md:py-2 md:px-4 text-center align-middle font-sans text-[10px] md:text-xs font-bold uppercase text-white transition-all focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none sm:py-1 sm:px-3 sm:text-xs"
          >
            Check In
          </a>
          <a
            href="/CheckOut"
            className="flex select-none items-center gap-3 rounded-lg bg-yellow-400 hover:bg-yellow-500 py-1 px-2 md:py-2 md:px-4 text-center align-middle font-sans text-[10px] md:text-xs font-bold uppercase text-white transition-all focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none sm:py-1 sm:px-3 sm:text-xs"
          >
            Check Out
          </a>
        </div>
      </div>
    </div>
  );
}
