import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { backendURL } from "../../urls/URL";

export default function FpConfBody() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = sessionStorage.getItem("verifiedEmail");

    if (!email) {
      setError("Session expired. Please request a new OTP.");
      return;
    }

    if (!password || !confirmPassword) {
      setError("Both password fields are required.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post(`${backendURL}/api/auth/reset-password`, {
        email,
        password,
      });

      if (response.data.success) {
        sessionStorage.removeItem("verifiedEmail"); 
        alert("Password changed successfully. You can now log in.");
        navigate("/login");
      } else {
        setError(response.data.message || "Failed to reset password.");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 font-sans text-gray-800 max-w-md mx-auto px-4 sm:px-6 md:px-8 mt-12">
      <div className="relative flex items-center mb-4">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-4 py-3 bg-gray-100 focus:bg-transparent w-full text-sm border outline-blue-500 rounded-md transition-all focus:ring-2 focus:ring-blue-500"
          required
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {showPassword ? "👁️" : "🙈"}
        </button>
      </div>

      <div className="relative flex items-center mb-4">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="px-4 py-3 bg-gray-100 focus:bg-transparent w-full text-sm border outline-blue-500 rounded-md transition-all focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button type="submit" className="px-6 py-3 mt-6 w-full text-sm bg-yellow-400 hover:bg-yellow-500 text-white rounded-md transition-all">
        Submit
      </button>

      <a href="./forgotpasswordotp">
        <button
          type="button"
          className="px-6 py-3 mt-2 w-full text-sm bg-gray-700 hover:bg-gray-800 text-white rounded-md transition-all"
        >
          Back
        </button>
      </a>
    </form>
  );
}
