import React, { useState } from "react";
import FpConfBody from "./fpConf_body";
import Background from "../images/background.png";
import { X, AlertTriangle, CheckCircle } from "lucide-react";

export default function ForgotPasswordConfirm() {
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

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
            <p className="text-blue-100 text-center mt-1">Create a new secure password for your account</p>
          </div>
          <FpConfBody showToast={showToast} />
        </div>
      </div>

      {toast && (
        <div
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg flex items-center ${
            toast.type === "success"
              ? "bg-green-100 text-green-800 border-l-4 border-green-500"
              : "bg-red-100 text-red-800 border-l-4 border-red-500"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5 mr-2" />
          ) : (
            <AlertTriangle className="w-5 h-5 mr-2" />
          )}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-4 text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}