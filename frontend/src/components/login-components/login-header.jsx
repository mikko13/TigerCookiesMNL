import React from 'react';
import Logo from '../images/logo.png';

export default function Header() {
  return (
    <header className="flex items-center w-full px-4 sm:px-8 min-h-[80px] bg-white tracking-wide sticky top-0 z-50 shadow-[rgba(0,0,0,0.1)_-4px_9px_25px_-6px] font-[sans-serif]">
      <div className="relative w-full">
        <div className="max-w-screen-xl w-full mx-auto flex flex-wrap items-center gap-4 justify-center">
          <img src={Logo} alt="logo" className="w-20" />

          <div className="absolute inset-0 flex items-center justify-center hidden md:flex">
            <h1 className="text-xl font-bold text-yellow-500 tracking-wide">
              Welcome to TigerCookies MNL
            </h1>
          </div>

          <div className="flex ml-auto">
            <button
              className="bg-yellow-200 hover:bg-yellow-300 flex items-center transition-all text-base rounded-md px-4 py-2">
              Contact Admin
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-[14px] fill-current ml-2"
                viewBox="0 0 492.004 492.004">
                <path
                  d="M484.14 226.886 306.46 49.202c-5.072-5.072-11.832-7.856-19.04-7.856-7.216 0-13.972 2.788-19.044 7.856l-16.132 16.136c-5.068 5.064-7.86 11.828-7.86 19.04 0 7.208 2.792 14.2 7.86 19.264L355.9 207.526H26.58C11.732 207.526 0 219.15 0 234.002v22.812c0 14.852 11.732 27.648 26.58 27.648h330.496L252.248 388.926c-5.068 5.072-7.86 11.652-7.86 18.864 0 7.204 2.792 13.88 7.86 18.948l16.132 16.084c5.072 5.072 11.828 7.836 19.044 7.836 7.208 0 13.968-2.8 19.04-7.872l177.68-177.68c5.084-5.088 7.88-11.88 7.86-19.1.016-7.244-2.776-14.04-7.864-19.12z"
                  data-original="#000000"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
