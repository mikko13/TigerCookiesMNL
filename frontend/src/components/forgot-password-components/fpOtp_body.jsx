import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Background from "../images/background.png";
import { backendURL } from "../../urls/URL";

export default function FpOtpBody() {
  const inputsRef = useRef([]);
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const inputs = inputsRef.current.filter(Boolean);

    const handleKeyDown = (e, index) => {
      if (
        !/^[0-9]$/.test(e.key) &&
        e.key !== "Backspace" &&
        e.key !== "Delete"
      ) {
        e.preventDefault();
        return;
      }

      if (e.key === "Backspace" && index > 0 && !inputs[index].value) {
        inputs[index - 1].focus();
      }
    };

    const handleInput = (e, index) => {
      if (e.target.value && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
    };

    const handleFocus = (e) => e.target.select();

    const handlePaste = (e) => {
      e.preventDefault();
      const text = e.clipboardData.getData("text");
      if (!new RegExp(`^[0-9]{${inputs.length}}$`).test(text)) return;
      const digits = text.split("");
      inputs.forEach((input, index) => (input.value = digits[index] || ""));
      inputs[inputs.length - 1].focus();
    };

    inputs.forEach((input, index) => {
      input.addEventListener("input", (e) => handleInput(e, index));
      input.addEventListener("keydown", (e) => handleKeyDown(e, index));
      input.addEventListener("focus", handleFocus);
      input.addEventListener("paste", handlePaste);
    });

    return () => {
      inputs.forEach((input, index) => {
        if (input) {
          input.removeEventListener("input", (e) => handleInput(e, index));
          input.removeEventListener("keydown", (e) => handleKeyDown(e, index));
          input.removeEventListener("focus", handleFocus);
          input.removeEventListener("paste", handlePaste);
        }
      });
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const otp = inputsRef.current
      .map((input) => input?.value.trim() || "")
      .join("");

    const email = sessionStorage.getItem("emailForOTP");

    console.log("Submitting OTP:", otp, "for email:", email);

    if (!email) {
      setError("Session expired. Please request a new OTP.");
      return;
    }

    if (otp.length !== 4 || isNaN(otp)) {
      setError("Please enter a valid 4-digit OTP.");
      return;
    }

    try {
      const response = await axios.post(
        `${backendURL}/api/auth/verify-otp`,
        { email, otp }
      );

      console.log("API Response:", response.data); // Debugging log

      if (response.data.success) {
        sessionStorage.setItem("verifiedEmail", email);
        navigate("/forgotpasswordconfirm");
      } else {
        console.error("OTP Verification Failed:", response.data);
        setError(response.data.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error(
        "Error submitting OTP:",
        error.response?.data || error.message
      );
      setError(
        error.response?.data?.message ||
          "An error occurred. Please try again later."
      );
    }
  };

  return (
    <div
      className="w-full mx-auto px-4 md:px-6 py-36 min-h-screen"
      style={{
        backgroundImage: `url(${Background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex justify-center">
        <div className="max-w-md mx-auto text-center bg-white px-4 sm:px-8 py-10 rounded-xl shadow-xl">
          <header className="mb-8">
            <h1 className="text-2xl font-bold mb-1">Email Verification</h1>
            <p className="text-[15px] text-slate-500">
              Enter the 4-digit verification code that was sent to your email.
            </p>
          </header>
          <form id="otp-form" onSubmit={handleSubmit}>
            <div className="flex items-center justify-center gap-3">
              {[...Array(4)].map((_, index) => (
                <input
                  key={index}
                  ref={(el) => (inputsRef.current[index] = el)}
                  type="text"
                  className="w-14 h-14 text-center text-2xl font-extrabold text-slate-900 bg-slate-100 border border-transparent hover:border-slate-200 appearance-none rounded p-4 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  maxLength="1"
                  pattern="\d*"
                  required
                />
              ))}
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <div className="max-w-[260px] mx-auto mt-4">
              <button
                type="submit"
                className="w-full inline-flex justify-center whitespace-nowrap rounded-lg bg-yellow-300 px-3.5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-yellow-500 focus:outline-none focus:ring focus:ring-indigo-300 transition-colors duration-150"
              >
                Verify Account
              </button>
            </div>
          </form>
          <div className="text-sm text-slate-500 mt-4">
            Didn't receive code?{" "}
            <a
              className="font-medium text-yellow-400 hover:text-yellow-500"
              href="#0"
            >
              Resend
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
