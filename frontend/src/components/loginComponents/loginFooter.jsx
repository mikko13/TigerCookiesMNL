import React from "react";
import Logo from "../images/logo.png";

export default function LoginFooter() {
  return (
    <footer className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 py-6 px-8 font-sans shadow-inner">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex flex-wrap items-center md:justify-between max-md:flex-col gap-6">
          <div className="transform hover:scale-105 transition-transform duration-300">
            <img src={Logo} alt="TigerCookies MNL" className="w-28" />
          </div>

          <ul className="flex items-center justify-center flex-wrap gap-y-3 md:justify-end space-x-8">
            <li>
              <a
                href="https://www.facebook.com/TigerCookies.Mnl/"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-2 bg-yellow-200 rounded-full hover:bg-yellow-100 transition-all duration-300 hover:shadow-lg"
              >
                <svg
                  className="h-6 w-6 text-yellow-800"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" />
                  <path d="M7 10v4h3v7h4v-7h3l1 -4h-4v-2a1 1 0 0 1 1 -1h3v-4h-3a5 5 0 0 0 -5 5v2h-3" />
                </svg>
              </a>
            </li>
            <li>
              <a
                href="https://www.instagram.com/tigercookies.mnl/"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-2 bg-yellow-200 rounded-full hover:bg-yellow-100 transition-all duration-300 hover:shadow-lg"
              >
                <svg
                  className="h-6 w-6 text-yellow-800"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" />
                  <rect x="4" y="4" width="16" height="16" rx="4" />
                  <circle cx="12" cy="12" r="3" />
                  <line x1="16.5" y1="7.5" x2="16.5" y2="7.501" />
                </svg>
              </a>
            </li>
            <li>
              <a
                href="https://www.tiktok.com/@tigercookiesmnl"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-2 bg-yellow-200 rounded-full hover:bg-yellow-100 transition-all duration-300 hover:shadow-lg"
              >
                <span className="[&>svg]:h-5 [&>svg]:w-5 [&>svg]:text-yellow-800">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 448 512"
                  >
                    <path d="M448 209.9a210.1 210.1 0 0 1 -122.8-39.3V349.4A162.6 162.6 0 1 1 185 188.3V278.2a74.6 74.6 0 1 0 52.2 71.2V0l88 0a121.2 121.2 0 0 0 1.9 22.2h0A122.2 122.2 0 0 0 381 102.4a121.4 121.4 0 0 0 67 20.1z" />
                  </svg>
                </span>
              </a>
            </li>
          </ul>
        </div>

        <hr className="my-6 border-yellow-600 opacity-30" />

        <p className="text-center text-yellow-900 font-medium text-base">
          © {new Date().getFullYear()} Tiger Cookies MNL. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
