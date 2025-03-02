import React, { useState } from "react";
import { UserCircle, Upload, Check, AlertCircle } from "lucide-react";

export default function CreateAccountForm() {
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);


  return (
    <div className="w-full max-w-6xl mx-auto p-6 font-sans bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
        Create New Employee Account
      </h1>

      <form className="space-y-8">
        <div className="flex flex-col md:flex-row gap-8">

          {/* Form Fields Section */}
          <div className="flex-1">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="Enter first name"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-300 focus:border-transparent outline-none transition"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Enter last name"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-300 focus:border-transparent outline-none transition"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="employee@company.com"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-300 focus:border-transparent outline-none transition"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-300 focus:border-transparent outline-none transition"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    placeholder="Enter address"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-300 focus:border-transparent outline-none transition"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Gender
                  </label>
                  <select
                    name="gender"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-300 focus:border-transparent outline-none transition bg-white"
                  >
                    <option value="" disabled>
                      Select Gender
                    </option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-300 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mt-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Employment Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Hired Date
                  </label>
                  <input
                    type="date"
                    name="hiredDate"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-300 focus:border-transparent outline-none transition"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Position
                  </label>
                  <select
                    name="position"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-300 focus:border-transparent outline-none transition bg-white"
                  >
                    <option value="" disabled>
                      Select Position
                    </option>
                    <option value="Sole Proprietor">Sole Proprietor</option>
                    <option value="Business Development Manager">
                      Business Development Manager
                    </option>
                    <option value="Operations Manager">
                      Operations Manager
                    </option>
                    <option value="Branch Manager">Branch Manager</option>
                    <option value="Sales Assistant">Sales Assistant</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Rate Per Hour
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      name="ratePerHour"
                      placeholder="0.00"
                      className="w-full pl-8 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-300 focus:border-transparent outline-none transition"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Shift
                  </label>
                  <select
                    name="shift"

                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-300 focus:border-transparent outline-none transition bg-white"
                  >
                    <option value="" disabled>
                      Select Shift
                    </option>
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Night">Night</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <button
            type="button"
            className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 mr-4 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2.5 rounded-lg bg-yellow-400 text-white font-medium flex items-center gap-2 hover:bg-yellow-500 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 ${
              loading ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </div>
      </form>

      {/* Toast Notifications */}
      {toast?.type === "success" && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-in slide-in-from-bottom">
          <Check size={20} />
          <span>Account created successfully!</span>
        </div>
      )}

      {toast?.type === "error" && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-in slide-in-from-bottom">
          <AlertCircle size={20} />
          <span>Error creating account. Please try again.</span>
        </div>
      )}
    </div>
  );
}
