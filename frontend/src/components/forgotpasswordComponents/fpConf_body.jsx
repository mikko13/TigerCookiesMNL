import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { backendURL } from "../../urls/URL";
import {
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

export default function FpConfBody({ showToast }) {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const getPasswordStrength = () => {
    if (!password) return { strength: 0, text: "", color: "bg-gray-200" };

    const validations = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password),
    ];

    const strength = validations.filter(Boolean).length;

    const strengthMap = {
      1: { text: "Very Weak", color: "bg-red-500" },
      2: { text: "Weak", color: "bg-red-400" },
      3: { text: "Fair", color: "bg-yellow-500" },
      4: { text: "Good", color: "bg-blue-500" },
      5: { text: "Strong", color: "bg-green-500" },
    };

    return {
      strength,
      text: strengthMap[strength]?.text || "",
      color: strengthMap[strength]?.color || "",
    };
  };

  const validatePassword = () => {
    if (!password) {
      setError("Password is required");
      return false;
    }

    const validationRules = {
      length: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[^A-Za-z0-9]/.test(password),
    };

    const errorMessages = [];
    if (!validationRules.length)
      errorMessages.push("Must be at least 8 characters long");
    if (!validationRules.hasUppercase)
      errorMessages.push("Must include an uppercase letter");
    if (!validationRules.hasLowercase)
      errorMessages.push("Must include a lowercase letter");
    if (!validationRules.hasNumber) errorMessages.push("Must include a number");
    if (!validationRules.hasSpecialChar)
      errorMessages.push("Must include a special character");

    if (password !== confirmPassword) {
      errorMessages.push("Passwords do not match");
    }

    if (errorMessages.length > 0) {
      setError(errorMessages.join(". "));
      return false;
    }

    setError(null);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword()) {
      return;
    }

    setIsLoading(true);
    const email = sessionStorage.getItem("verifiedEmail");

    if (!email) {
      setError("Session expired. Please request a new verification code.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${backendURL}/api/auth/reset-password`,
        {
          email,
          password,
        }
      );

      if (response.data.success) {
        sessionStorage.removeItem("verifiedEmail");
        showToast("success", "Password reset successful!");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        setError(response.data.message || "Failed to reset password.");
        showToast(
          "error",
          response.data.message || "Failed to reset password."
        );
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
      showToast("error", "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-gray-700"
          >
            New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <LockClosedIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`pl-10 pr-12 py-3 bg-white w-full text-gray-800 border ${
                error && !confirmPassword
                  ? "border-red-500 ring-1 ring-red-500"
                  : "border-gray-300"
              } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
              ) : (
                <EyeIcon className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {password && (
          <div className="space-y-1">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${passwordStrength.color}`}
                style={{ width: `${passwordStrength.strength * 20}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">{passwordStrength.text}</span>
              <span className="text-gray-500">
                {passwordStrength.strength < 5 &&
                  "Use 8+ chars, uppercase, lowercase, numbers & symbols"}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-gray-700"
          >
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <LockClosedIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`pl-10 pr-4 py-3 bg-white w-full text-gray-800 border ${
                error && password
                  ? "border-red-500 ring-1 ring-red-500"
                  : "border-gray-300"
              } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
              required
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="text-sm">{error}</p>
          </div>
        )}

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
            "Reset Password"
          )}
        </button>

        <a href="./forgotpasswordotp" className="block mt-4">
          <button
            type="button"
            className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg flex justify-center items-center gap-2 transition-all duration-200"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back
          </button>
        </a>
      </form>
    </div>
  );
}
