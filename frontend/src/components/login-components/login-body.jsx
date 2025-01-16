import React, { useState } from "react";
import sidepic from "../images/login-sidepic.svg";

export default function LoginBody() {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  return (
    <main className="font-[sans-serif]">
      <div className="mt-1 md:mt-[-70px] min-h-screen flex flex-col items-center justify-center py-6 px-4">
        <div className="grid md:grid-cols-2 items-center gap-6 max-w-6xl w-full">
          {/* Left Side - Form */}
          <div className="border border-gray-300 rounded-lg p-6 max-w-md shadow-[0_2px_22px_-4px_rgba(93,96,127,0.2)] max-md:mx-auto">
            <form className="space-y-4">
              <div className="mb-8">
                <h3 className="text-gray-800 text-3xl font-bold">Sign in</h3>
                <p className="text-gray-500 text-sm mt-4 leading-relaxed">
                  Sign in to your account
                </p>
              </div>

              {/* Username Field */}
              <div>
                <label
                  htmlFor="username"
                  className="text-gray-800 text-sm mb-2 block"
                >
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="w-full text-sm text-gray-800 border border-gray-300 pl-4 pr-10 py-3 rounded-lg outline-blue-600"
                  placeholder="Enter username"
                />
              </div>

              <div className="relative">
                <label htmlFor="password" className="text-gray-800 text-sm mb-2 block">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full text-sm text-gray-800 border border-gray-300 pl-4 pr-10 py-3 rounded-lg outline-blue-600"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-4 top-3 text-gray-500 hover:text-gray-700"
>
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223a10.477 10.477 0 0116.04 0M1.5 12c1.272-2.18 3.276-4 6.186-4.905M12 15.5c2.209 0 4-2.015 4-4.5s-1.791-4.5-4-4.5c-1.506 0-2.823.998-3.524 2.342m7.048 6.158a6.482 6.482 0 01-7.048 0M12 19c-5.177 0-9.64-2.94-11.5-7.5C2.36 7.44 6.823 4.5 12 4.5c5.178 0 9.64 2.94 11.5 7.5-.97 2.445-2.455 4.24-4.263 5.425"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223a10.477 10.477 0 0116.04 0M1.5 12c1.272-2.18 3.276-4 6.186-4.905M12 15.5c2.209 0 4-2.015 4-4.5s-1.791-4.5-4-4.5c-1.506 0-2.823.998-3.524 2.342m7.048 6.158a6.482 6.482 0 01-7.048 0M12 19c-5.177 0-9.64-2.94-11.5-7.5C2.36 7.44 6.823 4.5 12 4.5c5.178 0 9.64 2.94 11.5 7.5-.97 2.445-2.455 4.24-4.263 5.425"
                      />
                    </svg>
                  )}
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 shrink-0 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-3 block text-sm text-gray-800">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="./forgotpassword" className="text-yellow-400 hover:underline font-semibold">
                    Forgot your password?
                  </a>
                </div>
              </div>

              <button type="submit" className="w-full shadow-xl py-2.5 px-4 text-sm tracking-wide rounded-lg text-white bg-yellow-400 hover:bg-yellow-500 focus:outline-none">
                Sign in
              </button>
            </form>
          </div>

          <div className="max-md:mt-8 hidden md:flex">
            <img
              src={sidepic}
              className="w-5/6 max-md:w-2/3 mx-auto block object-cover"
              alt="Login"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
