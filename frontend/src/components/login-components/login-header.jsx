import React from "react";
import Logo from "../images/logo.png";

export default function loginHeader() {
  return (
    <header className="flex items-center w-full px-4 sm:px-8 min-h-[80px] bg-white tracking-wide sticky top-0 shadow-[rgba(0,0,0,0.1)_-4px_9px_25px_-6px] font-[sans-serif]">
      <div className="relative w-full">
        <div className="max-w-screen-xl w-full mx-auto flex items-center gap-20">
          <img src={Logo} alt="logo" className="w-20" />

          <div className="absolute inset-0 flex items-center justify-center hidden md:flex">
            <h1 className="text-xl font-bold text-yellow-500 tracking-wide">
              Welcome to TigerCookies MNL
            </h1>
          </div>

          <div className="flex ml-auto z-50">
            <a href="../testing">
              <button className="bg-blue-200 hover:bg-yellow-300 flex items-center transition-all text-base rounded-md px-4 py-2">
                Contact Admin
              </button>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
