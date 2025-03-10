import React, { useState, useEffect } from "react";
import { useLoginState } from "./loginConstants";
import { errorToast, successToast } from "./toastMessages";
import PrivacyPolicyModal from "./privacypolicyModal";

export default function LoginForm() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    togglePasswordVisibility,
    handleLogin,
    error,
    success,
  } = useLoginState();

  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [fadeEffect, setFadeEffect] = useState(false);

  const openModal = () => {
    setShowPrivacyPolicy(true);
    setTimeout(() => setFadeEffect(true), 50);
  };

  const closeModal = () => {
    setFadeEffect(false);
    setTimeout(() => setShowPrivacyPolicy(false), 300);
  };

  return (
    <div className="border bg-[#ffffff] border-gray-300 rounded-lg p-6 max-w-md shadow-lg max-md:mx-auto">
      <form className="space-y-4" onSubmit={handleLogin}>
        <div className="mb-8">
          <h3 className="text-gray-800 text-3xl font-bold">Sign in</h3>
          <p className="text-gray-500 text-sm mt-4">Sign in to your account</p>
        </div>

        <div>
          <label htmlFor="email" className="text-gray-800 text-sm mb-2 block">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full text-sm text-gray-800 border border-gray-300 pl-4 pr-10 py-3 rounded-lg outline-blue-600"
            placeholder="Enter Email Address"
          />
        </div>

        <div className="relative">
          <label
            htmlFor="password"
            className="text-gray-800 text-sm mb-2 block"
          >
            Password
          </label>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 mt-7"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 mt-7"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                />
              </svg>
            )}
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={openModal}
            className="text-sm text-yellow-400 hover:underline"
          >
            Privacy Policy
          </button>

          <div className="text-sm">
            <a
              href="./forgotpassword"
              className="text-yellow-400 hover:underline font-semibold"
            >
              Forgot your password?
            </a>
          </div>
        </div>

        <button
          type="submit"
          className="w-full shadow-xl py-2.5 px-4 mt-3 text-sm tracking-wide rounded-lg text-white bg-yellow-400 hover:bg-yellow-500"
        >
          Sign in
        </button>
      </form>

      {error && errorToast}
      {success && successToast}

      <PrivacyPolicyModal
        show={showPrivacyPolicy}
        fadeEffect={fadeEffect}
        closeModal={closeModal}
      />
    </div>
  );
}
