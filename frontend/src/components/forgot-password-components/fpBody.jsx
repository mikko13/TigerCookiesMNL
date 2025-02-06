import React, { useState } from "react";
import axios from "axios";
import "./ToastStyles.css";
import { errorToast, successToast } from "./toastMessages";

export default function FpBody() {
  const [email, setEmail] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (type) => {
    setToast(type);
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleEmailCheck = async () => {
    if (!email) {
      showToast("error");
      return;
    }

    try {
      // Step 1: Check if email exists
      const response = await axios.post("http://localhost:5000/api/employees/check-email", { email });

      if (response.data.exists) {
        // Step 2: Send OTP
        const otpResponse = await axios.post("http://localhost:5000/api/auth/send-otp", { email });

        if (otpResponse.data.success) {
          showToast("success");
          
          // Step 3: Store OTP temporarily (for demo purposes, you might store it in Redux or sessionStorage)
          sessionStorage.setItem("emailForOTP", email);
          
          setTimeout(() => {
            window.location.href = "./forgotpasswordotp";
          }, 1000);
        } else {
          showToast("error");
        }
      } else {
        showToast("error");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      showToast("error");
    }
  };

  return (
    <div className="flex-grow items-center justify-center mt-48">
      <form className="space-y-2 font-sans text-gray-800 max-w-md mx-auto md:px-8">
        <div className="relative flex items-center mb-4">
          <input
            type="email"
            placeholder="Verify Email"
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-3 bg-gray-100 focus:bg-transparent w-full text-sm border outline-blue-500 rounded-md transition-all focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="button"
          onClick={handleEmailCheck}
          className="px-6 py-3 w-full text-sm bg-yellow-400 hover:bg-yellow-500 text-white rounded-md active:bg-yellow-600 focus:ring-2 focus:ring-yellow-500 transition-all"
        >
          Submit
        </button>
        <a href="./">
          <button
            type="button"
            className="px-6 py-3 mt-2 w-full text-sm bg-gray-700 hover:bg-gray-800 text-white rounded-md active:bg-gray-900 focus:ring-2 focus:ring-gray-900 transition-all"
          >
            Back
          </button>
        </a>

        {toast === "error" && <div className="z-50 fixed bottom-4 left-4">{errorToast}</div>}
        {toast === "success" && <div className="z-50 fixed bottom-4 left-4">{successToast}</div>}
      </form>
    </div>
  );
}
