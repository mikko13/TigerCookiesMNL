import React, { useState } from "react";

export default function AdminManageAccountHeader({ setSearchQuery }) {
  const [query, setQuery] = useState("");

  const handleSearchChange = (e) => {
    setQuery(e.target.value);
    setSearchQuery(e.target.value);
  };

  return (
    <div className="relative mx-4 mt-4 overflow-hidden text-gray-700 bg-white rounded-none bg-clip-border">
      <div className="flex flex-col justify-between gap-8 mb-4 md:flex-row md:items-center">
        <div>
          <h5 className="block font-sans text-md md:text-xl antialiased font-semibold leading-snug tracking-normal text-blue-gray-900">
            Manage Employee Accounts
          </h5>
          <p className="block mt-1 font-sans text-sm md:text-base antialiased font-normal leading-relaxed text-gray-700">
            These are details about the employees
          </p>
        </div>
        <div className="flex w-full gap-2 shrink-0 md:w-max">
          <div className="w-full md:w-72">
            <div className="relative h-10 w-full min-w-[200px]">
              <input
                type="text"
                value={query}
                onChange={handleSearchChange}
                className="peer h-full w-full rounded-[7px] border border-blue-gray-200 border-t-transparent bg-transparent px-3 py-2.5 !pr-9 font-sans text-sm font-normal text-blue-gray-700 outline-none transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900"
                placeholder="Search..."
              />
              <div className="absolute grid w-5 h-5 top-2/4 right-3 -translate-y-2/4 place-items-center text-blue-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  ></path>
                </svg>
              </div>
            </div>
          </div>
          <a
            href="/CreateAccount"
            className="flex select-none items-center gap-3 rounded-lg bg-yellow-400 hover:bg-yellow-500 py-1 px-2 md:py-2 md:px-4 text-center align-middle font-sans text-[10px] md:text-xs font-bold uppercase text-white transition-all"
          >
            Create Account
          </a>
        </div>
      </div>
    </div>
  );
}
