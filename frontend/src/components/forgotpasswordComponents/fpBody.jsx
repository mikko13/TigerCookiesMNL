import React, { useState } from "react";
import axios from "axios";
import "./ToastStyles.css";
import { backendURL } from "../../urls/URL";
import { EnvelopeIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function FPBody({ showToast }) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const validateEmail = () => {
    if (!email) {
      setEmailError("Email is required");
      return false;
    }
    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleEmailCheck = async (e) => {
    e.preventDefault();

    if (!validateEmail()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${backendURL}/api/employees/check-email`,
        { email }
      );

      if (response.data.exists) {
        const otpResponse = await axios.post(
          `${backendURL}/api/auth/send-otp`,
          { email }
        );

        if (otpResponse.data.success) {
          showToast("success", "Verification code sent successfully!");
          sessionStorage.setItem("emailForOTP", email);

          setTimeout(() => {
            window.location.href = "./forgotpasswordotp";
          }, 1000);
        } else {
          showToast(
            "error",
            "Failed to send verification code. Please try again."
          );
        }
      } else {
        setEmailError("Email not found in our records");
        showToast("error", "Email not found in our records");
      }
    } catch (error) {
      showToast("error", "An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <form onSubmit={handleEmailCheck} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <EnvelopeIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              type="email"
              placeholder="your-email@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) validateEmail();
              }}
              className={`pl-10 pr-4 py-3 bg-white w-full text-gray-800 border ${
                emailError
                  ? "border-red-500 ring-1 ring-red-500"
                  : "border-gray-300"
              } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
            />
          </div>
          {emailError && (
            <p className="text-red-500 text-xs mt-1">{emailError}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 transition-all duration-200 flex justify-center items-center"
        >
          {isLoading ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            "Send Verification Code"
          )}
        </button>

        <a href="./" className="block mt-4">
          <button
            type="button"
            className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg flex justify-center items-center gap-2 transition-all duration-200"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Login
          </button>
        </a>
      </form>
    </div>
  );
}
