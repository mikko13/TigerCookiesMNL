import React from "react";
import FPBody from "./fpBody";
import Background from "../images/background.png";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div 
        className="w-full min-h-screen flex items-center justify-center p-4"
        style={{
          backgroundImage: `url(${Background})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundBlendMode: "overlay",
        }}
      >
        <div className="max-w-md w-full bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="px-8 py-6 bg-gradient-to-r from-yellow-400 to-yellow-500">
            <h2 className="text-2xl font-bold text-white text-center">Reset Password</h2>
            <p className="text-blue-100 text-center mt-1">Enter your email to receive a verification code</p>
          </div>
          <FPBody />
        </div>
      </div>
    </div>
  );
}